using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResQConnect.API.Models
{
    public class MissingPerson
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ReporterId { get; set; }

        [ForeignKey("ReporterId")]
        public User? Reporter { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int Age { get; set; }

        [Required]
        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        [MaxLength(255)]
        public string Photo { get; set; } = string.Empty; // Image file path or URL

        [Required]
        [MaxLength(255)]
        public string LastSeenLocation { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Missing"; // Missing, Found

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

