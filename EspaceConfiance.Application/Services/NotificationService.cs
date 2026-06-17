using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Notification;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.Services;

public class NotificationService(IUnitOfWork uow) : INotificationService
{
    public async Task<Result<IEnumerable<NotificationDto>>> GetUserNotificationsAsync(Guid userId)
    {
        var notifications = await uow.Notifications.GetUserNotificationsAsync(userId);
        var dtos = notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Content = n.Content,
            IsRead = n.IsRead,
            Type = n.Type,
            ReferenceId = n.ReferenceId,
            CreatedAt = n.CreatedAt
        });
        return Result<IEnumerable<NotificationDto>>.Success(dtos);
    }

    public async Task<Result<int>> GetUnreadCountAsync(Guid userId)
    {
        var count = await uow.Notifications.GetUnreadCountAsync(userId);
        return Result<int>.Success(count);
    }

    public async Task<Result> MarkAllAsReadAsync(Guid userId)
    {
        await uow.Notifications.MarkAllAsReadAsync(userId);
        await uow.SaveChangesAsync();
        return Result.Success();
    }

    public async Task CreateNotificationAsync(Guid userId, string title, string content, NotificationType type, Guid? referenceId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Content = content,
            Type = type,
            ReferenceId = referenceId
        };

        await uow.Notifications.AddAsync(notification);
        await uow.SaveChangesAsync();
    }
}
