using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Repositories
{
    public class TaskRepository : Repository<TaskEntity>, ITaskRepository
    {
        public TaskRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<TaskEntity>> GetTasksWithDetailsAsync()
        {
            return await _context.Tasks
                .Include(t => t.ReliefCamp)
                .Include(t => t.Volunteer)
                    .ThenInclude(v => v!.User)
                .OrderByDescending(t => t.AssignedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskEntity>> GetTasksByVolunteerIdAsync(int volunteerId)
        {
            return await _context.Tasks
                .Include(t => t.ReliefCamp)
                .Where(t => t.VolunteerId == volunteerId)
                .OrderByDescending(t => t.AssignedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskEntity>> GetTasksByCampIdAsync(int campId)
        {
            return await _context.Tasks
                .Include(t => t.Volunteer)
                    .ThenInclude(v => v!.User)
                .Where(t => t.CampId == campId)
                .OrderByDescending(t => t.AssignedDate)
                .ToListAsync();
        }
    }
}

