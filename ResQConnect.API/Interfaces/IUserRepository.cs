using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetUserWithRoleAndVolunteerAsync(int id);
        Task<IEnumerable<User>> GetAllUsersWithRolesAsync();
    }
}

