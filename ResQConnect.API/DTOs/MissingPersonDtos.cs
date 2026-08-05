using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class MissingPersonDto
    {
        public int Id { get; set; }
        public int ReporterId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string ReporterPhone { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Photo { get; set; } = string.Empty;
        public string LastSeenLocation { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateMissingPersonDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0, 125)]
        public int Age { get; set; }

        [Required]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        public string? PhotoBase64 { get; set; } // For base64 uploads

        [Required]
        [MaxLength(255)]
        public string LastSeenLocation { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateMissingPersonStatusDto
    {
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Missing, Found
    }
}

