using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class FriendRequestRepository(AppDbContext context)
    : GenericRepository<FriendRequest>(context), IFriendRequestRepository
{
    public async Task<FriendRequest?> GetBetweenUsersAsync(Guid senderId, Guid receiverId) =>
        await DbSet
            .FirstOrDefaultAsync(f =>
                (f.SenderId == senderId && f.ReceiverId == receiverId) ||
                (f.SenderId == receiverId && f.ReceiverId == senderId));

    public async Task<IEnumerable<FriendRequest>> GetPendingRequestsForUserAsync(Guid userId) =>
        await DbSet
            .Include(f => f.Sender)
            .Include(f => f.Receiver)
            .Where(f => f.ReceiverId == userId && f.Status == FriendRequestStatus.Pending)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<FriendRequest>> GetSentRequestsAsync(Guid userId) =>
        await DbSet
            .Include(f => f.Receiver)
            .Where(f => f.SenderId == userId && f.Status == FriendRequestStatus.Pending)
            .ToListAsync();

    public async Task<bool> AreFriendsAsync(Guid userId1, Guid userId2) =>
        await DbSet.AnyAsync(f =>
            f.Status == FriendRequestStatus.Accepted &&
            ((f.SenderId == userId1 && f.ReceiverId == userId2) ||
             (f.SenderId == userId2 && f.ReceiverId == userId1)));
}
