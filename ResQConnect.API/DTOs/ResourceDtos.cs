using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class ResourceDto
    {
        public int Id { get; set; }
        public int CampId { get; set; }
        public string CampName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public int ThresholdQuantity { get; set; }
        public bool IsLowStock => Quantity <= ThresholdQuantity;
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateResourceDto
    {
        [Required]
        public int CampId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(0, 1000000)]
        public int Quantity { get; set; }

        [Required]
        [MaxLength(20)]
        public string Unit { get; set; } = string.Empty;

        [Required]
        [Range(0, 1000000)]
        public int ThresholdQuantity { get; set; }
    }
}

