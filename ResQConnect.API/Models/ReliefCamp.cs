using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ResQConnect.API.Models
{
    public class ReliefCamp
    {
        [Key]
        public int Id { get; set; }

        public int? DisasterId { get; set; }

        [ForeignKey("DisasterId")]
        public Disaster? Disaster { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Address { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public int Capacity { get; set; }

        [Required]
        public int CurrentOccupancy { get; set; } = 0;

        [Required]
        [MaxLength(100)]
        public string ContactPerson { get; set; } = string.Empty;

        [Required]
        [Phone]
        [MaxLength(20)]
        public string ContactNumber { get; set; } = string.Empty;

        // Navigation properties
        [JsonIgnore]
        public ICollection<Resource> Resources { get; set; } = new List<Resource>();

        [JsonIgnore]
        public ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
    }
}

