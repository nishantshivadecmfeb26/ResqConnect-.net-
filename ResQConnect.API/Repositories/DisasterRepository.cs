using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Repositories
{
    public class DisasterRepository : Repository<Disaster>, IDisasterRepository
    {
        public DisasterRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Disaster>> GetActiveDisastersAsync()
        {
            return await _context.Disasters
                .Include(d => d.Creator)
                .Where(d => d.Status.ToLower() == "active")
                .ToListAsync();
        }

        public async Task<Disaster?> GetDisasterWithDetailsAsync(int id)
        {
            return await _context.Disasters
                .Include(d => d.Creator)
                .Include(d => d.SOSRequests)
                .Include(d => d.ReliefCamps)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<(IEnumerable<Disaster> Items, int TotalCount)> GetDisastersFilteredAsync(
            string? searchTerm, string? type, string? severity, string? status, 
            int pageNumber, int pageSize, string? sortBy, bool sortDescending)
        {
            var query = _context.Disasters.Include(d => d.Creator).AsQueryable();

            // Search
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(d => d.Title.Contains(searchTerm) || d.Description.Contains(searchTerm));
            }

            // Filtering
            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where(d => d.Type == type);
            }
            if (!string.IsNullOrWhiteSpace(severity))
            {
                query = query.Where(d => d.Severity == severity);
            }
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(d => d.Status == status);
            }

            // Count
            var totalCount = await query.CountAsync();

            // Sorting
            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "title":
                        query = sortDescending ? query.OrderByDescending(d => d.Title) : query.OrderBy(d => d.Title);
                        break;
                    case "severity":
                        query = sortDescending ? query.OrderByDescending(d => d.Severity) : query.OrderBy(d => d.Severity);
                        break;
                    case "status":
                        query = sortDescending ? query.OrderByDescending(d => d.Status) : query.OrderBy(d => d.Status);
                        break;
                    case "startdate":
                        query = sortDescending ? query.OrderByDescending(d => d.StartDate) : query.OrderBy(d => d.StartDate);
                        break;
                    default:
                        query = sortDescending ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(d => d.CreatedAt);
            }

            // Pagination
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}

