using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Services
{
    public class CampService : ICampService
    {
        private readonly IReliefCampRepository _campRepository;
        private readonly IRepository<Resource> _resourceRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;

        public CampService(
            IReliefCampRepository campRepository,
            IRepository<Resource> resourceRepository,
            INotificationService notificationService,
            IMapper mapper)
        {
            _campRepository = campRepository;
            _resourceRepository = resourceRepository;
            _notificationService = notificationService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ReliefCampDto>> GetAllCampsAsync()
        {
            var camps = await _campRepository.GetCampsWithDetailsAsync();
            return _mapper.Map<IEnumerable<ReliefCampDto>>(camps);
        }

        public async Task<IEnumerable<ReliefCampDto>> GetCampsByDisasterIdAsync(int disasterId)
        {
            var camps = await _campRepository.GetCampsByDisasterIdAsync(disasterId);
            return _mapper.Map<IEnumerable<ReliefCampDto>>(camps);
        }

        public async Task<ReliefCampDto?> GetCampByIdAsync(int id)
        {
            var camp = await _campRepository.GetCampWithDetailsAsync(id);
            if (camp == null) return null;
            return _mapper.Map<ReliefCampDto>(camp);
        }

        public async Task<ReliefCampDto> CreateCampAsync(CreateCampDto createDto)
        {
            var camp = _mapper.Map<ReliefCamp>(createDto);
            await _campRepository.AddAsync(camp);
            await _campRepository.SaveChangesAsync();

            var savedCamp = await _campRepository.GetCampWithDetailsAsync(camp.Id);
            return _mapper.Map<ReliefCampDto>(savedCamp);
        }

        public async Task<ReliefCampDto?> UpdateCampAsync(int id, CreateCampDto updateDto)
        {
            var camp = await _campRepository.GetByIdAsync(id);
            if (camp == null) return null;

            _mapper.Map(updateDto, camp);
            _campRepository.Update(camp);
            await _campRepository.SaveChangesAsync();

            var savedCamp = await _campRepository.GetCampWithDetailsAsync(camp.Id);
            return _mapper.Map<ReliefCampDto>(savedCamp);
        }

        public async Task<bool> CloseCampAsync(int id)
        {
            var camp = await _campRepository.GetByIdAsync(id);
            if (camp == null) return false;

            _campRepository.Delete(camp);
            return await _campRepository.SaveChangesAsync();
        }

        // Resource Management
        public async Task<IEnumerable<ResourceDto>> GetResourcesByCampIdAsync(int campId)
        {
            var resources = await _resourceRepository.FindAsync(r => r.CampId == campId);
            return _mapper.Map<IEnumerable<ResourceDto>>(resources);
        }

        public async Task<ResourceDto?> GetResourceByIdAsync(int id)
        {
            var resources = await _resourceRepository.FindAsync(r => r.Id == id);
            var resource = resources.FirstOrDefault();
            if (resource == null) return null;

            // Load camp info manually since repository is generic
            var camp = await _campRepository.GetByIdAsync(resource.CampId);
            resource.ReliefCamp = camp;

            return _mapper.Map<ResourceDto>(resource);
        }

        public async Task<ResourceDto> AddResourceAsync(CreateResourceDto createDto)
        {
            var resource = _mapper.Map<Resource>(createDto);
            resource.UpdatedAt = DateTime.UtcNow;

            await _resourceRepository.AddAsync(resource);
            await _resourceRepository.SaveChangesAsync();

            var camp = await _campRepository.GetByIdAsync(resource.CampId);
            resource.ReliefCamp = camp;

            var resultDto = _mapper.Map<ResourceDto>(resource);

            // Check if resource is immediately in low stock
            if (resultDto.IsLowStock)
            {
                await TriggerLowStockNotification(resultDto);
            }

            return resultDto;
        }

        public async Task<ResourceDto?> UpdateResourceAsync(int id, int quantity)
        {
            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource == null) return null;

            resource.Quantity = quantity;
            resource.UpdatedAt = DateTime.UtcNow;

            _resourceRepository.Update(resource);
            await _resourceRepository.SaveChangesAsync();

            var camp = await _campRepository.GetByIdAsync(resource.CampId);
            resource.ReliefCamp = camp;

            var resultDto = _mapper.Map<ResourceDto>(resource);

            if (resultDto.IsLowStock)
            {
                await TriggerLowStockNotification(resultDto);
            }

            return resultDto;
        }

        public async Task<bool> DeleteResourceAsync(int id)
        {
            var resource = await _resourceRepository.GetByIdAsync(id);
            if (resource == null) return false;

            _resourceRepository.Delete(resource);
            return await _resourceRepository.SaveChangesAsync();
        }

        private async Task TriggerLowStockNotification(ResourceDto resourceDto)
        {
            string title = $"LOW STOCK ALERT: {resourceDto.Name} Shortage";
            string msg = $"The inventory level of '{resourceDto.Name}' in relief camp '{resourceDto.CampName}' has reached {resourceDto.Quantity} {resourceDto.Unit}, falling below the threshold of {resourceDto.ThresholdQuantity}. Requesting immediate supply dispatch.";

            // Send notification to NGO and Admins
            await _notificationService.SendNotificationToRoleAsync(3, title, msg); // NGO
            await _notificationService.SendNotificationToRoleAsync(5, title, msg); // Admin
        }
    }
}

