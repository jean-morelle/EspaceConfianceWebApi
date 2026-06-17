using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class MessageRepository(AppDbContext context)
    : GenericRepository<Message>(context), IMessageRepository
{
    public async Task<IEnumerable<Message>> GetConversationMessagesAsync(Guid conversationId, int page, int pageSize) =>
        await DbSet
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

    public async Task MarkAllAsReadAsync(Guid conversationId, Guid userId)
    {
        await DbSet
            .Where(m => m.ConversationId == conversationId && m.SenderId != userId && !m.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(m => m.IsRead, true)
                .SetProperty(m => m.ReadAt, DateTime.UtcNow));
    }

    public async Task<Message?> GetLastMessageAsync(Guid conversationId) =>
        await DbSet
            .Include(m => m.Sender)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .FirstOrDefaultAsync();
}
