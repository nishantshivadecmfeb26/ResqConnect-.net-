using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public VolunteerDto? Volunteer { get; set; }
        public int? CampId { get; set; }
    }

    public class UpdateUserDto
    {
        [Required]
        [MaxLength(100)]
        [RegularExpression(@"^[a-zA-Z\s'-]{2,100}$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        [RegularExpression(@"^(?:\+91|0)?[6-9]\d{9}$", ErrorMessage = "Invalid phone number. Enter 10-digit Indian number or +91xxxxxxxxxx")]
        public string Phone { get; set; } = string.Empty;

        [Required]
        public int RoleId { get; set; }
    }
}

