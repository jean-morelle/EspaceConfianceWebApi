using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IRoomRepository : IGenericRepository<Room>
{
    Task<Room?> GetWithMembersAsync(Guid roomId);
    Task<IEnumerable<Room>> GetPublicRoomsAsync();
    Task<IEnumerable<Room>> GetUserRoomsAsync(Guid userId);
    Task<IEnumerable<RoomMessage>> GetRoomMessagesAsync(Guid roomId, int page, int pageSize);
    Task<bool> IsUserMemberAsync(Guid roomId, Guid userId);
    Task<RoomMember?> GetMemberAsync(Guid roomId, Guid userId);
    Task AddRoomMessageAsync(RoomMessage message);
    void RemoveMember(RoomMember member);
}
