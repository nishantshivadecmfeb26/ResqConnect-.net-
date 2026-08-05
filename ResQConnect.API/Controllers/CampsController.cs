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
    public class CampsController : ControllerBase
    {
        private readonly ICampService _campService;
        private readonly Data.ApplicationDbContext _context;

        public CampsController(ICampService campService, Data.ApplicationDbContext context)
        {
            _campService = campService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCamps([FromQuery] int? disasterId = null)
        {
            if (disasterId.HasValue)
            {
                var campsByDisaster = await _campService.GetCampsByDisasterIdAsync(disasterId.Value);
                return Ok(campsByDisaster);
            }

            var camps = await _campService.GetAllCampsAsync();
            return Ok(camps);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCampById(int id)
        {
            var camp = await _campService.GetCampByIdAsync(id);
            if (camp == null)
            {
                return NotFound(new { Message = "Relief camp not found." });
            }
            return Ok(camp);
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateCamp([FromBody] CreateCampDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional validation using ValidationHelper
            if (!ValidationHelper.IsValidAddress(createDto.Address))
            {
                return BadRequest(new { Message = "Invalid address format." });
            }

            if (!ValidationHelper.IsValidLatitude(createDto.Latitude))
            {
                return BadRequest(new { Message = "Invalid latitude. Must be between -90 and 90." });
            }

            if (!ValidationHelper.IsValidLongitude(createDto.Longitude))
            {
                return BadRequest(new { Message = "Invalid longitude. Must be between -180 and 180." });
            }

            if (!ValidationHelper.IsValidCapacity(createDto.Capacity))
            {
                return BadRequest(new { Message = "Capacity must be between 1 and 100000." });
            }

            var result = await _campService.CreateCampAsync(createDto);
            return CreatedAtAction(nameof(GetCampById), new { id = result.Id }, result);
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCamp(int id, [FromBody] CreateCampDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _campService.UpdateCampAsync(id, updateDto);
            if (result == null)
            {
                return NotFound(new { Message = "Relief camp not found." });
            }

            return Ok(result);
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> CloseCamp(int id)
        {
            var result = await _campService.CloseCampAsync(id);
            if (!result)
            {
                return NotFound(new { Message = "Relief camp not found or could not be closed." });
            }

            return Ok(new { Message = "Relief camp closed and deleted successfully." });
        }

        [Authorize(Roles = "Victim,Volunteer,NGO,Government Officer,Admin")]
        [HttpPost("{id}/register")]
        public async Task<IActionResult> RegisterInCamp(int id)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            var camp = await _context.ReliefCamps.FindAsync(id);
            if (camp == null)
            {
                return NotFound(new { Message = "Relief camp not found." });
            }

            if (camp.CurrentOccupancy >= camp.Capacity)
            {
                return BadRequest(new { Message = "Cannot register. Camp is at full capacity." });
            }

            // If user is already registered in a different camp, leave that camp first
            if (user.CampId.HasValue && user.CampId.Value != id)
            {
                var oldCamp = await _context.ReliefCamps.FindAsync(user.CampId.Value);
                if (oldCamp != null && oldCamp.CurrentOccupancy > 0)
                {
                    oldCamp.CurrentOccupancy--;
                }
            }

            // If user is not already registered in this camp, register them
            if (user.CampId != id)
            {
                user.CampId = id;
                camp.CurrentOccupancy++;
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Successfully registered in camp.", CampId = id, CurrentOccupancy = camp.CurrentOccupancy });
        }

        [Authorize(Roles = "Victim,Volunteer,NGO,Government Officer,Admin")]
        [HttpPost("leave")]
        public async Task<IActionResult> LeaveCamp()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            if (!user.CampId.HasValue)
            {
                return BadRequest(new { Message = "User is not registered in any camp." });
            }

            var camp = await _context.ReliefCamps.FindAsync(user.CampId.Value);
            if (camp != null && camp.CurrentOccupancy > 0)
            {
                camp.CurrentOccupancy--;
            }

            int leftCampId = user.CampId.Value;
            user.CampId = null;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Successfully left the camp.", CampId = leftCampId, CurrentOccupancy = camp?.CurrentOccupancy ?? 0 });
        }
    }
}

