using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface ITaskRepository : IRepository<TaskEntity>
    {
        Task<IEnumerable<TaskEntity>> GetTasksWithDetailsAsync();
        Task<IEnumerable<TaskEntity>> GetTasksByVolunteerIdAsync(int volunteerId);
        Task<IEnumerable<TaskEntity>> GetTasksByCampIdAsync(int campId);
    }
}

