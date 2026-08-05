using System.Security.Claims;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ResQConnect.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly IVolunteerService _volunteerService;

        public TasksController(IVolunteerService volunteerService)
        {
            _volunteerService = volunteerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks([FromQuery] int? campId = null)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Role-based filtering: Volunteers only see their own assigned tasks
            if (roleClaim == "Volunteer")
            {
                var volunteerProfile = await _volunteerService.GetVolunteerByUserIdAsync(userId);
                if (volunteerProfile == null)
                {
                    return BadRequest(new { Message = "Volunteer profile not found." });
                }
                var myTasks = await _volunteerService.GetTasksByVolunteerIdAsync(volunteerProfile.Id);
                return Ok(myTasks);
            }

            // NGOs, Officers, and Admins can filter by camp or see all
            if (campId.HasValue)
            {
                var campTasks = await _volunteerService.GetTasksByCampIdAsync(campId.Value);
                return Ok(campTasks);
            }

            var allTasks = await _volunteerService.GetAllTasksAsync();
            return Ok(allTasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(int id)
        {
            var task = await _volunteerService.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound(new { Message = "Task not found." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Volunteer check
            if (roleClaim == "Volunteer")
            {
                var volunteerProfile = await _volunteerService.GetVolunteerByUserIdAsync(userId);
                if (volunteerProfile == null || task.VolunteerId != volunteerProfile.Id)
                {
                    return Forbid();
                }
            }

            return Ok(task);
        }

        [Authorize(Roles = "NGO,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Check if assigning to a volunteer that is bound to another NGO
            if (createDto.VolunteerId.HasValue && roleClaim == "NGO")
            {
                var volunteer = await _volunteerService.GetVolunteerByIdAsync(createDto.VolunteerId.Value);
                if (volunteer != null && volunteer.AssignedNGOId.HasValue && volunteer.AssignedNGOId.Value != userId)
                {
                    return BadRequest(new { Message = "This volunteer is registered under another NGO and cannot be assigned tasks by your NGO." });
                }
            }

            try
            {
                var result = await _volunteerService.CreateTaskAsync(createDto);
                return CreatedAtAction(nameof(GetTaskById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize(Roles = "NGO,Volunteer,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Volunteers can only update the status, and only for their own assigned tasks
            if (roleClaim == "Volunteer")
            {
                var volunteerProfile = await _volunteerService.GetVolunteerByUserIdAsync(userId);
                var task = await _volunteerService.GetTaskByIdAsync(id);

                if (task == null)
                {
                    return NotFound(new { Message = "Task not found." });
                }

                if (volunteerProfile == null || task.VolunteerId != volunteerProfile.Id)
                {
                    return Forbid();
                }

                // Volunteers cannot reassign tasks to others
                var result = await _volunteerService.UpdateTaskStatusAsync(id, updateDto.Status, volunteerProfile.Id);
                return Ok(result);
            }

            try
            {
                // Check if assigning to a volunteer that is bound to another NGO
                if (updateDto.VolunteerId.HasValue && roleClaim == "NGO")
                {
                    var volunteer = await _volunteerService.GetVolunteerByIdAsync(updateDto.VolunteerId.Value);
                    if (volunteer != null && volunteer.AssignedNGOId.HasValue && volunteer.AssignedNGOId.Value != userId)
                    {
                        return BadRequest(new { Message = "This volunteer is registered under another NGO and cannot be assigned tasks by your NGO." });
                    }
                }

                // NGOs/Admins can update status and reassign volunteers
                var ngoResult = await _volunteerService.UpdateTaskStatusAsync(id, updateDto.Status, updateDto.VolunteerId);
                if (ngoResult == null)
                {
                    return NotFound(new { Message = "Task not found." });
                }

                return Ok(ngoResult);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize(Roles = "Volunteer")]
        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptTask(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var volunteerProfile = await _volunteerService.GetVolunteerByUserIdAsync(userId);
            if (volunteerProfile == null) return Forbid();

            var result = await _volunteerService.UpdateTaskStatusAsync(id, "Accepted", volunteerProfile.Id);
            if (result == null) return NotFound(new { Message = "Task not found." });
            return Ok(result);
        }

        [Authorize(Roles = "Volunteer")]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectTask(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var volunteerProfile = await _volunteerService.GetVolunteerByUserIdAsync(userId);
            if (volunteerProfile == null) return Forbid();

            var result = await _volunteerService.UpdateTaskStatusAsync(id, "Rejected", volunteerProfile.Id);
            if (result == null) return NotFound(new { Message = "Task not found." });
            return Ok(result);
        }

        [Authorize(Roles = "Volunteer")]
        [HttpPut("{id}/progress")]
        public async Task<IActionResult> UpdateProgress(int id, [FromBody] UpdateTaskProgressDto progressDto)
        {
            var task = await _volunteerService.GetTaskByIdAsync(id);
            if (task == null) return NotFound(new { Message = "Task not found." });

            // Update progress notes and proof image directly via repository
            var taskEntity = await _volunteerService.GetTaskEntityByIdAsync(id);
            if (taskEntity == null) return NotFound();

            taskEntity.ProgressNotes = progressDto.ProgressNotes ?? taskEntity.ProgressNotes;
            taskEntity.ProofImageUrl = progressDto.ProofImageUrl ?? taskEntity.ProofImageUrl;

            var result = await _volunteerService.UpdateTaskProgressAsync(taskEntity);
            return Ok(result);
        }
    }
}

