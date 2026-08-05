using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Repositories
{
    public class HazardReportRepository : Repository<HazardReport>, IHazardReportRepository
    {
        public HazardReportRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<HazardReport>> GetAllWithDetailsAsync()
        {
            return await _context.HazardReports
                .Include(h => h.Reporter)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();
        }

        public async Task<HazardReport?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.HazardReports
                .Include(h => h.Reporter)
                .FirstOrDefaultAsync(h => h.Id == id);
        }
    }
}
