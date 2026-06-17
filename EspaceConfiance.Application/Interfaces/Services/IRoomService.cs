using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Room;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IRoomService
{
    Task<Result<RoomDto>> CreateRoomAsync(CreateRoomDto dto);
    Task<Result<IEnumerable<RoomDto>>> GetPublicRoomsAsync(Guid userId);
    Task<Result<IEnumerable<RoomDto>>> GetUserRoomsAsync(Guid userId);
    Task<Result<RoomDto>> GetRoomAsync(Guid roomId, Guid userId);
    Task<Result> JoinRoomAsync(Guid roomId, Guid userId);
    Task<Result> LeaveRoomAsync(Guid roomId, Guid userId);
    Task<Result<RoomMessageDto>> SendMessageAsync(Guid roomId, Guid senderId, SendRoomMessageDto dto);
    Task<Result<IEnumerable<RoomMessageDto>>> GetMessagesAsync(Guid roomId, int page, int pageSize);
    Task<Result> DeleteRoomAsync(Guid roomId);
}
