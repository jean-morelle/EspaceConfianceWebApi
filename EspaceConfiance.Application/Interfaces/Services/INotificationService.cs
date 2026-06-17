using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Notification;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface INotificationService
{
    Task<Result<IEnumerable<NotificationDto>>> GetUserNotificationsAsync(Guid userId);
    Task<Result<int>> GetUnreadCountAsync(Guid userId);
    Task<Result> MarkAllAsReadAsync(Guid userId);
    Task CreateNotificationAsync(Guid userId, string title, string content, NotificationType type, Guid? referenceId = null);
}
