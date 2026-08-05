using ResQConnect.API.DTOs;

namespace ResQConnect.API.Interfaces
{
    public interface IDisasterService
    {
        Task<IEnumerable<DisasterDto>> GetAllDisastersAsync();
        Task<IEnumerable<DisasterDto>> GetActiveDisastersAsync();
        Task<DisasterDto?> GetDisasterByIdAsync(int id);
        Task<DisasterDto> CreateDisasterAsync(CreateDisasterDto createDto, int createdByUserId);
        Task<DisasterDto?> UpdateDisasterAsync(int id, CreateDisasterDto updateDto);
        Task<bool> CloseDisasterAsync(int id);
        Task<bool> DeleteDisasterAsync(int id);
        Task<PagedResult<DisasterDto>> GetDisastersFilteredAsync(string? searchTerm, string? type, string? severity, string? status, int pageNumber, int pageSize, string? sortBy, bool sortDescending);
        Task<object> GetDisasterStatsAsync();
    }
}

