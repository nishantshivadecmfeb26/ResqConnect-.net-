using System.Security.Claims;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ResQConnect.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SOSController : ControllerBase
    {
        private readonly ISOSService _sosService;

        public SOSController(ISOSService sosService)
        {
            _sosService = sosService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSOSRequests([FromQuery] int? disasterId = null)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Role-based filtering: Victims only see their own requests
            if (roleClaim == "Victim")
            {
                var myRequests = await _sosService.GetSOSRequestsByUserIdAsync(userId);
                return Ok(myRequests);
            }

            // NGOs, Officers, and Admins can see all
            if (disasterId.HasValue)
            {
                var disasterRequests = await _sosService.GetSOSRequestsByDisasterIdAsync(disasterId.Value);
                return Ok(disasterRequests);
            }

            var allRequests = await _sosService.GetAllSOSRequestsAsync();
            return Ok(allRequests);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSOSRequestById(int id)
        {
            var request = await _sosService.GetSOSRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound(new { Message = "SOS request not found." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Victim can only view their own
            if (roleClaim == "Victim" && request.UserId != userId)
            {
                return Forbid();
            }

            return Ok(request);
        }

        [HttpPost]
        public async Task<IActionResult> RaiseSOS([FromBody] CreateSOSRequestDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional validation using ValidationHelper
            if (!ValidationHelper.IsValidLatitude(createDto.Latitude))
            {
                return BadRequest(new { Message = "Invalid latitude. Must be between -90 and 90." });
            }

            if (!ValidationHelper.IsValidLongitude(createDto.Longitude))
            {
                return BadRequest(new { Message = "Invalid longitude. Must be between -180 and 180." });
            }

            if (!ValidationHelper.IsValidPersonCount(createDto.NumberOfPeople))
            {
                return BadRequest(new { Message = "Number of people must be between 1 and 10000." });
            }

            if (!ValidationHelper.IsValidDescription(createDto.Description))
            {
                return BadRequest(new { Message = "Description contains invalid content or patterns." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Handle base64 image upload if provided
            if (!string.IsNullOrEmpty(createDto.ImageUrl) && createDto.ImageUrl.StartsWith("data:image"))
            {
                try
                {
                    var base64Data = createDto.ImageUrl;
                    if (base64Data.Contains(","))
                    {
                        base64Data = base64Data.Split(',')[1];
                    }

                    var bytes = Convert.FromBase64String(base64Data);
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var fileName = $"sos_{Guid.NewGuid()}.jpg";
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    await System.IO.File.WriteAllBytesAsync(filePath, bytes);

                    createDto.ImageUrl = $"/uploads/{fileName}";
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error uploading SOS image: {ex.Message}");
                    createDto.ImageUrl = null;
                }
            }

            var result = await _sosService.RaiseSOSRequestAsync(createDto, userId);
            return CreatedAtAction(nameof(GetSOSRequestById), new { id = result.Id }, result);
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateSOSStatus(int id, [FromBody] UpdateSOSStatusDto statusDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _sosService.UpdateSOSStatusAsync(id, statusDto.Status);
            if (result == null)
            {
                return NotFound(new { Message = "SOS request not found." });
            }

            return Ok(result);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelSOS(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _sosService.CancelSOSRequestAsync(id, userId);
            if (!result)
            {
                return BadRequest(new { Message = "Unable to cancel SOS request. Check if you are the owner of this request." });
            }

            return Ok(new { Message = "SOS request cancelled successfully." });
        }

        // --- NEW WORKFLOW ENDPOINTS ---

        // Government Officer Endpoints
        [Authorize(Roles = "Government Officer,Admin")]
        [HttpGet("/api/gov/sos")]
        public async Task<IActionResult> GetGovSOSRequests()
        {
            var requests = await _sosService.GetGovSOSRequestsAsync();
            return Ok(requests);
        }

        [Authorize(Roles = "Government Officer,Admin")]
        [HttpPut("/api/gov/sos/{id}/assign-ngo")]
        public async Task<IActionResult> AssignNGO(int id, [FromBody] AssignNGODto assignDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _sosService.AssignNGOAsync(id, assignDto.NGOId, userId);
            if (result == null) return NotFound(new { Message = "SOS request not found." });

            return Ok(result);
        }

        [Authorize(Roles = "Government Officer,Admin")]
        [HttpPut("/api/gov/sos/{id}/reject")]
        public async Task<IActionResult> RejectSOS(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _sosService.RejectSOSAsync(id, userId);
            if (result == null) return NotFound(new { Message = "SOS request not found." });

            return Ok(result);
        }

        [Authorize(Roles = "Government Officer,Admin")]
        [HttpPut("/api/gov/sos/{id}/resolve")]
        public async Task<IActionResult> ResolveSOS(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _sosService.ResolveSOSAsync(id, userId);
            if (result == null) return NotFound(new { Message = "SOS request not found." });

            return Ok(result);
        }

        // NGO Endpoints
        [Authorize(Roles = "NGO,Admin")]
        [HttpGet("/api/ngo/sos")]
        public async Task<IActionResult> GetNgoSOSRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var requests = await _sosService.GetNgoSOSRequestsAsync(userId);
            return Ok(requests);
        }

        [Authorize(Roles = "NGO,Admin")]
        [HttpPut("/api/ngo/sos/{id}/assign-volunteer")]
        public async Task<IActionResult> AssignVolunteer(int id, [FromBody] AssignVolunteerDto assignDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _sosService.AssignVolunteerAsync(id, assignDto.VolunteerId);
            if (result == null) return NotFound(new { Message = "SOS request not found." });

            return Ok(result);
        }

        [Authorize(Roles = "NGO,Admin")]
        [HttpPut("/api/ngo/sos/{id}/verify")]
        public async Task<IActionResult> VerifySOSCompletion(int id)
        {
            var result = await _sosService.VerifySOSCompletionAsync(id);
            if (result == null) return NotFound(new { Message = "SOS request not found." });

            return Ok(result);
        }

        // Volunteer Endpoints
        [Authorize(Roles = "Volunteer,Admin")]
        [HttpGet("/api/volunteer/tasks")]
        public async Task<IActionResult> GetVolunteerTasks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var tasks = await _sosService.GetVolunteerTasksAsync(userId);
            return Ok(tasks);
        }

        [Authorize(Roles = "Volunteer,Admin")]
        [HttpPut("/api/volunteer/tasks/{id}/status")]
        public async Task<IActionResult> UpdateVolunteerTaskStatus(int id, [FromBody] UpdateVolunteerTaskStatusDto statusDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _sosService.UpdateVolunteerTaskStatusAsync(id, statusDto.Status, userId);
            if (result == null) return NotFound(new { Message = "Task not found or not assigned to you." });

            return Ok(result);
        }

        [Authorize(Roles = "Volunteer,Admin")]
        [HttpPost("/api/volunteer/tasks/{id}/proof")]
        public async Task<IActionResult> UploadVolunteerTaskProof(int id, [FromBody] UploadTaskProofDto proofDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var proofUrl = proofDto.ProofImageUrl;

            // Handle base64 image if uploaded
            if (!string.IsNullOrEmpty(proofUrl) && proofUrl.StartsWith("data:image"))
            {
                try
                {
                    var base64Data = proofUrl;
                    if (base64Data.Contains(","))
                    {
                        base64Data = base64Data.Split(',')[1];
                    }

                    var bytes = Convert.FromBase64String(base64Data);
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var fileName = $"proof_{Guid.NewGuid()}.jpg";
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    await System.IO.File.WriteAllBytesAsync(filePath, bytes);

                    proofUrl = $"/uploads/{fileName}";
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error uploading proof image: {ex.Message}");
                    return BadRequest(new { Message = "Failed to upload proof image." });
                }
            }

            var result = await _sosService.UploadVolunteerTaskProofAsync(id, proofUrl, proofDto.Remarks, userId);
            if (result == null)
            {
                return NotFound(new { Message = "Task not found or not assigned to you." });
            }

            return Ok(result);
        }

        [Authorize(Roles = "Government Officer,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSOSRequest(int id)
        {
            var result = await _sosService.DeleteSOSRequestAsync(id);
            if (!result)
            {
                return NotFound(new { Message = "SOS request not found." });
            }

            return Ok(new { Message = "SOS request deleted successfully." });
        }
    }
}

