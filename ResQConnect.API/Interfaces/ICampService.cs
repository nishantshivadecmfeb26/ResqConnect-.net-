using ResQConnect.API.DTOs;

namespace ResQConnect.API.Interfaces
{
    public interface ICampService
    {
        // Camp management
        Task<IEnumerable<ReliefCampDto>> GetAllCampsAsync();
        Task<IEnumerable<ReliefCampDto>> GetCampsByDisasterIdAsync(int disasterId);
        Task<ReliefCampDto?> GetCampByIdAsync(int id);
        Task<ReliefCampDto> CreateCampAsync(CreateCampDto createDto);
        Task<ReliefCampDto?> UpdateCampAsync(int id, CreateCampDto updateDto);
        Task<bool> CloseCampAsync(int id);

        // Resource management
        Task<IEnumerable<ResourceDto>> GetResourcesByCampIdAsync(int campId);
        Task<ResourceDto?> GetResourceByIdAsync(int id);
        Task<ResourceDto> AddResourceAsync(CreateResourceDto createDto);
        Task<ResourceDto?> UpdateResourceAsync(int id, int quantity);
        Task<bool> DeleteResourceAsync(int id);
    }
}

