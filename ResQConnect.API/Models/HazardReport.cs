using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResQConnect.API.Models
{
    // A crowd-sourced map marker raised by any user (typically a victim) to flag a
    // blocked/collapsed road, bridge, or other hazard obstructing relief movement.
    public class HazardReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ReporterId { get; set; }

        [ForeignKey("ReporterId")]
        public User? Reporter { get; set; }

        [Required]
        [MaxLength(50)]
        public string HazardType { get; set; } = string.Empty; // e.g. Road Blocked, Bridge Collapsed, Landslide, Flooded Road, Other

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty; // Why it is marked

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
