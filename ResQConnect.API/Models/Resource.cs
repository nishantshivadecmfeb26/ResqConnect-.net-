using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResQConnect.API.Models
{
    public class Resource
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CampId { get; set; }

        [ForeignKey("CampId")]
        public ReliefCamp? ReliefCamp { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // Food, Water, First-aid, etc.

        [Required]
        public int Quantity { get; set; }

        [Required]
        [MaxLength(20)]
        public string Unit { get; set; } = string.Empty; // kg, liters, boxes, units

        [Required]
        public int ThresholdQuantity { get; set; }

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

