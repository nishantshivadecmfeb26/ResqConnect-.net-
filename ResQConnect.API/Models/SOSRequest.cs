using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResQConnect.API.Models
{
    public class SOSRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public int? DisasterId { get; set; }

        [ForeignKey("DisasterId")]
        public Disaster? Disaster { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = "Rescue"; // Medical Assistance, Food, Water, Rescue, Evacuation, Shelter

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Dispatched, Resolved, Cancelled

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // New fields for the redesigned workflow
        [Required]
        [MaxLength(100)]
        public string VictimName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string ContactNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DisasterType { get; set; } = string.Empty;

        [Required]
        public int NumberOfPeople { get; set; } = 1;

        [Required]
        [MaxLength(20)]
        public string EmergencyLevel { get; set; } = "Medium"; // Low, Medium, High, Critical

        public int? AssignedNGOId { get; set; }

        [ForeignKey("AssignedNGOId")]
        public User? AssignedNGO { get; set; }

        public int? AssignedVolunteerId { get; set; }

        [ForeignKey("AssignedVolunteerId")]
        public User? AssignedVolunteer { get; set; }

        public int? GovernmentOfficerId { get; set; }

        [ForeignKey("GovernmentOfficerId")]
        public User? GovernmentOfficer { get; set; }

        [Required]
        [MaxLength(50)]
        public string CurrentStatus { get; set; } = "Pending";

        public DateTime? AssignedDate { get; set; }
        public DateTime? CompletedDate { get; set; }

        [MaxLength(500)]
        public string? ProofImageUrl { get; set; }

        [MaxLength(1000)]
        public string? Remarks { get; set; }
    }
}

