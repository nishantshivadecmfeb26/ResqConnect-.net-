using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ResQConnect.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ResourcesController : ControllerBase
    {
        private readonly ICampService _campService;

        public ResourcesController(ICampService campService)
        {
            _campService = campService;
        }

        [HttpGet]
        public async Task<IActionResult> GetResources([FromQuery] int campId)
        {
            var resources = await _campService.GetResourcesByCampIdAsync(campId);
            return Ok(resources);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetResourceById(int id)
        {
            var resource = await _campService.GetResourceByIdAsync(id);
            if (resource == null)
            {
                return NotFound(new { Message = "Camp resource not found." });
            }
            return Ok(resource);
        }

        [Authorize(Roles = "NGO,Admin")]
        [HttpPost]
        public async Task<IActionResult> AddResource([FromBody] CreateResourceDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _campService.AddResourceAsync(createDto);
            return CreatedAtAction(nameof(GetResourceById), new { id = result.Id }, result);
        }

        [Authorize(Roles = "NGO,Volunteer,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResourceQuantity(int id, [FromBody] int quantity)
        {
            if (quantity < 0)
            {
                return BadRequest(new { Message = "Quantity cannot be negative." });
            }

            var result = await _campService.UpdateResourceAsync(id, quantity);
            if (result == null)
            {
                return NotFound(new { Message = "Camp resource not found." });
            }

            return Ok(result);
        }

        [Authorize(Roles = "NGO,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResource(int id)
        {
            var result = await _campService.DeleteResourceAsync(id);
            if (!result)
            {
                return NotFound(new { Message = "Camp resource not found." });
            }

            return Ok(new { Message = "Camp resource deleted successfully." });
        }
    }
}

