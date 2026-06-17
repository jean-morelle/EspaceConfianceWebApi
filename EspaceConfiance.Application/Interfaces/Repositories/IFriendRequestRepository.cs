using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IFriendRequestRepository : IGenericRepository<FriendRequest>
{
    Task<FriendRequest?> GetBetweenUsersAsync(Guid senderId, Guid receiverId);
    Task<IEnumerable<FriendRequest>> GetPendingRequestsForUserAsync(Guid userId);
    Task<IEnumerable<FriendRequest>> GetSentRequestsAsync(Guid userId);
    Task<bool> AreFriendsAsync(Guid userId1, Guid userId2);
}
