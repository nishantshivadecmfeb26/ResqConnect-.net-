using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class ReliefCampDto
    {
        public int Id { get; set; }
        public int? DisasterId { get; set; }
        public string DisasterTitle { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int Capacity { get; set; }
        public int CurrentOccupancy { get; set; }
        public string ContactPerson { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
    }

    public class CreateCampDto
    {
        public int? DisasterId { get; set; }

        [Required]
        [MaxLength(150)]
        [RegularExpression(@"^[a-zA-Z0-9\s\-',./()&]{2,150}$", ErrorMessage = "Camp name can only contain letters, numbers, spaces, and basic punctuation.")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [RegularExpression(@"^[a-zA-Z0-9\s\-',./()&]{3,255}$", ErrorMessage = "Address can only contain letters, numbers, spaces, and basic punctuation.")]
        public string Address { get; set; } = string.Empty;

        [Required]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90.")]
        public double Latitude { get; set; }

        [Required]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180.")]
        public double Longitude { get; set; }

        [Required]
        [Range(1, 100000)]
        public int Capacity { get; set; }

        [Required]
        [Range(0, 100000)]
        public int CurrentOccupancy { get; set; }

        [Required]
        [MaxLength(100)]
        [RegularExpression(@"^[a-zA-Z\s'-]{2,100}$", ErrorMessage = "Contact person name can only contain letters, spaces, hyphens, and apostrophes.")]
        public string ContactPerson { get; set; } = string.Empty;

        [Required]
        [Phone]
        [MaxLength(20)]
        [RegularExpression(@"^(?:\+91|0)?[6-9]\d{9}$", ErrorMessage = "Invalid phone number. Enter 10-digit Indian number or +91xxxxxxxxxx")]
        public string ContactNumber { get; set; } = string.Empty;
    }
}

