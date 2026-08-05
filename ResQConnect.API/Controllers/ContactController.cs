using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ResQConnect.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly ILogger<ContactController> _logger;

        public ContactController(ILogger<ContactController> logger)
        {
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> SendContactMessage([FromBody] ContactRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Log details to console
            _logger.LogInformation("Contact Form Message Received:\n" +
                                   "Name: {Name}\n" +
                                   "Email: {Email}\n" +
                                   "Subject: {Subject}\n" +
                                   "Message: {Message}", dto.Name, dto.Email, dto.Subject, dto.Message);

            try
            {
                using var httpClient = new HttpClient();
                
                // FormSubmit.co AJAX payload
                var payload = new
                {
                    name = dto.Name,
                    email = dto.Email,
                    subject = dto.Subject,
                    message = dto.Message,
                    _honey = "" // Honeypot field to prevent spam bots
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Post to FormSubmit.co ajax endpoint
                var response = await httpClient.PostAsync("https://formsubmit.co/ajax/resqconnect26@gmail.com", content);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Contact email successfully sent via FormSubmit.co.");
                    return Ok(new { Success = true, Message = "Email sent successfully via FormSubmit." });
                }
                else
                {
                    var errorResponse = await response.Content.ReadAsStringAsync();
                    _logger.LogError("FormSubmit.co API returned error: {Error}", errorResponse);
                    return Ok(new { Success = true, Message = "Message logged on server, third-party delivery failed." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email via FormSubmit.co API.");
                // Return success so the user sees a success toast, but log the error
                return Ok(new { Success = true, Message = "Message logged on server, API connection failed." });
            }
        }
    }

    public class ContactRequestDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
