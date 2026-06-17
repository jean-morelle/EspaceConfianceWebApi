using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Domain.Entities;

public class RoomMember
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public RoomMemberRole Role { get; set; } = RoomMemberRole.Member;
}
