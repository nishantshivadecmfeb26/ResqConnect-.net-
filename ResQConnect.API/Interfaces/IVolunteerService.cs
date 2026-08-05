using ResQConnect.API.DTOs;
using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface IVolunteerService
    {
        // Volunteer profiles
        Task<IEnumerable<VolunteerDto>> GetAllVolunteersAsync();
        Task<VolunteerDto?> GetVolunteerByIdAsync(int id);
        Task<VolunteerDto?> GetVolunteerByUserIdAsync(int userId);
        Task<VolunteerDto?> UpdateProfileAsync(int userId, UpdateVolunteerProfileDto updateDto);
        Task<VolunteerDto?> VerifyVolunteerAsync(int id, VerifyVolunteerDto verifyDto);

        // Task operations
        Task<IEnumerable<TaskDto>> GetAllTasksAsync();
        Task<IEnumerable<TaskDto>> GetTasksByVolunteerIdAsync(int volunteerId);
        Task<IEnumerable<TaskDto>> GetTasksByCampIdAsync(int campId);
        Task<TaskDto?> GetTaskByIdAsync(int id);
        Task<TaskDto> CreateTaskAsync(CreateTaskDto createDto);
        Task<TaskDto?> UpdateTaskStatusAsync(int id, string status, int? volunteerId);
        Task<TaskEntity?> GetTaskEntityByIdAsync(int id);
        Task<TaskDto?> UpdateTaskProgressAsync(TaskEntity task);
    }
}

