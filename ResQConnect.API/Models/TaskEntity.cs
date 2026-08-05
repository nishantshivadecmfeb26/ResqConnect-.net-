using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResQConnect.API.Models
{
    [Table("Tasks")]
    public class TaskEntity
    {
        [Key]
        public int Id { get; set; }

        public int? VolunteerId { get; set; } // Nullable, task can be unassigned

        [ForeignKey("VolunteerId")]
        public Volunteer? Volunteer { get; set; }

        [Required]
        public int CampId { get; set; }

        [ForeignKey("CampId")]
        public ReliefCamp? ReliefCamp { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "Medium"; // Low, Medium, High

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Assigned"; // Assigned, InProgress, Completed, Cancelled

        [Required]
        public int RequiredSkillTier { get; set; } = 1; // Tier 1, 2, or 3

        [Required]
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedDate { get; set; }

        [MaxLength(1000)]
        public string? ProgressNotes { get; set; }

        [MaxLength(500)]
        public string? ProofImageUrl { get; set; }
    }
}

