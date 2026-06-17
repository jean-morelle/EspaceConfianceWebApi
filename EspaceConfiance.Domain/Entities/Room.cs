using EspaceConfiance.Domain.Common;

namespace EspaceConfiance.Domain.Entities;

public class Room : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public bool IsPublic { get; set; } = true;
    public int MaxMembers { get; set; } = 100;

    public ICollection<RoomMember> Members { get; set; } = [];
    public ICollection<RoomMessage> Messages { get; set; } = [];
}
