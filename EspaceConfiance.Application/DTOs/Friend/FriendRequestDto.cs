using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.DTOs.Friend;

public class FriendRequestDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderUsername { get; set; } = string.Empty;
    public string? SenderProfilePicture { get; set; }
    public Guid ReceiverId { get; set; }
    public string ReceiverUsername { get; set; } = string.Empty;
    public FriendRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
