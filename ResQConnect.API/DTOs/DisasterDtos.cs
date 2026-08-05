using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class DisasterDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int CreatedBy { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDisasterDto
    {
        [Required]
        [MaxLength(150)]
        [RegularExpression(@"^[a-zA-Z0-9\s\-',./()&!?]{2,150}$", ErrorMessage = "Title can only contain letters, numbers, and basic punctuation.")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        [RegularExpression(@"^[a-zA-Z0-9\s\-',./()&!?\n]{5,1000}$", ErrorMessage = "Description must be 5-1000 characters and contain only allowed characters.")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Active, Contained, Closed

        [Required]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
    }
}

