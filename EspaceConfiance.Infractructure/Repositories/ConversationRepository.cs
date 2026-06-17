using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class ConversationRepository(AppDbContext context)
    : GenericRepository<Conversation>(context), IConversationRepository
{
    public async Task<Conversation?> GetWithParticipantsAsync(Guid conversationId) =>
        await DbSet
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .FirstOrDefaultAsync(c => c.Id == conversationId);

    public async Task<Conversation?> GetBetweenUsersAsync(Guid userId1, Guid userId2) =>
        await DbSet
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .Where(c =>
                c.Participants.Any(p => p.UserId == userId1) &&
                c.Participants.Any(p => p.UserId == userId2) &&
                c.Participants.Count == 2)
            .FirstOrDefaultAsync();

    public async Task<IEnumerable<Conversation>> GetUserConversationsAsync(Guid userId) =>
        await DbSet
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .Where(c => c.Participants.Any(p => p.UserId == userId))
            .OrderByDescending(c => c.Messages.Max(m => (DateTime?)m.SentAt) ?? c.CreatedAt)
            .ToListAsync();

    public async Task<int> GetUnreadCountAsync(Guid conversationId, Guid userId) =>
        await context.Messages
            .CountAsync(m => m.ConversationId == conversationId && m.SenderId != userId && !m.IsRead);

    public async Task AddAsync(ConversationParticipant participant) =>
        await context.ConversationParticipants.AddAsync(participant);
}
