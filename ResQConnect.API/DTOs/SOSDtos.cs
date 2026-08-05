using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class SOSRequestDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserPhone { get; set; } = string.Empty;
        public int? DisasterId { get; set; }
        public string DisasterTitle { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // New fields
        public string VictimName { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string DisasterType { get; set; } = string.Empty;
        public int NumberOfPeople { get; set; }
        public string EmergencyLevel { get; set; } = string.Empty;

        public int? AssignedNGOId { get; set; }
        public string? AssignedNGOName { get; set; }
        public int? AssignedVolunteerId { get; set; }
        public string? AssignedVolunteerName { get; set; }
        public int? GovernmentOfficerId { get; set; }
        public string? GovernmentOfficerName { get; set; }

        public string CurrentStatus { get; set; } = string.Empty;
        public DateTime? AssignedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? ProofImageUrl { get; set; }
        public string? Remarks { get; set; }
    }

    public class CreateSOSRequestDto
    {
        public int? DisasterId { get; set; }

        [Required]
        [MaxLength(100)]
        [RegularExpression(@"^[a-zA-Z\s'-]{2,100}$", ErrorMessage = "Victim name can only contain letters, spaces, hyphens, and apostrophes.")]
        public string VictimName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [RegularExpression(@"^(?:\+91|0)?[6-9]\d{9}$", ErrorMessage = "Invalid phone number. Enter 10-digit Indian number or +91xxxxxxxxxx")]
        public string ContactNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [RegularExpression(@"^[a-zA-Z0-9\s\-',./()&]{2,100}$", ErrorMessage = "Disaster type can only contain letters, numbers, and basic punctuation.")]
        public string DisasterType { get; set; } = string.Empty;

        [Required]
        [Range(1, 10000, ErrorMessage = "Number of people must be between 1 and 10000.")]
        public int NumberOfPeople { get; set; }

        [Required]
        [MaxLength(20)]
        public string EmergencyLevel { get; set; } = "Medium";

        [Required]
        [MaxLength(500)]
        [RegularExpression(@"^[a-zA-Z0-9\s\-',./()&!?\n]{5,500}$", ErrorMessage = "Description must be 5-500 characters with only allowed characters.")]
        public string Description { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        [Required]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }
    }

    public class UpdateSOSStatusDto
    {
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Pending, Dispatched, Resolved, Cancelled
    }

    public class AssignNGODto
    {
        [Required]
        public int NGOId { get; set; }
    }

    public class AssignVolunteerDto
    {
        [Required]
        public int VolunteerId { get; set; }
    }

    public class UpdateVolunteerTaskStatusDto
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;
    }

    public class UploadTaskProofDto
    {
        [Required]
        public string ProofImageUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Remarks { get; set; } = string.Empty;
    }
}

