using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ResQConnect.API.Models
{
    public class Volunteer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }

        [Required]
        [MaxLength(500)]
        public string Skills { get; set; } = string.Empty; // Comma separated list of skills

        [Required]
        [MaxLength(20)]
        public string AvailabilityStatus { get; set; } = "Available"; // Available, Busy, Offline

        [Required]
        [MaxLength(255)]
        public string CurrentLocation { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string VerificationStatus { get; set; } = "Pending"; // Pending, Verified, Rejected

        [Required]
        public int SkillTier { get; set; } = 1; // Tier 1 (General/Unverified), Tier 2 (Field/Verified), Tier 3 (Critical/Medical/Authority)

        [Required]
        public int CredibilityScore { get; set; } = 0;

        [MaxLength(500)]
        public string? DocumentUrl { get; set; }

        [MaxLength(50)]
        public string? IdProofNumber { get; set; }

        public int? AssignedNGOId { get; set; }

        [ForeignKey("AssignedNGOId")]
        [JsonIgnore]
        public User? AssignedNGO { get; set; }

        // Navigation properties
        [JsonIgnore]
        public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
    }
}

