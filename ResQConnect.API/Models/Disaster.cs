using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ResQConnect.API.Models
{
    public class Disaster
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // Earthquake, Flood, Wildfire, Hurricane, etc.

        [Required]
        [MaxLength(20)]
        public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // Active, Contained, Closed

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        [ForeignKey("CreatedBy")]
        public User? Creator { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [JsonIgnore]
        public ICollection<SOSRequest> SOSRequests { get; set; } = new List<SOSRequest>();

        [JsonIgnore]
        public ICollection<ReliefCamp> ReliefCamps { get; set; } = new List<ReliefCamp>();
    }
}

