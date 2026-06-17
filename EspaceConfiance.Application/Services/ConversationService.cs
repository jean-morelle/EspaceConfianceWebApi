using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Conversation;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.Services;

public class ConversationService(IUnitOfWork uow, INotificationService notificationService) : IConversationService
{
    public async Task<Result<ConversationDto>> GetOrCreateConversationAsync(Guid userId, Guid otherUserId)
    {
        if (userId == otherUserId)
            return Result<ConversationDto>.Failure("Impossible de créer une conversation avec vous-même.");

        var blocked = await uow.Blocks.IsBlockedAsync(otherUserId, userId);
        if (blocked)
            return Result<ConversationDto>.Failure("Impossible de contacter cet utilisateur.", 403);

        var existing = await uow.Conversations.GetBetweenUsersAsync(userId, otherUserId);
        if (existing is not null)
            return Result<ConversationDto>.Success(await MapToDto(existing, userId));

        var conversation = new Conversation();
        conversation.Participants.Add(new ConversationParticipant { UserId = userId, ConversationId = conversation.Id });
        conversation.Participants.Add(new ConversationParticipant { UserId = otherUserId, ConversationId = conversation.Id });

        await uow.Conversations.AddAsync(conversation);
        await uow.SaveChangesAsync();

        var full = await uow.Conversations.GetWithParticipantsAsync(conversation.Id);
        return Result<ConversationDto>.Success(await MapToDto(full!, userId), 201);
    }

    public async Task<Result<IEnumerable<ConversationDto>>> GetUserConversationsAsync(Guid userId)
    {
        var conversations = await uow.Conversations.GetUserConversationsAsync(userId);
        var dtos = new List<ConversationDto>();
        foreach (var c in conversations)
            dtos.Add(await MapToDto(c, userId));
        return Result<IEnumerable<ConversationDto>>.Success(dtos);
    }

    public async Task<Result<MessageDto>> SendMessageAsync(Guid conversationId, Guid senderId, SendMessageDto dto)
    {
        var conversation = await uow.Conversations.GetWithParticipantsAsync(conversationId);
        if (conversation is null)
            return Result<MessageDto>.Failure("Conversation introuvable.", 404);

        if (!conversation.Participants.Any(p => p.UserId == senderId))
            return Result<MessageDto>.Failure("Vous ne participez pas à cette conversation.", 403);

        if (string.IsNullOrWhiteSpace(dto.Content))
            return Result<MessageDto>.Failure("Le message ne peut pas être vide.");

        var sender = await uow.Users.GetByIdAsync(senderId);
        var message = new Message
        {
            ConversationId = conversationId,
            SenderId = senderId,
            Content = dto.Content.Trim(),
            SentAt = DateTime.UtcNow
        };

        await uow.Messages.AddAsync(message);
        await uow.SaveChangesAsync();

        var others = conversation.Participants.Where(p => p.UserId != senderId);
        foreach (var p in others)
        {
            await notificationService.CreateNotificationAsync(
                p.UserId,
                "Nouveau message",
                $"{sender!.Username}: {dto.Content[..Math.Min(50, dto.Content.Length)]}",
                NotificationType.NewMessage,
                conversationId);
        }

        return Result<MessageDto>.Success(new MessageDto
        {
            Id = message.Id,
            ConversationId = conversationId,
            SenderId = senderId,
            SenderUsername = sender!.Username,
            SenderProfilePicture = sender.ProfilePicture,
            Content = message.Content,
            SentAt = message.SentAt,
            IsRead = false
        }, 201);
    }

    public async Task<Result<IEnumerable<MessageDto>>> GetMessagesAsync(Guid conversationId, Guid userId, int page, int pageSize)
    {
        var conversation = await uow.Conversations.GetWithParticipantsAsync(conversationId);
        if (conversation is null)
            return Result<IEnumerable<MessageDto>>.Failure("Conversation introuvable.", 404);

        if (!conversation.Participants.Any(p => p.UserId == userId))
            return Result<IEnumerable<MessageDto>>.Failure("Accès refusé.", 403);

        var messages = await uow.Messages.GetConversationMessagesAsync(conversationId, page, pageSize);
        var dtos = messages.Select(m => new MessageDto
        {
            Id = m.Id,
            ConversationId = m.ConversationId,
            SenderId = m.SenderId,
            SenderUsername = m.Sender.Username,
            SenderProfilePicture = m.Sender.ProfilePicture,
            Content = m.Content,
            SentAt = m.SentAt,
            IsRead = m.IsRead,
            ReadAt = m.ReadAt
        });
        return Result<IEnumerable<MessageDto>>.Success(dtos);
    }

    public async Task<Result> MarkAsReadAsync(Guid conversationId, Guid userId)
    {
        await uow.Messages.MarkAllAsReadAsync(conversationId, userId);
        await uow.SaveChangesAsync();
        return Result.Success();
    }

    private async Task<ConversationDto> MapToDto(Conversation c, Guid currentUserId)
    {
        var lastMessage = await uow.Messages.GetLastMessageAsync(c.Id);
        var unread = await uow.Conversations.GetUnreadCountAsync(c.Id, currentUserId);

        return new ConversationDto
        {
            Id = c.Id,
            CreatedAt = c.CreatedAt,
            UnreadCount = unread,
            Participants = c.Participants.Select(p => new ParticipantDto
            {
                UserId = p.UserId,
                Username = p.User?.Username ?? string.Empty,
                ProfilePicture = p.User?.ProfilePicture,
                IsOnline = p.User?.IsOnline ?? false
            }).ToList(),
            LastMessage = lastMessage is null ? null : new MessageDto
            {
                Id = lastMessage.Id,
                ConversationId = lastMessage.ConversationId,
                SenderId = lastMessage.SenderId,
                SenderUsername = lastMessage.Sender?.Username ?? string.Empty,
                Content = lastMessage.Content,
                SentAt = lastMessage.SentAt,
                IsRead = lastMessage.IsRead
            }
        };
    }
}
