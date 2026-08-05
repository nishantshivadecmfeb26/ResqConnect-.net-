using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Services
{
    public class SOSService : ISOSService
    {
        private readonly ISOSRequestRepository _sosRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;

        public SOSService(
            ISOSRequestRepository sosRepository,
            INotificationService notificationService,
            IMapper mapper)
        {
            _sosRepository = sosRepository;
            _notificationService = notificationService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SOSRequestDto>> GetAllSOSRequestsAsync()
        {
            var requests = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            return _mapper.Map<IEnumerable<SOSRequestDto>>(requests);
        }

        public async Task<IEnumerable<SOSRequestDto>> GetSOSRequestsByUserIdAsync(int userId)
        {
            var requests = await _sosRepository.GetSOSRequestsByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<SOSRequestDto>>(requests);
        }

        public async Task<IEnumerable<SOSRequestDto>> GetSOSRequestsByDisasterIdAsync(int disasterId)
        {
            var requests = await _sosRepository.GetSOSRequestsByDisasterIdAsync(disasterId);
            return _mapper.Map<IEnumerable<SOSRequestDto>>(requests);
        }

        public async Task<SOSRequestDto?> GetSOSRequestByIdAsync(int id)
        {
            var requests = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var req = requests.FirstOrDefault(r => r.Id == id);
            if (req == null) return null;
            return _mapper.Map<SOSRequestDto>(req);
        }

        public async Task<SOSRequestDto> RaiseSOSRequestAsync(CreateSOSRequestDto createDto, int userId)
        {
            var request = _mapper.Map<SOSRequest>(createDto);
            request.UserId = userId;
            request.Status = "Pending";
            request.CurrentStatus = "Pending";
            request.CreatedAt = DateTime.UtcNow;

            await _sosRepository.AddAsync(request);
            await _sosRepository.SaveChangesAsync();

            // Fetch with detail navigation properties populated
            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            var resultDto = _mapper.Map<SOSRequestDto>(savedReq);

            // Notify Government Officers only
            string alertTitle = "New SOS Distress Call";
            string alertMsg = $"A new SOS has been raised by {request.VictimName}. Location: {request.Latitude}, {request.Longitude}. Level: {request.EmergencyLevel}";
            await _notificationService.SendNotificationToRoleAsync(4, alertTitle, alertMsg); // Government Officer (Role ID 4)

            return resultDto;
        }

        public async Task<SOSRequestDto?> UpdateSOSStatusAsync(int id, string status)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null) return null;

            request.Status = status;
            request.CurrentStatus = status;
            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                // Notify the victim about the status update
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = request.UserId,
                    Title = $"SOS Request Update",
                    Message = $"Your emergency SOS request status has been updated to '{status}'."
                });
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<bool> CancelSOSRequestAsync(int id, int userId)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null || request.UserId != userId) return false;

            request.Status = "Cancelled";
            request.CurrentStatus = "Cancelled";
            _sosRepository.Update(request);
            
            var success = await _sosRepository.SaveChangesAsync();
            if (success)
            {
                string notificationMsg = $"SOS Request #{id} raised by victim has been cancelled.";
                if (request.AssignedNGOId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = request.AssignedNGOId.Value,
                        Title = "SOS Request Cancelled",
                        Message = notificationMsg
                    });
                }
                await _notificationService.SendNotificationToRoleAsync(4, "SOS Request Cancelled", notificationMsg); // Gov Officer
            }
            return success;
        }

        // New workflow service implementations
        public async Task<IEnumerable<SOSRequestDto>> GetGovSOSRequestsAsync()
        {
            var requests = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            return _mapper.Map<IEnumerable<SOSRequestDto>>(requests);
        }

        public async Task<SOSRequestDto?> AssignNGOAsync(int id, int ngoId, int officerId)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null) return null;

            request.AssignedNGOId = ngoId;
            request.GovernmentOfficerId = officerId;
            request.AssignedDate = DateTime.UtcNow;
            request.Status = "Assigned to NGO";
            request.CurrentStatus = "Assigned to NGO";

            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                // Notify the assigned NGO
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = ngoId,
                    Title = "SOS Mission Assigned",
                    Message = $"Government Officer assigned a new SOS from victim {request.VictimName}."
                });

                // Notify the Victim
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = request.UserId,
                    Title = "SOS Request Accepted",
                    Message = "Your SOS has been accepted. A relief NGO is coordinating your rescue."
                });
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<SOSRequestDto?> RejectSOSAsync(int id, int officerId)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null) return null;

            request.GovernmentOfficerId = officerId;
            request.Status = "Rejected";
            request.CurrentStatus = "Rejected";

            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = request.UserId,
                    Title = "SOS Request Update",
                    Message = "Your SOS request was rejected after review."
                });
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<SOSRequestDto?> ResolveSOSAsync(int id, int officerId)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null) return null;

            request.GovernmentOfficerId = officerId;
            request.CompletedDate = DateTime.UtcNow;
            request.Status = "Resolved";
            request.CurrentStatus = "Resolved";

            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                // Notify Victim
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = request.UserId,
                    Title = "SOS Request Resolved",
                    Message = "Rescue completed successfully. Your status is now marked as Resolved."
                });

                // Notify NGO
                if (request.AssignedNGOId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = request.AssignedNGOId.Value,
                        Title = "SOS Request Resolved",
                        Message = $"SOS Request #{id} for {request.VictimName} has been successfully closed and marked Resolved by Government."
                    });
                }
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<IEnumerable<SOSRequestDto>> GetNgoSOSRequestsAsync(int ngoId)
        {
            var requests = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var filtered = requests.Where(r => r.AssignedNGOId == ngoId);
            return _mapper.Map<IEnumerable<SOSRequestDto>>(filtered);
        }

        public async Task<SOSRequestDto?> AssignVolunteerAsync(int id, int volunteerId)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null) return null;

            request.AssignedVolunteerId = volunteerId;
            request.Status = "Volunteer Assigned";
            request.CurrentStatus = "Volunteer Assigned";

            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                // Notify the assigned volunteer (using their User ID)
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = volunteerId,
                    Title = "Rescue Mission Assigned",
                    Message = $"You have been assigned a rescue mission for {request.VictimName}."
                });

                // Notify the Victim
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = request.UserId,
                    Title = "Rescuer Dispatched",
                    Message = "An emergency volunteer has been assigned to help you."
                });
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<SOSRequestDto?> VerifySOSCompletionAsync(int id)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null) return null;

            request.Status = "Verified by NGO";
            request.CurrentStatus = "Verified by NGO";

            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                // Notify Gov Officers
                await _notificationService.SendNotificationToRoleAsync(4, "SOS Completion Verified by NGO", $"NGO verified the completion of SOS Request #{id} for {request.VictimName}. Awaiting government resolution.");
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<IEnumerable<SOSRequestDto>> GetVolunteerTasksAsync(int volunteerUserId)
        {
            var requests = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var filtered = requests.Where(r => r.AssignedVolunteerId == volunteerUserId);
            return _mapper.Map<IEnumerable<SOSRequestDto>>(filtered);
        }

        public async Task<SOSRequestDto?> UpdateVolunteerTaskStatusAsync(int id, string status, int volunteerUserId)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null || request.AssignedVolunteerId != volunteerUserId) return null;

            request.Status = status;
            request.CurrentStatus = status;

            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                // Send specific notifications
                if (status == "On The Way")
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = request.UserId,
                        Title = "Volunteer On The Way",
                        Message = "Your assigned volunteer is on the way to your location."
                    });
                }
                else if (status == "Completed")
                {
                    // Notify NGO
                    if (request.AssignedNGOId.HasValue)
                    {
                        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                        {
                            UserId = request.AssignedNGOId.Value,
                            Title = "Volunteer Completed Rescue",
                            Message = $"Volunteer completed the rescue task for {request.VictimName}. Please verify proof."
                        });
                    }
                }
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<SOSRequestDto?> UploadVolunteerTaskProofAsync(int id, string proofImageUrl, string remarks, int volunteerUserId)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null || request.AssignedVolunteerId != volunteerUserId) return null;

            request.ProofImageUrl = proofImageUrl;
            request.Remarks = remarks;
            request.Status = "Completed";
            request.CurrentStatus = "Completed";

            _sosRepository.Update(request);
            var success = await _sosRepository.SaveChangesAsync();

            if (success)
            {
                // Notify NGO
                if (request.AssignedNGOId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = request.AssignedNGOId.Value,
                        Title = "Rescue Mission Proof Submitted",
                        Message = $"Volunteer submitted proof and marked the rescue task for {request.VictimName} as Completed."
                    });
                }
            }

            var allReqs = await _sosRepository.GetSOSRequestsWithDetailsAsync();
            var savedReq = allReqs.First(r => r.Id == request.Id);
            return _mapper.Map<SOSRequestDto>(savedReq);
        }

        public async Task<bool> DeleteSOSRequestAsync(int id)
        {
            var request = await _sosRepository.GetByIdAsync(id);
            if (request == null) return false;

            _sosRepository.Delete(request);
            return await _sosRepository.SaveChangesAsync();
        }
    }
}

