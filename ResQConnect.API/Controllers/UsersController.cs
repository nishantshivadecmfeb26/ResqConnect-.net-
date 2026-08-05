using AutoMapper;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ResQConnect.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IMapper _mapper;

        public UsersController(
            IUserRepository userRepository, 
            IRepository<Role> roleRepository,
            IMapper mapper)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _mapper = mapper;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersWithRolesAsync();
            var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
            return Ok(userDtos);
        }

        [Authorize(Roles = "Admin,Government Officer")]
        [HttpGet("ngos")]
        public async Task<IActionResult> GetNGOs()
        {
            var ngos = await _userRepository.FindAsync(u => u.RoleId == 3 && u.IsActive);
            var userDtos = _mapper.Map<IEnumerable<UserDto>>(ngos);
            return Ok(userDtos);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userRepository.GetUserWithRoleAndVolunteerAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            // Check if role is valid
            var role = await _roleRepository.GetByIdAsync(updateUserDto.RoleId);
            if (role == null)
            {
                return BadRequest(new { Message = "Invalid Role ID." });
            }

            user.Name = updateUserDto.Name;
            user.Email = updateUserDto.Email;
            user.Phone = updateUserDto.Phone;
            user.RoleId = updateUserDto.RoleId;
            user.UpdatedAt = DateTime.UtcNow;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            var updatedUser = await _userRepository.GetUserWithRoleAndVolunteerAsync(id);
            return Ok(_mapper.Map<UserDto>(updatedUser));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            _userRepository.Delete(user);
            await _userRepository.SaveChangesAsync();

            return Ok(new { Message = "User deleted successfully." });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return Ok(new { Message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully.", IsActive = user.IsActive });
        }
    }
}

