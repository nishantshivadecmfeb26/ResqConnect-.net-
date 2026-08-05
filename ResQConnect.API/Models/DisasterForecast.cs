using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.Models
{
    public class DisasterForecast
    {
        [Key]
        public int Id { get; set; }

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
        public double RainfallIntensity { get; set; } // mm

        [Required]
        public double RiverLevelPercentage { get; set; } // % of Flood Danger Level (FDL)

        [Required]
        public int HistoricalFrequency { get; set; } // Count of past disasters in last 10 years

        [Required]
        public double VulnerabilityIndex { get; set; } // 0.0 to 1.0

        [Required]
        public double RiskScore { get; set; } // Calculated

        [Required]
        [MaxLength(20)]
        public string RiskCategory { get; set; } = "Low"; // Low, Medium, High, Critical

        [Required]
        public int EstimatedPopulationImpact { get; set; }

        [Required]
        public DateTime ForecastDate { get; set; } = DateTime.UtcNow;
    }
}

