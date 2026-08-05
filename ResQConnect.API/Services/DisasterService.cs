using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Services
{
    public class DisasterService : IDisasterService
    {
        private readonly IDisasterRepository _disasterRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;

        public DisasterService(
            IDisasterRepository disasterRepository,
            INotificationService notificationService,
            IMapper mapper)
        {
            _disasterRepository = disasterRepository;
            _notificationService = notificationService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<DisasterDto>> GetAllDisastersAsync()
        {
            var disasters = await _disasterRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<DisasterDto>>(disasters.OrderByDescending(d => d.CreatedAt));
        }

        public async Task<IEnumerable<DisasterDto>> GetActiveDisastersAsync()
        {
            var disasters = await _disasterRepository.GetActiveDisastersAsync();
            return _mapper.Map<IEnumerable<DisasterDto>>(disasters);
        }

        public async Task<DisasterDto?> GetDisasterByIdAsync(int id)
        {
            var disaster = await _disasterRepository.GetDisasterWithDetailsAsync(id);
            if (disaster == null) return null;
            return _mapper.Map<DisasterDto>(disaster);
        }

        public async Task<DisasterDto> CreateDisasterAsync(CreateDisasterDto createDto, int createdByUserId)
        {
            var disaster = _mapper.Map<Disaster>(createDto);
            disaster.CreatedBy = createdByUserId;
            disaster.CreatedAt = DateTime.UtcNow;

            await _disasterRepository.AddAsync(disaster);
            await _disasterRepository.SaveChangesAsync();

            // Broadcast alert to all users
            await _notificationService.SendNotificationToAllAsync(
                $"URGENT: New Disaster Alert - {disaster.Title}",
                $"A new {disaster.Type} ({disaster.Severity} severity) has been logged. Please stay safe and check active camps for shelter. Details: {disaster.Description}."
            );

            // Fetch with details to map creator name
            var savedDisaster = await _disasterRepository.GetDisasterWithDetailsAsync(disaster.Id);
            return _mapper.Map<DisasterDto>(savedDisaster);
        }

        public async Task<DisasterDto?> UpdateDisasterAsync(int id, CreateDisasterDto updateDto)
        {
            var disaster = await _disasterRepository.GetByIdAsync(id);
            if (disaster == null) return null;

            _mapper.Map(updateDto, disaster);
            _disasterRepository.Update(disaster);
            await _disasterRepository.SaveChangesAsync();

            var savedDisaster = await _disasterRepository.GetDisasterWithDetailsAsync(disaster.Id);
            return _mapper.Map<DisasterDto>(savedDisaster);
        }

        public async Task<bool> CloseDisasterAsync(int id)
        {
            var disaster = await _disasterRepository.GetByIdAsync(id);
            if (disaster == null) return false;

            disaster.Status = "Closed";
            disaster.EndDate = DateTime.UtcNow;
            _disasterRepository.Update(disaster);
            
            var success = await _disasterRepository.SaveChangesAsync();
            if (success)
            {
                await _notificationService.SendNotificationToAllAsync(
                    $"Advisory Update: Disaster Resolved",
                    $"The disaster '{disaster.Title}' has been marked as closed/contained. Relief camps may begin transitioning."
                );
            }
            return success;
        }

        public async Task<bool> DeleteDisasterAsync(int id)
        {
            var disaster = await _disasterRepository.GetByIdAsync(id);
            if (disaster == null) return false;

            _disasterRepository.Delete(disaster);
            return await _disasterRepository.SaveChangesAsync();
        }

        public async Task<PagedResult<DisasterDto>> GetDisastersFilteredAsync(
            string? searchTerm, string? type, string? severity, string? status, 
            int pageNumber, int pageSize, string? sortBy, bool sortDescending)
        {
            var (items, totalCount) = await _disasterRepository.GetDisastersFilteredAsync(
                searchTerm, type, severity, status, pageNumber, pageSize, sortBy, sortDescending);

            return new PagedResult<DisasterDto>
            {
                Items = _mapper.Map<IEnumerable<DisasterDto>>(items),
                TotalItems = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<object> GetDisasterStatsAsync()
        {
            var disasters = await _disasterRepository.GetAllAsync();
            var total = disasters.Count();
            var active = disasters.Count(d => d.Status.Equals("Active", StringComparison.OrdinalIgnoreCase));
            var closed = disasters.Count(d => d.Status.Equals("Closed", StringComparison.OrdinalIgnoreCase));
            
            return new
            {
                TotalDisasters = total,
                ActiveDisasters = active,
                ClosedDisasters = closed,
                LatestDisasters = _mapper.Map<IEnumerable<DisasterDto>>(disasters.OrderByDescending(d => d.CreatedAt).Take(5))
            };
        }
    }
}

