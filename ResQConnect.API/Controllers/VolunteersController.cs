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
    public class VolunteersController : ControllerBase
    {
        private readonly IVolunteerService _volunteerService;

        public VolunteersController(IVolunteerService volunteerService)
        {
            _volunteerService = volunteerService;
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllVolunteers()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            var volunteers = await _volunteerService.GetAllVolunteersAsync();

            if (roleClaim == "NGO" && !string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                volunteers = volunteers.Where(v => v.AssignedNGOId == userId || !v.AssignedNGOId.HasValue);
            }

            return Ok(volunteers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVolunteerById(int id)
        {
            var volunteer = await _volunteerService.GetVolunteerByIdAsync(id);
            if (volunteer == null)
            {
                return NotFound(new { Message = "Volunteer profile not found." });
            }
            return Ok(volunteer);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var volunteer = await _volunteerService.GetVolunteerByUserIdAsync(userId);
            if (volunteer == null)
            {
                return NotFound(new { Message = "Volunteer profile not found for this user." });
            }
            return Ok(volunteer);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateVolunteerProfile([FromBody] UpdateVolunteerProfileDto updateDto)
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

            var result = await _volunteerService.UpdateProfileAsync(userId, updateDto);
            if (result == null)
            {
                return BadRequest(new { Message = "Failed to update profile. Make sure you are registered as a Volunteer." });
            }

            return Ok(result);
        }

        [Authorize(Roles = "NGO,Admin")]
        [HttpPut("{id}/verify")]
        public async Task<IActionResult> VerifyVolunteer(int id, [FromBody] VerifyVolunteerDto verifyDto)
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

            if (roleClaim == "NGO")
            {
                var volunteer = await _volunteerService.GetVolunteerByIdAsync(id);
                if (volunteer != null && volunteer.AssignedNGOId.HasValue && volunteer.AssignedNGOId.Value != userId)
                {
                    return Forbid();
                }
            }

            var result = await _volunteerService.VerifyVolunteerAsync(id, verifyDto);
            if (result == null)
            {
                return NotFound(new { Message = "Volunteer profile not found." });
            }

            return Ok(result);
        }
    }
}

