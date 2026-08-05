using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ResQConnect.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        [JsonIgnore]
        public ICollection<Disaster> Disasters { get; set; } = new List<Disaster>();

        [JsonIgnore]
        public ICollection<SOSRequest> SOSRequests { get; set; } = new List<SOSRequest>();

        [JsonIgnore]
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        [JsonIgnore]
        public ICollection<MissingPerson> MissingPersons { get; set; } = new List<MissingPerson>();

        public Volunteer? Volunteer { get; set; }

        public int? CampId { get; set; }

        [ForeignKey("CampId")]
        public ReliefCamp? Camp { get; set; }
    }
}

