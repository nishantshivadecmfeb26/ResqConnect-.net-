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
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var notifications = await _notificationService.GetNotificationsByUserIdAsync(userId);
            return Ok(notifications);
        }

        [Authorize(Roles = "NGO,Government Officer,Admin")]
        [HttpPost("broadcast")]
        public async Task<IActionResult> BroadcastNotification([FromBody] CreateNotificationDto createDto, [FromQuery] int? roleId = null)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (roleId.HasValue)
            {
                await _notificationService.SendNotificationToRoleAsync(roleId.Value, createDto.Title, createDto.Message);
            }
            else
            {
                await _notificationService.SendNotificationToAllAsync(createDto.Title, createDto.Message);
            }

            return Ok(new { Message = "Advisory broadcasted successfully." });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var result = await _notificationService.MarkAsReadAsync(id);
            if (!result)
            {
                return NotFound(new { Message = "Notification not found." });
            }

            return Ok(new { Message = "Notification marked as read." });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { Message = "All notifications marked as read." });
        }
    }
}

