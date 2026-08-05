using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface ISOSRequestRepository : IRepository<SOSRequest>
    {
        Task<IEnumerable<SOSRequest>> GetSOSRequestsWithDetailsAsync();
        Task<IEnumerable<SOSRequest>> GetSOSRequestsByUserIdAsync(int userId);
        Task<IEnumerable<SOSRequest>> GetSOSRequestsByDisasterIdAsync(int disasterId);
    }
}

