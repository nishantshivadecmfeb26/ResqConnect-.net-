using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;

namespace ResQConnect.API.Services
{
    public class VolunteerService : IVolunteerService
    {
        private readonly IVolunteerRepository _volunteerRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IReliefCampRepository _campRepository;
        private readonly INotificationService _notificationService;
        private readonly IMapper _mapper;

        public VolunteerService(
            IVolunteerRepository volunteerRepository,
            ITaskRepository taskRepository,
            IReliefCampRepository campRepository,
            INotificationService notificationService,
            IMapper mapper)
        {
            _volunteerRepository = volunteerRepository;
            _taskRepository = taskRepository;
            _campRepository = campRepository;
            _notificationService = notificationService;
            _mapper = mapper;
        }

        // Volunteer Profile Management
        public async Task<IEnumerable<VolunteerDto>> GetAllVolunteersAsync()
        {
            var volunteers = await _volunteerRepository.GetAllVolunteersWithDetailsAsync();
            return _mapper.Map<IEnumerable<VolunteerDto>>(volunteers);
        }

        public async Task<VolunteerDto?> GetVolunteerByIdAsync(int id)
        {
            var volunteer = await _volunteerRepository.GetVolunteerWithTasksAsync(id);
            if (volunteer == null) return null;
            return _mapper.Map<VolunteerDto>(volunteer);
        }

        public async Task<VolunteerDto?> GetVolunteerByUserIdAsync(int userId)
        {
            var volunteer = await _volunteerRepository.GetVolunteerByUserIdAsync(userId);
            if (volunteer == null) return null;
            return _mapper.Map<VolunteerDto>(volunteer);
        }

        public async Task<VolunteerDto?> UpdateProfileAsync(int userId, UpdateVolunteerProfileDto updateDto)
        {
            var volunteer = await _volunteerRepository.GetVolunteerByUserIdAsync(userId);
            if (volunteer == null) return null;

            volunteer.Skills = updateDto.Skills;
            volunteer.AvailabilityStatus = updateDto.AvailabilityStatus;
            volunteer.CurrentLocation = updateDto.CurrentLocation;
            volunteer.DocumentUrl = updateDto.DocumentUrl;
            volunteer.IdProofNumber = updateDto.IdProofNumber;

            _volunteerRepository.Update(volunteer);
            await _volunteerRepository.SaveChangesAsync();

            // Re-fetch to return fully detailed DTO
            var updated = await _volunteerRepository.GetVolunteerByUserIdAsync(userId);
            return _mapper.Map<VolunteerDto>(updated);
        }

        public async Task<VolunteerDto?> VerifyVolunteerAsync(int id, VerifyVolunteerDto verifyDto)
        {
            var volunteer = await _volunteerRepository.GetVolunteerWithTasksAsync(id);
            if (volunteer == null) return null;

            volunteer.VerificationStatus = verifyDto.VerificationStatus;
            if (verifyDto.SkillTier.HasValue)
            {
                volunteer.SkillTier = verifyDto.SkillTier.Value;
            }

            _volunteerRepository.Update(volunteer);
            var success = await _volunteerRepository.SaveChangesAsync();

            if (success)
            {
                // Notify the volunteer about their status verification
                await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                {
                    UserId = volunteer.UserId,
                    Title = "Volunteer Verification Update",
                    Message = $"Your volunteer profile status has been marked as '{verifyDto.VerificationStatus}'."
                });
            }

            return _mapper.Map<VolunteerDto>(volunteer);
        }

        // Task Operations
        public async Task<IEnumerable<TaskDto>> GetAllTasksAsync()
        {
            var tasks = await _taskRepository.GetTasksWithDetailsAsync();
            return _mapper.Map<IEnumerable<TaskDto>>(tasks);
        }

        public async Task<IEnumerable<TaskDto>> GetTasksByVolunteerIdAsync(int volunteerId)
        {
            var tasks = await _taskRepository.GetTasksByVolunteerIdAsync(volunteerId);
            return _mapper.Map<IEnumerable<TaskDto>>(tasks);
        }

        public async Task<IEnumerable<TaskDto>> GetTasksByCampIdAsync(int campId)
        {
            var tasks = await _taskRepository.GetTasksByCampIdAsync(campId);
            return _mapper.Map<IEnumerable<TaskDto>>(tasks);
        }

        public async Task<TaskDto?> GetTaskByIdAsync(int id)
        {
            var tasks = await _taskRepository.GetTasksWithDetailsAsync();
            var task = tasks.FirstOrDefault(t => t.Id == id);
            if (task == null) return null;
            return _mapper.Map<TaskDto>(task);
        }

