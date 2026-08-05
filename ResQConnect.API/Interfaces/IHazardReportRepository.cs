using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface IHazardReportRepository : IRepository<HazardReport>
    {
        Task<IEnumerable<HazardReport>> GetAllWithDetailsAsync();
        Task<HazardReport?> GetByIdWithDetailsAsync(int id);
    }
}
