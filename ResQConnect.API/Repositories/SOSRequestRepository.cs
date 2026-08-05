using Microsoft.EntityFrameworkCore;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Repositories
{
    public class SOSRequestRepository : Repository<SOSRequest>, ISOSRequestRepository
    {
        public SOSRequestRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<SOSRequest>> GetSOSRequestsWithDetailsAsync()
        {
            return await _context.SOSRequests
                .Include(s => s.User)
                .Include(s => s.Disaster)
                .Include(s => s.AssignedNGO)
                .Include(s => s.AssignedVolunteer)
                .Include(s => s.GovernmentOfficer)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<SOSRequest>> GetSOSRequestsByUserIdAsync(int userId)
        {
            return await _context.SOSRequests
                .Include(s => s.Disaster)
                .Include(s => s.AssignedNGO)
                .Include(s => s.AssignedVolunteer)
                .Include(s => s.GovernmentOfficer)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<SOSRequest>> GetSOSRequestsByDisasterIdAsync(int disasterId)
        {
            return await _context.SOSRequests
                .Include(s => s.User)
                .Include(s => s.AssignedNGO)
                .Include(s => s.AssignedVolunteer)
                .Include(s => s.GovernmentOfficer)
                .Where(s => s.DisasterId == disasterId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }
    }
}

