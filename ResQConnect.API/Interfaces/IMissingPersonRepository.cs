using ResQConnect.API.Models;

namespace ResQConnect.API.Interfaces
{
    public interface IMissingPersonRepository : IRepository<MissingPerson>
    {
        Task<IEnumerable<MissingPerson>> GetMissingPersonsWithDetailsAsync();
        Task<IEnumerable<MissingPerson>> GetMissingPersonsByReporterIdAsync(int reporterId);
    }
}

