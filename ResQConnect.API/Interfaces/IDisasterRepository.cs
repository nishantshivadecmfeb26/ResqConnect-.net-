using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface IDisasterRepository : IRepository<Disaster>
    {
        Task<IEnumerable<Disaster>> GetActiveDisastersAsync();
        Task<Disaster?> GetDisasterWithDetailsAsync(int id);
        Task<(IEnumerable<Disaster> Items, int TotalCount)> GetDisastersFilteredAsync(string? searchTerm, string? type, string? severity, string? status, int pageNumber, int pageSize, string? sortBy, bool sortDescending);
    }
}

