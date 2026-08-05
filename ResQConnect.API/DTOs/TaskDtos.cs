using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        public int? VolunteerId { get; set; }
        public string VolunteerName { get; set; } = string.Empty;
        public int CampId { get; set; }
        public string CampName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int RequiredSkillTier { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? ProgressNotes { get; set; }
        public string? ProofImageUrl { get; set; }
    }

    public class CreateTaskDto
    {
        public int? VolunteerId { get; set; }

        [Required]
        public int CampId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "Medium";

        [Required]
        public int RequiredSkillTier { get; set; } = 1; // Tier 1, 2, or 3
    }

    public class UpdateTaskDto
    {
        public int? VolunteerId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Assigned, Accepted, InProgress, Completed, Rejected
    }

    public class UpdateTaskProgressDto
    {
        [MaxLength(1000)]
        public string? ProgressNotes { get; set; }

        [MaxLength(500)]
        public string? ProofImageUrl { get; set; }
    }
}

