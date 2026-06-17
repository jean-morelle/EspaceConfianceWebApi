using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Friend;
using EspaceConfiance.Application.DTOs.User;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.Services;

public class FriendService(IUnitOfWork uow, INotificationService notificationService) : IFriendService
{
    public async Task<Result> SendFriendRequestAsync(Guid senderId, Guid receiverId)
    {
        if (senderId == receiverId)
            return Result.Failure("Vous ne pouvez pas vous envoyer une demande d'ami.");

        var existing = await uow.FriendRequests.GetBetweenUsersAsync(senderId, receiverId);
        if (existing is not null)
            return Result.Failure(existing.Status == FriendRequestStatus.Accepted
                ? "Vous êtes déjà amis."
                : "Une demande d'ami est déjà en cours.", 409);

        var receiver = await uow.Users.GetByIdAsync(receiverId);
        if (receiver is null)
            return Result.Failure("Utilisateur introuvable.", 404);

        var blocked = await uow.Blocks.IsBlockedAsync(receiverId, senderId);
        if (blocked)
            return Result.Failure("Impossible d'envoyer une demande à cet utilisateur.", 403);

        var sender = await uow.Users.GetByIdAsync(senderId);

        await uow.FriendRequests.AddAsync(new FriendRequest { SenderId = senderId, ReceiverId = receiverId });
        await uow.SaveChangesAsync();

        await notificationService.CreateNotificationAsync(
            receiverId,
            "Nouvelle demande d'ami",
            $"{sender!.Username} vous a envoyé une demande d'ami.",
            NotificationType.FriendRequest,
            senderId);

        return Result.Success(201);
    }

    public async Task<Result> AcceptFriendRequestAsync(Guid requestId, Guid userId)
    {
        var request = await uow.FriendRequests.GetByIdAsync(requestId);
        if (request is null || request.ReceiverId != userId)
            return Result.Failure("Demande introuvable.", 404);

        if (request.Status != FriendRequestStatus.Pending)
            return Result.Failure("Cette demande a déjà été traitée.");

        request.Status = FriendRequestStatus.Accepted;
        request.UpdatedAt = DateTime.UtcNow;

        var receiver = await uow.Users.GetByIdAsync(userId);
        await uow.SaveChangesAsync();

        await notificationService.CreateNotificationAsync(
            request.SenderId,
            "Demande d'ami acceptée",
            $"{receiver!.Username} a accepté votre demande d'ami.",
            NotificationType.FriendRequestAccepted,
            userId);

        return Result.Success();
    }

    public async Task<Result> DeclineFriendRequestAsync(Guid requestId, Guid userId)
    {
        var request = await uow.FriendRequests.GetByIdAsync(requestId);
        if (request is null || request.ReceiverId != userId)
            return Result.Failure("Demande introuvable.", 404);

        request.Status = FriendRequestStatus.Declined;
        request.UpdatedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> RemoveFriendAsync(Guid userId, Guid friendId)
    {
        var request = await uow.FriendRequests.GetBetweenUsersAsync(userId, friendId)
                      ?? await uow.FriendRequests.GetBetweenUsersAsync(friendId, userId);

        if (request is null || request.Status != FriendRequestStatus.Accepted)
            return Result.Failure("Vous n'êtes pas amis avec cet utilisateur.", 404);

        uow.FriendRequests.Remove(request);
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<IEnumerable<FriendRequestDto>>> GetPendingRequestsAsync(Guid userId)
    {
        var requests = await uow.FriendRequests.GetPendingRequestsForUserAsync(userId);
        var dtos = requests.Select(r => new FriendRequestDto
        {
            Id = r.Id,
            SenderId = r.SenderId,
            SenderUsername = r.Sender.Username,
            SenderProfilePicture = r.Sender.ProfilePicture,
            ReceiverId = r.ReceiverId,
            ReceiverUsername = r.Receiver.Username,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        });
        return Result<IEnumerable<FriendRequestDto>>.Success(dtos);
    }

    public async Task<Result<IEnumerable<UserDto>>> GetFriendsAsync(Guid userId)
    {
        var friends = await uow.Users.GetFriendsAsync(userId);
        var dtos = friends.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Bio = u.Bio,
            ProfilePicture = u.ProfilePicture,
            IsListener = u.IsListener,
            IsOnline = u.IsOnline,
            LastSeenAt = u.LastSeenAt,
            CreatedAt = u.CreatedAt
        });
        return Result<IEnumerable<UserDto>>.Success(dtos);
    }
}
