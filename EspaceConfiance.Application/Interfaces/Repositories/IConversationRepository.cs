using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IConversationRepository : IGenericRepository<Conversation>
{
    Task<Conversation?> GetWithParticipantsAsync(Guid conversationId);
    Task<Conversation?> GetBetweenUsersAsync(Guid userId1, Guid userId2);
    Task<IEnumerable<Conversation>> GetUserConversationsAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid conversationId, Guid userId);
}
