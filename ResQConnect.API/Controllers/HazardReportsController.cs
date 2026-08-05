using System.Security.Claims;
using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;
using ResQConnect.API.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ResQConnect.API.Controllers
{
    // Crowd-sourced hazard markers (blocked/collapsed roads & bridges, etc.)
    // Any authenticated user can add a marker. A marker can be removed by the
    // user who created it, or by an Admin / Government Officer.
    [Authorize]
    [ApiController]
    [Route("api/hazard-reports")]
    public class HazardReportsController : ControllerBase
    {
        private readonly IHazardReportRepository _hazardReportRepository;
        private readonly IMapper _mapper;

        public HazardReportsController(IHazardReportRepository hazardReportRepository, IMapper mapper)
        {
            _hazardReportRepository = hazardReportRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _hazardReportRepository.GetAllWithDetailsAsync();
            var dtos = _mapper.Map<IEnumerable<HazardReportDto>>(reports);
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var report = await _hazardReportRepository.GetByIdWithDetailsAsync(id);
            if (report == null)
            {
                return NotFound(new { Message = "Hazard report not found." });
            }
            return Ok(_mapper.Map<HazardReportDto>(report));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHazardReportDto createDto)
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

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var report = _mapper.Map<HazardReport>(createDto);
            report.ReporterId = userId;
            report.CreatedAt = DateTime.UtcNow;

            await _hazardReportRepository.AddAsync(report);
            await _hazardReportRepository.SaveChangesAsync();

            var saved = await _hazardReportRepository.GetByIdWithDetailsAsync(report.Id);
            return CreatedAtAction(nameof(GetById), new { id = report.Id }, _mapper.Map<HazardReportDto>(saved));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var report = await _hazardReportRepository.GetByIdAsync(id);
            if (report == null)
            {
                return NotFound(new { Message = "Hazard report not found." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Only the original reporter, a Government Officer, or an Admin may remove a marker.
            bool isOwner = report.ReporterId == userId;
            bool isPrivileged = roleClaim == "Government Officer" || roleClaim == "Admin" || User.IsInRole("Government Officer") || User.IsInRole("Admin");

            if (!isOwner && !isPrivileged)
            {
                return Forbid();
            }

            _hazardReportRepository.Delete(report);
            await _hazardReportRepository.SaveChangesAsync();

            return Ok(new { Message = "Hazard report removed successfully." });
        }
    }
}
