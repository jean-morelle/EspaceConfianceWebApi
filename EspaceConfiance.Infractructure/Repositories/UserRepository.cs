using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class UserRepository(AppDbContext context) : GenericRepository<User>(context), IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email) =>
        await DbSet.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User?> GetByUsernameAsync(string username) =>
        await DbSet.FirstOrDefaultAsync(u => u.Username == username);

    public async Task<User?> GetWithFriendsAsync(Guid userId) =>
        await DbSet
            .Include(u => u.SentFriendRequests).ThenInclude(f => f.Receiver)
            .Include(u => u.ReceivedFriendRequests).ThenInclude(f => f.Sender)
            .FirstOrDefaultAsync(u => u.Id == userId);

    public async Task<IEnumerable<User>> SearchUsersAsync(string query, Guid excludeUserId) =>
        await DbSet
            .Where(u => u.Id != excludeUserId && !u.IsBlocked &&
                        (u.Username.Contains(query) || u.Email.Contains(query)))
            .Take(20)
            .ToListAsync();

    public async Task<IEnumerable<User>> GetListenersAsync() =>
        await DbSet.Where(u => u.IsListener && !u.IsBlocked).ToListAsync();

    public async Task<IEnumerable<User>> GetFriendsAsync(Guid userId)
    {
        var acceptedSent = await context.FriendRequests
            .Where(f => f.SenderId == userId && f.Status == FriendRequestStatus.Accepted)
            .Select(f => f.Receiver)
            .ToListAsync();

        var acceptedReceived = await context.FriendRequests
            .Where(f => f.ReceiverId == userId && f.Status == FriendRequestStatus.Accepted)
            .Select(f => f.Sender)
            .ToListAsync();

        return acceptedSent.Concat(acceptedReceived);
    }
}
