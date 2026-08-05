using AutoMapper;
using ResQConnect.API.Data;
using ResQConnect.API.DTOs;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ResQConnect.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IRepository<Notification> _notificationRepo;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public NotificationService(
            IRepository<Notification> notificationRepo,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _notificationRepo = notificationRepo;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(int userId)
        {
            var notifications = await _notificationRepo.FindAsync(n => n.UserId == userId);
            return _mapper.Map<IEnumerable<NotificationDto>>(notifications.OrderByDescending(n => n.CreatedAt));
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto)
        {
            var notification = _mapper.Map<Notification>(createDto);
            notification.CreatedAt = DateTime.UtcNow;
            notification.IsRead = false;

            await _notificationRepo.AddAsync(notification);
            await _notificationRepo.SaveChangesAsync();

            return _mapper.Map<NotificationDto>(notification);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var notification = await _notificationRepo.GetByIdAsync(notificationId);
            if (notification == null) return false;

            notification.IsRead = true;
            _notificationRepo.Update(notification);
            return await _notificationRepo.SaveChangesAsync();
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var notifications = await _notificationRepo.FindAsync(n => n.UserId == userId && !n.IsRead);
            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                _notificationRepo.Update(notification);
            }
            return await _notificationRepo.SaveChangesAsync();
        }

        public async Task SendNotificationToRoleAsync(int roleId, string title, string message)
        {
            var users = await _userRepository.FindAsync(u => u.RoleId == roleId);
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    Title = title,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepo.AddAsync(notification);
            }
            await _notificationRepo.SaveChangesAsync();
        }

        public async Task SendNotificationToAllAsync(string title, string message)
        {
            var users = await _userRepository.GetAllAsync();
            foreach (var user in users)
            {
                var notification = new Notification
                {
                    UserId = user.Id,
                    Title = title,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _notificationRepo.AddAsync(notification);
            }
            await _notificationRepo.SaveChangesAsync();
        }
    }
}

