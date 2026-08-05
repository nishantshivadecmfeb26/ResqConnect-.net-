using System.Security.Claims;
using ResQConnect.API.Data;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ResQConnect.API.Controllers
{
    [Authorize(Roles = "Government Officer")]
    [ApiController]
    [Route("api/[controller]")]
    public class ForecastController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDisasterService _disasterService;

        public ForecastController(ApplicationDbContext context, IDisasterService disasterService)
        {
            _context = context;
            _disasterService = disasterService;
        }

        [HttpGet]
        public async Task<IActionResult> GetForecasts()
        {
            var forecasts = await _context.DisasterForecasts
                .OrderByDescending(f => f.RiskScore)
                .ToListAsync();

            var dtos = forecasts.Select(f => new DisasterForecastDto
            {
                Id = f.Id,
                DistrictName = f.DistrictName,
                StateName = f.StateName,
                DisasterType = f.DisasterType,
                RainfallIntensity = f.RainfallIntensity,
                RiverLevelPercentage = f.RiverLevelPercentage,
                HistoricalFrequency = f.HistoricalFrequency,
                VulnerabilityIndex = f.VulnerabilityIndex,
                RiskScore = f.RiskScore,
                RiskCategory = f.RiskCategory,
                EstimatedPopulationImpact = f.EstimatedPopulationImpact,
                ForecastDate = f.ForecastDate
            });

            return Ok(dtos);
        }

        [Authorize(Roles = "Government Officer")]
        [HttpPost("trigger-disaster/{id}")]
        public async Task<IActionResult> TriggerDisaster(int id)
        {
            var forecast = await _context.DisasterForecasts.FindAsync(id);
            if (forecast == null)
            {
                return NotFound(new { Message = "Forecast record not found." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            // Map district name to approximate coordinates for command-center display.
            double lat = 20.5937; // Default India center
            double lng = 78.9629;
            string disasterType = forecast.DisasterType;

            switch (forecast.DistrictName.ToLower())
            {
                case "wayanad":
                    lat = 11.6854;
                    lng = 76.1320;
                    break;
                case "cuttack":
                    lat = 20.4625;
                    lng = 85.8830;
                    break;
                case "chamoli":
                    lat = 30.4079;
                    lng = 79.3323;
                    break;
                case "mumbai suburbs":
                    lat = 19.0760;
                    lng = 72.8777;
                    break;
                case "dharamshala":
                    lat = 32.2190;
                    lng = 76.3234;
                    break;
            }

            var createDto = new CreateDisasterDto
            {
                Title = $"Disaster Alert: {forecast.DistrictName} {disasterType}",
                Description = $"{disasterType} disaster declared based on Early Warning Forecast in {forecast.DistrictName}, {forecast.StateName}. Primary hazard indicator: {forecast.RainfallIntensity}. Secondary exposure indicator: {forecast.RiverLevelPercentage}. Historical frequency: {forecast.HistoricalFrequency}. Estimated population impact is {forecast.EstimatedPopulationImpact}.",
                Type = disasterType,
                Severity = forecast.RiskCategory == "Critical" ? "Critical" : (forecast.RiskCategory == "High" ? "High" : "Medium"),
                Status = "Active",
                Latitude = lat,
                Longitude = lng,
                StartDate = DateTime.UtcNow
            };

            var result = await _disasterService.CreateDisasterAsync(createDto, userId);
            
            // Optionally, remove the forecast or update its state
            _context.DisasterForecasts.Remove(forecast);
            await _context.SaveChangesAsync();

            return Ok(result);
        }

        [Authorize(Roles = "Government Officer")]
        [HttpPost]
        public async Task<IActionResult> CreateForecast([FromBody] CreateDisasterForecastDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Calculate RiskScore & RiskCategory
            double rainfallWeight = Math.Min(createDto.RainfallIntensity / 200.0 * 40.0, 40.0);
            double riverWeight = Math.Min(createDto.RiverLevelPercentage / 150.0 * 30.0, 30.0);
            double historyWeight = Math.Min(createDto.HistoricalFrequency / 10.0 * 15.0, 15.0);
            double vulnerabilityWeight = createDto.VulnerabilityIndex * 15.0;

            double riskScore = rainfallWeight + riverWeight + historyWeight + vulnerabilityWeight;
            if (riskScore > 100) riskScore = 100;

            string riskCategory = "Low";
            if (riskScore >= 80) riskCategory = "Critical";
            else if (riskScore >= 60) riskCategory = "High";
            else if (riskScore >= 40) riskCategory = "Medium";

            var forecast = new DisasterForecast
            {
                DistrictName = createDto.DistrictName,
                StateName = createDto.StateName,
                DisasterType = createDto.DisasterType,
                RainfallIntensity = createDto.RainfallIntensity,
                RiverLevelPercentage = createDto.RiverLevelPercentage,
                HistoricalFrequency = createDto.HistoricalFrequency,
                VulnerabilityIndex = createDto.VulnerabilityIndex,
                RiskScore = riskScore,
                RiskCategory = riskCategory,
                EstimatedPopulationImpact = createDto.EstimatedPopulationImpact,
                ForecastDate = DateTime.UtcNow
            };

            _context.DisasterForecasts.Add(forecast);
            await _context.SaveChangesAsync();

            var resultDto = new DisasterForecastDto
            {
                Id = forecast.Id,
                DistrictName = forecast.DistrictName,
                StateName = forecast.StateName,
                DisasterType = forecast.DisasterType,
                RainfallIntensity = forecast.RainfallIntensity,
                RiverLevelPercentage = forecast.RiverLevelPercentage,
                HistoricalFrequency = forecast.HistoricalFrequency,
                VulnerabilityIndex = forecast.VulnerabilityIndex,
                RiskScore = forecast.RiskScore,
                RiskCategory = forecast.RiskCategory,
                EstimatedPopulationImpact = forecast.EstimatedPopulationImpact,
                ForecastDate = forecast.ForecastDate
            };

            return CreatedAtAction(nameof(GetForecasts), new { id = forecast.Id }, resultDto);
        }
    }
}

