using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class HazardReportDto
    {
        public int Id { get; set; }
        public int ReporterId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string HazardType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateHazardReportDto
    {
        [Required]
        [MaxLength(50)]
        [RegularExpression(@"^[a-zA-Z\s\-]{2,50}$", ErrorMessage = "Hazard type can only contain letters, spaces, and hyphens.")]
        public string HazardType { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        [RegularExpression(@"^[a-zA-Z0-9\s\-',./()&!?\n]{5,500}$", ErrorMessage = "Description must be 5-500 characters with only allowed characters.")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }
    }
}
