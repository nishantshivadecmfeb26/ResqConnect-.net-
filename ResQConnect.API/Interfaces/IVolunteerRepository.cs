using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface IVolunteerRepository : IRepository<Volunteer>
    {
        Task<Volunteer?> GetVolunteerByUserIdAsync(int userId);
        Task<IEnumerable<Volunteer>> GetAllVolunteersWithDetailsAsync();
        Task<Volunteer?> GetVolunteerWithTasksAsync(int id);
    }
}

