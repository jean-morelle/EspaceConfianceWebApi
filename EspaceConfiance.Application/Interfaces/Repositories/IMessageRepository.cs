using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IMessageRepository : IGenericRepository<Message>
{
    Task<IEnumerable<Message>> GetConversationMessagesAsync(Guid conversationId, int page, int pageSize);
    Task MarkAllAsReadAsync(Guid conversationId, Guid userId);
    Task<Message?> GetLastMessageAsync(Guid conversationId);
}
