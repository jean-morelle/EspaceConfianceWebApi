namespace EspaceConfiance.Application.DTOs.Room;

public class CreateRoomDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public bool IsPublic { get; set; } = true;
    public int MaxMembers { get; set; } = 100;
}
