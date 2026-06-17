using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Conversation;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IConversationService
{
    Task<Result<ConversationDto>> GetOrCreateConversationAsync(Guid userId, Guid otherUserId);
    Task<Result<IEnumerable<ConversationDto>>> GetUserConversationsAsync(Guid userId);
    Task<Result<MessageDto>> SendMessageAsync(Guid conversationId, Guid senderId, SendMessageDto dto);
    Task<Result<IEnumerable<MessageDto>>> GetMessagesAsync(Guid conversationId, Guid userId, int page, int pageSize);
    Task<Result> MarkAsReadAsync(Guid conversationId, Guid userId);
}
