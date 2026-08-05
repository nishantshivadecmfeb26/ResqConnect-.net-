using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace ResQConnect.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IRepository<Volunteer> _volunteerRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;

        public AuthService(
            IUserRepository userRepository,
            IRepository<Role> roleRepository,
            IRepository<Volunteer> volunteerRepository,
            IMapper mapper,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _volunteerRepository = volunteerRepository;
            _mapper = mapper;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
        }

        public async Task<UserDto?> RegisterAsync(RegisterDto registerDto)
        {
            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
            if (existingUser != null)
            {
                return null;
            }

            // Create new user
            var user = _mapper.Map<User>(registerDto);
            user.PasswordHash = _passwordHasher.HashPassword(user, registerDto.Password);
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            // Fetch created user with Role
            var savedUser = await _userRepository.GetUserWithRoleAndVolunteerAsync(user.Id);

            // If user is a volunteer, create a default volunteer profile
            if (registerDto.RoleId == 2 && savedUser != null) // 2 represents Volunteer role
            {
                var volunteer = new Volunteer
                {
                    UserId = savedUser.Id,
                    Skills = "General Assistance",
                    AvailabilityStatus = "Available",
                    CurrentLocation = "Remote / Online",
                    VerificationStatus = "Pending",
                    AssignedNGOId = registerDto.AssignedNGOId
                };
                await _volunteerRepository.AddAsync(volunteer);
                await _volunteerRepository.SaveChangesAsync();

                // Re-fetch to load volunteer profile
                savedUser = await _userRepository.GetUserWithRoleAndVolunteerAsync(user.Id);
            }

            return _mapper.Map<UserDto>(savedUser);
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            if (user == null)
            {
                return null;
            }

            // Check if user account is active
            if (!user.IsActive)
            {
                return null;
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return null;
            }

            // Get user with full associations
            var userWithDetails = await _userRepository.GetUserWithRoleAndVolunteerAsync(user.Id);
            var userDto = _mapper.Map<UserDto>(userWithDetails);

            var token = GenerateJwtToken(userDto);

            return new LoginResponseDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<UserDto?> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetUserWithRoleAndVolunteerAsync(userId);
            if (user == null)
            {
                return null;
            }

            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto)
        {
            var user = await _userRepository.GetUserWithRoleAndVolunteerAsync(userId);
            if (user == null)
            {
                return null;
            }

            user.Name = updateProfileDto.Name;
            user.Phone = updateProfileDto.Phone;
            user.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(updateProfileDto.NewPassword))
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, updateProfileDto.NewPassword);
            }

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return _mapper.Map<UserDto>(user);
        }

        public string GenerateJwtToken(UserDto userDto)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            
            // Read key from configuration, fall back to default for development
            var secretKey = _configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForResQConnectDevDeployment2026";
            var key = Encoding.ASCII.GetBytes(secretKey);

            var issuer = _configuration["JwtSettings:Issuer"] ?? "ResQConnect.API";
            var audience = _configuration["JwtSettings:Audience"] ?? "ResQConnect.Client";
            var expiryInDays = Convert.ToDouble(_configuration["JwtSettings:ExpiryInDays"] ?? "7");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userDto.Id.ToString()),
                    new Claim(ClaimTypes.Name, userDto.Name),
                    new Claim(ClaimTypes.Email, userDto.Email),
                    new Claim(ClaimTypes.Role, userDto.RoleName)
                }),
                Expires = DateTime.UtcNow.AddDays(expiryInDays),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, currentPassword);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return false;
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserDto>> GetActiveNGOsAsync()
        {
            var ngos = await _userRepository.FindAsync(u => u.RoleId == 3 && u.IsActive);
            return _mapper.Map<IEnumerable<UserDto>>(ngos);
        }
    }
}

