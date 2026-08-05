using System.Security.Claims;
using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ResQConnect.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/missing-persons")]
    public class MissingPersonsController : ControllerBase
    {
        private readonly IMissingPersonRepository _missingPersonRepository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;

        public MissingPersonsController(
            IMissingPersonRepository missingPersonRepository,
            IMapper mapper,
            IWebHostEnvironment env)
        {
            _missingPersonRepository = missingPersonRepository;
            _mapper = mapper;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _missingPersonRepository.GetMissingPersonsWithDetailsAsync();
            var dtos = _mapper.Map<IEnumerable<MissingPersonDto>>(reports);
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var report = await _missingPersonRepository.GetByIdAsync(id);
            if (report == null)
            {
                return NotFound(new { Message = "Missing person report not found." });
            }

            // Fetch details to map reporter info
            var all = await _missingPersonRepository.GetMissingPersonsWithDetailsAsync();
            var detailed = all.FirstOrDefault(m => m.Id == id);
            return Ok(_mapper.Map<MissingPersonDto>(detailed));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMissingPersonDto createDto)
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

            var person = _mapper.Map<MissingPerson>(createDto);
            person.ReporterId = userId;
            person.CreatedAt = DateTime.UtcNow;
            person.Status = "Missing";

            // Handle base64 image upload if provided
            if (!string.IsNullOrEmpty(createDto.PhotoBase64))
            {
                try
                {
                    var base64Data = createDto.PhotoBase64;
                    // Check if base64 contains metadata prefix (e.g. data:image/jpeg;base64,) and strip it
                    if (base64Data.Contains(","))
                    {
                        base64Data = base64Data.Split(',')[1];
                    }

                    var bytes = Convert.FromBase64String(base64Data);
                    
                    var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var fileName = $"{Guid.NewGuid()}.jpg";
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    await System.IO.File.WriteAllBytesAsync(filePath, bytes);
                    
                    person.Photo = $"/uploads/{fileName}";
                }
                catch (Exception ex)
                {
                    // Log photo upload error but do not block the registration itself
                    Console.WriteLine($"Error uploading photo: {ex.Message}");
                    person.Photo = "/uploads/default.jpg";
                }
            }
            else
            {
                person.Photo = "/uploads/default.jpg";
            }

            await _missingPersonRepository.AddAsync(person);
            await _missingPersonRepository.SaveChangesAsync();

            var all = await _missingPersonRepository.GetMissingPersonsWithDetailsAsync();
            var detailed = all.First(m => m.Id == person.Id);

            return CreatedAtAction(nameof(GetById), new { id = person.Id }, _mapper.Map<MissingPersonDto>(detailed));
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateMissingPersonStatusDto statusDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var report = await _missingPersonRepository.GetByIdAsync(id);
            if (report == null)
            {
                return NotFound(new { Message = "Missing person report not found." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Verification: Only the reporter, NGOs, or Admins can mark as found
            if (report.ReporterId != userId && roleClaim != "NGO" && roleClaim != "Admin" && !User.IsInRole("NGO") && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            report.Status = statusDto.Status;
            _missingPersonRepository.Update(report);
            await _missingPersonRepository.SaveChangesAsync();

            var all = await _missingPersonRepository.GetMissingPersonsWithDetailsAsync();
            var detailed = all.First(m => m.Id == id);
            return Ok(_mapper.Map<MissingPersonDto>(detailed));
        }
    }
}

