using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Room;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Services;

public class RoomService(IUnitOfWork uow) : IRoomService
{
    public async Task<Result<RoomDto>> CreateRoomAsync(CreateRoomDto dto)
    {
        if (await uow.Rooms.ExistsAsync(r => r.Name == dto.Name))
            return Result<RoomDto>.Failure("Un salon avec ce nom existe déjà.", 409);

        var room = new Room
        {
            Name = dto.Name,
            Description = dto.Description,
            Icon = dto.Icon,
            IsPublic = dto.IsPublic,
            MaxMembers = dto.MaxMembers
        };

        await uow.Rooms.AddAsync(room);
        await uow.SaveChangesAsync();

        return Result<RoomDto>.Success(MapToDto(room, false, 0), 201);
    }

    public async Task<Result<IEnumerable<RoomDto>>> GetPublicRoomsAsync(Guid userId)
    {
        var rooms = await uow.Rooms.GetPublicRoomsAsync();
        var dtos = new List<RoomDto>();
        foreach (var r in rooms)
        {
            var isJoined = await uow.Rooms.IsUserMemberAsync(r.Id, userId);
            dtos.Add(MapToDto(r, isJoined, r.Members.Count));
        }
        return Result<IEnumerable<RoomDto>>.Success(dtos);
    }

    public async Task<Result<IEnumerable<RoomDto>>> GetUserRoomsAsync(Guid userId)
    {
        var rooms = await uow.Rooms.GetUserRoomsAsync(userId);
        var dtos = rooms.Select(r => MapToDto(r, true, r.Members.Count));
        return Result<IEnumerable<RoomDto>>.Success(dtos);
    }

    public async Task<Result<RoomDto>> GetRoomAsync(Guid roomId, Guid userId)
    {
        var room = await uow.Rooms.GetWithMembersAsync(roomId);
        if (room is null)
            return Result<RoomDto>.Failure("Salon introuvable.", 404);

        var isJoined = room.Members.Any(m => m.UserId == userId);
        return Result<RoomDto>.Success(MapToDto(room, isJoined, room.Members.Count));
    }

    public async Task<Result> JoinRoomAsync(Guid roomId, Guid userId)
    {
        var room = await uow.Rooms.GetWithMembersAsync(roomId);
        if (room is null)
            return Result.Failure("Salon introuvable.", 404);

        if (room.Members.Any(m => m.UserId == userId))
            return Result.Failure("Vous êtes déjà membre de ce salon.", 409);

        if (room.Members.Count >= room.MaxMembers)
            return Result.Failure("Ce salon a atteint sa capacité maximale.", 400);

        room.Members.Add(new RoomMember { UserId = userId, RoomId = roomId });
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> LeaveRoomAsync(Guid roomId, Guid userId)
    {
        var member = await uow.Rooms.GetMemberAsync(roomId, userId);
        if (member is null)
            return Result.Failure("Vous n'êtes pas membre de ce salon.", 404);

        uow.Rooms.RemoveMember(member);
        await uow.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<RoomMessageDto>> SendMessageAsync(Guid roomId, Guid senderId, SendRoomMessageDto dto)
    {
        var isMember = await uow.Rooms.IsUserMemberAsync(roomId, senderId);
        if (!isMember)
            return Result<RoomMessageDto>.Failure("Vous n'êtes pas membre de ce salon.", 403);

        if (string.IsNullOrWhiteSpace(dto.Content))
            return Result<RoomMessageDto>.Failure("Le message ne peut pas être vide.");

        var sender = await uow.Users.GetByIdAsync(senderId);
        var message = new RoomMessage
        {
            RoomId = roomId,
            SenderId = senderId,
            Content = dto.Content.Trim(),
            SentAt = DateTime.UtcNow
        };

        await uow.Rooms.AddRoomMessageAsync(message);
        await uow.SaveChangesAsync();

        return Result<RoomMessageDto>.Success(new RoomMessageDto
        {
            Id = message.Id,
            RoomId = roomId,
            SenderId = senderId,
            SenderUsername = sender!.Username,
            SenderProfilePicture = sender.ProfilePicture,
            Content = message.Content,
            SentAt = message.SentAt
        }, 201);
    }

    public async Task<Result<IEnumerable<RoomMessageDto>>> GetMessagesAsync(Guid roomId, int page, int pageSize)
    {
        var messages = await uow.Rooms.GetRoomMessagesAsync(roomId, page, pageSize);
        var dtos = messages.Select(m => new RoomMessageDto
        {
            Id = m.Id,
            RoomId = m.RoomId,
            SenderId = m.SenderId,
            SenderUsername = m.Sender?.Username ?? string.Empty,
            SenderProfilePicture = m.Sender?.ProfilePicture,
            Content = m.Content,
            SentAt = m.SentAt
        });
        return Result<IEnumerable<RoomMessageDto>>.Success(dtos);
    }

    public async Task<Result> DeleteRoomAsync(Guid roomId)
    {
        var room = await uow.Rooms.GetByIdAsync(roomId);
        if (room is null)
            return Result.Failure("Salon introuvable.", 404);

        uow.Rooms.Remove(room);
        await uow.SaveChangesAsync();
        return Result.Success();
    }

    private static RoomDto MapToDto(Room r, bool isJoined, int memberCount) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Description = r.Description,
        Icon = r.Icon,
        IsPublic = r.IsPublic,
        MemberCount = memberCount,
        MaxMembers = r.MaxMembers,
        CreatedAt = r.CreatedAt,
        IsJoined = isJoined
    };
}
