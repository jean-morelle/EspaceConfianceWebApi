namespace EspaceConfiance.Application.DTOs.Room;

public class RoomDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public bool IsPublic { get; set; }
    public int MemberCount { get; set; }
    public int MaxMembers { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsJoined { get; set; }
}
