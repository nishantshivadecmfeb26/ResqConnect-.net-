using ResQConnect.API.DTOs;

namespace ResQConnect.API.Interfaces
{
    public interface IAuthService
    {
        Task<UserDto?> RegisterAsync(RegisterDto registerDto);
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<UserDto?> GetProfileAsync(int userId);
        Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto);
        string GenerateJwtToken(UserDto userDto);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<IEnumerable<UserDto>> GetActiveNGOsAsync();
    }
}

