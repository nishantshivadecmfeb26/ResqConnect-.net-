using System.ComponentModel.DataAnnotations;

namespace ResQConnect.API.DTOs
{
    public class RegisterDto
    {
        [Required]
        [MaxLength(100)]
        [RegularExpression(@"^[a-zA-Z\s'-]{2,100}$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        [MaxLength(50)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$", ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number.")]
        public string Password { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        [RegularExpression(@"^(?:\+91|0)?[6-9]\d{9}$", ErrorMessage = "Invalid phone number. Enter 10-digit Indian number or +91xxxxxxxxxx")]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [Range(1, 5)]
        public int RoleId { get; set; } // 1: Victim, 2: Volunteer, 3: NGO, 4: Government Officer, 5: Admin

        public int? AssignedNGOId { get; set; }
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class UpdateProfileDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        public string? NewPassword { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}

