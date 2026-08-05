using System;
using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class DisasterForecastDto
    {
        public int Id { get; set; }
        public string DistrictName { get; set; } = string.Empty;
        public string StateName { get; set; } = string.Empty;
        public string DisasterType { get; set; } = "Flood";
        public double RainfallIntensity { get; set; }
        public double RiverLevelPercentage { get; set; }
        public int HistoricalFrequency { get; set; }
        public double VulnerabilityIndex { get; set; }
        public double RiskScore { get; set; }
        public string RiskCategory { get; set; } = string.Empty;
        public int EstimatedPopulationImpact { get; set; }
        public DateTime ForecastDate { get; set; }
    }

    public class CreateDisasterForecastDto
    {
        [Required]
        [MaxLength(100)]
        public string DistrictName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string StateName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string DisasterType { get; set; } = "Flood";

        [Required]
        [Range(0, 500)]
        public double RainfallIntensity { get; set; } // mm

        [Required]
        [Range(0, 200)]
        public double RiverLevelPercentage { get; set; } // % of FDL

        [Required]
        [Range(0, 100)]
        public int HistoricalFrequency { get; set; } // Count of past disasters in last 10 years

        [Required]
        [Range(0.0, 1.0)]
        public double VulnerabilityIndex { get; set; } // 0.0 to 1.0

        [Required]
        [Range(1, 10000000)]
        public int EstimatedPopulationImpact { get; set; }
    }
}

