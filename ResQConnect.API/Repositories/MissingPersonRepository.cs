using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Repositories
{
    public class MissingPersonRepository : Repository<MissingPerson>, IMissingPersonRepository
    {
        public MissingPersonRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<MissingPerson>> GetMissingPersonsWithDetailsAsync()
        {
            return await _context.MissingPersons
                .Include(m => m.Reporter)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<MissingPerson>> GetMissingPersonsByReporterIdAsync(int reporterId)
        {
            return await _context.MissingPersons
                .Where(m => m.ReporterId == reporterId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }
    }
}

