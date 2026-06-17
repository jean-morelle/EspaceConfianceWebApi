using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class NotificationRepository(AppDbContext context)
    : GenericRepository<Notification>(context), INotificationRepository
{
    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(Guid userId) =>
        await DbSet
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

    public async Task<int> GetUnreadCountAsync(Guid userId) =>
        await DbSet.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await DbSet
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }
}
