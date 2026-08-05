using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Repositories
{
    public class ReliefCampRepository : Repository<ReliefCamp>, IReliefCampRepository
    {
        public ReliefCampRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ReliefCamp>> GetCampsWithDetailsAsync()
        {
            return await _context.ReliefCamps
                .Include(c => c.Disaster)
                .Include(c => c.Resources)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReliefCamp>> GetCampsByDisasterIdAsync(int disasterId)
        {
            return await _context.ReliefCamps
                .Include(c => c.Resources)
                .Where(c => c.DisasterId == disasterId)
                .ToListAsync();
        }

        public async Task<ReliefCamp?> GetCampWithDetailsAsync(int id)
        {
            return await _context.ReliefCamps
                .Include(c => c.Disaster)
                .Include(c => c.Resources)
                .Include(c => c.Tasks)
                    .ThenInclude(t => t.Volunteer)
                        .ThenInclude(v => v.User)
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}

