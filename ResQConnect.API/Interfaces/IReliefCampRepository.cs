using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface IReliefCampRepository : IRepository<ReliefCamp>
    {
        Task<IEnumerable<ReliefCamp>> GetCampsWithDetailsAsync();
        Task<IEnumerable<ReliefCamp>> GetCampsByDisasterIdAsync(int disasterId);
        Task<ReliefCamp?> GetCampWithDetailsAsync(int id);
    }
}

