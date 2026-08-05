using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class VolunteerDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string UserPhone { get; set; } = string.Empty;
        public string Skills { get; set; } = string.Empty;
        public string AvailabilityStatus { get; set; } = string.Empty;
        public string CurrentLocation { get; set; } = string.Empty;
        public string VerificationStatus { get; set; } = string.Empty;
        public int SkillTier { get; set; }
        public int CredibilityScore { get; set; }
        public string? DocumentUrl { get; set; }
        public string? IdProofNumber { get; set; }
        public int? AssignedNGOId { get; set; }
        public string? AssignedNGOName { get; set; }
    }

    public class CreateVolunteerProfileDto
    {
        [Required]
        [MaxLength(500)]
        public string Skills { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string CurrentLocation { get; set; } = string.Empty;
    }

    public class UpdateVolunteerProfileDto
    {
        [Required]
        [MaxLength(500)]
        public string Skills { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string AvailabilityStatus { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string CurrentLocation { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? DocumentUrl { get; set; }

        [MaxLength(50)]
        public string? IdProofNumber { get; set; }
    }

    public class VerifyVolunteerDto
    {
        [Required]
        [MaxLength(20)]
        public string VerificationStatus { get; set; } = string.Empty; // Pending, Verified, Rejected

        public int? SkillTier { get; set; } // Set by NGO/Admin
    }
}

