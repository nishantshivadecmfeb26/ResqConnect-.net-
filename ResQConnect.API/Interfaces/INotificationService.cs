using ResQConnect.API.DTOs;

namespace ResQConnect.API.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(int userId);
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createDto);
        Task<bool> MarkAsReadAsync(int notificationId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task SendNotificationToRoleAsync(int roleId, string title, string message);
        Task SendNotificationToAllAsync(string title, string message);
    }
}