        public async Task<TaskDto> CreateTaskAsync(CreateTaskDto createDto)
        {
            // Validate volunteer skill tier if assigned
            if (createDto.VolunteerId.HasValue)
            {
                var volunteer = await _volunteerRepository.GetByIdAsync(createDto.VolunteerId.Value);
                if (volunteer != null && volunteer.SkillTier < createDto.RequiredSkillTier)
                {
                    throw new InvalidOperationException($"Volunteer Skill Tier ({volunteer.SkillTier}) is lower than the Required Skill Tier ({createDto.RequiredSkillTier}) for this task.");
                }
            }

            var task = _mapper.Map<TaskEntity>(createDto);
            task.Status = "Assigned";
            task.AssignedDate = DateTime.UtcNow;

            await _taskRepository.AddAsync(task);
            await _taskRepository.SaveChangesAsync();

            var savedTask = await GetTaskByIdAsync(task.Id);
            var resultDto = _mapper.Map<TaskDto>(savedTask);

            // Notify assigned volunteer if any
            if (task.VolunteerId.HasValue)
            {
                var volunteer = await _volunteerRepository.GetByIdAsync(task.VolunteerId.Value);
                if (volunteer != null)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = volunteer.UserId,
                        Title = "New Task Assignment",
                        Message = $"You have been assigned a new task: '{task.Description}' at Camp '{resultDto.CampName}'."
                    });
                }
            }

            return resultDto;
        }

        public async Task<TaskDto?> UpdateTaskStatusAsync(int id, string status, int? volunteerId)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null) return null;

            // Validate reassigned volunteer skill tier
            if (volunteerId.HasValue && volunteerId.Value != task.VolunteerId)
            {
                var volunteer = await _volunteerRepository.GetByIdAsync(volunteerId.Value);
                if (volunteer != null && volunteer.SkillTier < task.RequiredSkillTier)
                {
                    throw new InvalidOperationException($"Volunteer Skill Tier ({volunteer.SkillTier}) is lower than the Required Skill Tier ({task.RequiredSkillTier}) for this task.");
                }
            }

            var oldStatus = task.Status;
            task.Status = status;

            if (volunteerId.HasValue)
            {
                task.VolunteerId = volunteerId.Value;
            }

            if (status.ToLower() == "completed" && oldStatus.ToLower() != "completed")
            {
                task.CompletedDate = DateTime.UtcNow;

                // Award credibility points to the volunteer
                if (task.VolunteerId.HasValue)
                {
                    var volunteer = await _volunteerRepository.GetByIdAsync(task.VolunteerId.Value);
                    if (volunteer != null)
                    {
                        volunteer.CredibilityScore += 10;
                        
                        // Auto-upgrade from Tier 1 to Tier 2 if credibility reaches 50
                        if (volunteer.SkillTier == 1 && volunteer.CredibilityScore >= 50)
                        {
                            volunteer.SkillTier = 2;
                            await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                            {
                                UserId = volunteer.UserId,
                                Title = "Skill Tier Upgraded!",
                                Message = "Congratulations! Based on your active relief work and high credibility, you have been upgraded to Skill Tier 2 (Field/Verified)."
                            });
                        }
                        
                        _volunteerRepository.Update(volunteer);
                    }
                }
            }

            _taskRepository.Update(task);
            var success = await _taskRepository.SaveChangesAsync();

            var savedTask = await GetTaskByIdAsync(task.Id);
            var resultDto = _mapper.Map<TaskDto>(savedTask);

            if (success)
            {
                // Notify the volunteer if status is changed
                if (task.VolunteerId.HasValue)
                {
                    var volunteer = await _volunteerRepository.GetByIdAsync(task.VolunteerId.Value);
                    if (volunteer != null)
                    {
                        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                        {
                            UserId = volunteer.UserId,
                            Title = "Task Status Updated",
                            Message = $"Your task '{task.Description}' status is now '{status}'."
                        });
                    }
                }

                // If completed, notify NGO and Admins
                if (status.ToLower() == "completed")
                {
                    string alertTitle = "Task Completed Alert";
                    string alertMsg = $"Task '{task.Description}' in Camp '{resultDto.CampName}' has been completed by Volunteer {resultDto.VolunteerName}.";
                    
                    await _notificationService.SendNotificationToRoleAsync(3, alertTitle, alertMsg); // NGO
                    await _notificationService.SendNotificationToRoleAsync(5, alertTitle, alertMsg); // Admin
                }
            }

            return resultDto;
        }

        public async Task<TaskEntity?> GetTaskEntityByIdAsync(int id)
        {
            return await _taskRepository.GetByIdAsync(id);
        }

        public async Task<TaskDto?> UpdateTaskProgressAsync(TaskEntity task)
        {
            _taskRepository.Update(task);
            var success = await _taskRepository.SaveChangesAsync();
            if (!success) return null;

            var savedTask = await GetTaskByIdAsync(task.Id);
            return _mapper.Map<TaskDto>(savedTask);
        }
    }
}

