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
    public class DisastersController : ControllerBase
    {
        private readonly IDisasterService _disasterService;

        public DisastersController(IDisasterService disasterService)
        {
            _disasterService = disasterService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDisasters(
            [FromQuery] string? searchTerm,
            [FromQuery] string? type,
            [FromQuery] string? severity,
            [FromQuery] string? status,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool sortDescending = true,
            [FromQuery] bool activeOnly = false)
        {
            var targetStatus = activeOnly ? "Active" : status;

            var result = await _disasterService.GetDisastersFilteredAsync(
                searchTerm, type, severity, targetStatus, pageNumber, pageSize, sortBy, sortDescending);

            return Ok(result);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDisasterStats()
        {
            var stats = await _disasterService.GetDisasterStatsAsync();
            return Ok(stats);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDisasterById(int id)
        {
            var disaster = await _disasterService.GetDisasterByIdAsync(id);
            if (disaster == null)
            {
                return NotFound(new { Message = "Disaster event not found." });
            }
            return Ok(disaster);
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateDisaster([FromBody] CreateDisasterDto createDto)
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

            if (!ValidationHelper.IsValidDescription(createDto.Description))
            {
                return BadRequest(new { Message = "Description contains invalid content or patterns." });
            }

            // Validate status values
            var validStatuses = new[] { "Active", "Contained", "Closed" };
            if (!validStatuses.Contains(createDto.Status, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new { Message = "Invalid status. Must be Active, Contained, or Closed." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _disasterService.CreateDisasterAsync(createDto, userId);
            return CreatedAtAction(nameof(GetDisasterById), new { id = result.Id }, result);
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDisaster(int id, [FromBody] CreateDisasterDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _disasterService.UpdateDisasterAsync(id, updateDto);
            if (result == null)
            {
                return NotFound(new { Message = "Disaster event not found." });
            }

            return Ok(result);
        }

        [Authorize(Roles = "Government Officer,Admin")]
        [HttpPut("{id}/close")]
        public async Task<IActionResult> CloseDisaster(int id)
        {
            var result = await _disasterService.CloseDisasterAsync(id);
            if (!result)
            {
                return NotFound(new { Message = "Disaster event not found or failed to close." });
            }

            return Ok(new { Message = "Disaster event closed successfully." });
        }

        [Authorize(Roles = "Government Officer,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDisaster(int id)
        {
            var result = await _disasterService.DeleteDisasterAsync(id);
            if (!result)
            {
                return NotFound(new { Message = "Disaster event not found." });
            }

            return Ok(new { Message = "Disaster event deleted successfully." });
        }
    }
}

