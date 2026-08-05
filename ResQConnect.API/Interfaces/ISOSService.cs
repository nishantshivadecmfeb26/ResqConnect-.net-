using ResQConnect.API.DTOs;

namespace ResQConnect.API.Interfaces
{
    public interface ISOSService
    {
        Task<IEnumerable<SOSRequestDto>> GetAllSOSRequestsAsync();
        Task<IEnumerable<SOSRequestDto>> GetSOSRequestsByUserIdAsync(int userId);
        Task<IEnumerable<SOSRequestDto>> GetSOSRequestsByDisasterIdAsync(int disasterId);
        Task<SOSRequestDto?> GetSOSRequestByIdAsync(int id);
        Task<SOSRequestDto> RaiseSOSRequestAsync(CreateSOSRequestDto createDto, int userId);
        Task<SOSRequestDto?> UpdateSOSStatusAsync(int id, string status);
        Task<bool> CancelSOSRequestAsync(int id, int userId);

        // New workflow methods
        Task<IEnumerable<SOSRequestDto>> GetGovSOSRequestsAsync();
        Task<SOSRequestDto?> AssignNGOAsync(int id, int ngoId, int officerId);
        Task<SOSRequestDto?> RejectSOSAsync(int id, int officerId);
        Task<SOSRequestDto?> ResolveSOSAsync(int id, int officerId);
        Task<IEnumerable<SOSRequestDto>> GetNgoSOSRequestsAsync(int ngoId);
        Task<SOSRequestDto?> AssignVolunteerAsync(int id, int volunteerId);
        Task<SOSRequestDto?> VerifySOSCompletionAsync(int id);
        Task<IEnumerable<SOSRequestDto>> GetVolunteerTasksAsync(int volunteerUserId);
        Task<SOSRequestDto?> UpdateVolunteerTaskStatusAsync(int id, string status, int volunteerUserId);
        Task<SOSRequestDto?> UploadVolunteerTaskProofAsync(int id, string proofImageUrl, string remarks, int volunteerUserId);
        Task<bool> DeleteSOSRequestAsync(int id);
    }
}

