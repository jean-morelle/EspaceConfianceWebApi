using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class RoomRepository(AppDbContext context)
    : GenericRepository<Room>(context), IRoomRepository
{
    public async Task<Room?> GetWithMembersAsync(Guid roomId) =>
        await DbSet
            .Include(r => r.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(r => r.Id == roomId);

    public async Task<IEnumerable<Room>> GetPublicRoomsAsync() =>
        await DbSet
            .Include(r => r.Members)
            .Where(r => r.IsPublic)
            .OrderBy(r => r.Name)
            .ToListAsync();

    public async Task<IEnumerable<Room>> GetUserRoomsAsync(Guid userId) =>
        await DbSet
            .Include(r => r.Members)
            .Where(r => r.Members.Any(m => m.UserId == userId))
            .ToListAsync();

    public async Task<IEnumerable<RoomMessage>> GetRoomMessagesAsync(Guid roomId, int page, int pageSize) =>
        await context.RoomMessages
            .Include(m => m.Sender)
            .Where(m => m.RoomId == roomId)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

    public async Task<bool> IsUserMemberAsync(Guid roomId, Guid userId) =>
        await context.RoomMembers.AnyAsync(m => m.RoomId == roomId && m.UserId == userId);

    public async Task<RoomMember?> GetMemberAsync(Guid roomId, Guid userId) =>
        await context.RoomMembers.FirstOrDefaultAsync(m => m.RoomId == roomId && m.UserId == userId);

    public async Task AddRoomMessageAsync(RoomMessage message) =>
        await context.RoomMessages.AddAsync(message);

    public void RemoveMember(RoomMember member) =>
        context.RoomMembers.Remove(member);
}
