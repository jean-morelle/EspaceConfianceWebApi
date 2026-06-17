using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Friend;
using EspaceConfiance.Application.DTOs.User;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IFriendService
{
    Task<Result> SendFriendRequestAsync(Guid senderId, Guid receiverId);
    Task<Result> AcceptFriendRequestAsync(Guid requestId, Guid userId);
    Task<Result> DeclineFriendRequestAsync(Guid requestId, Guid userId);
    Task<Result> RemoveFriendAsync(Guid userId, Guid friendId);
    Task<Result<IEnumerable<FriendRequestDto>>> GetPendingRequestsAsync(Guid userId);
    Task<Result<IEnumerable<UserDto>>> GetFriendsAsync(Guid userId);
}
