using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Repositories
{
    public class VolunteerRepository : Repository<Volunteer>, IVolunteerRepository
    {
        public VolunteerRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Volunteer?> GetVolunteerByUserIdAsync(int userId)
        {
            return await _context.Volunteers
                .Include(v => v.User)
                .Include(v => v.AssignedNGO)
                .FirstOrDefaultAsync(v => v.UserId == userId);
        }

        public async Task<IEnumerable<Volunteer>> GetAllVolunteersWithDetailsAsync()
        {
            return await _context.Volunteers
                .Include(v => v.User)
                .Include(v => v.AssignedNGO)
                .ToListAsync();
        }

        public async Task<Volunteer?> GetVolunteerWithTasksAsync(int id)
        {
            return await _context.Volunteers
                .Include(v => v.User)
                .Include(v => v.AssignedNGO)
                .Include(v => v.Tasks)
                    .ThenInclude(t => t.ReliefCamp)
                .FirstOrDefaultAsync(v => v.Id == id);
        }
    }
}

