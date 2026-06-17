using EspaceConfiance.Domain.Common;

namespace EspaceConfiance.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? ProfilePicture { get; set; }
    public bool IsListener { get; set; }
    public bool IsOnline { get; set; }
    public bool IsBlocked { get; set; }
    public string Role { get; set; } = "User";
    public DateTime? LastSeenAt { get; set; }

    public ICollection<FriendRequest> SentFriendRequests { get; set; } = [];
    public ICollection<FriendRequest> ReceivedFriendRequests { get; set; } = [];
    public ICollection<ConversationParticipant> ConversationParticipants { get; set; } = [];
    public ICollection<Message> Messages { get; set; } = [];
    public ICollection<RoomMember> RoomMemberships { get; set; } = [];
    public ICollection<RoomMessage> RoomMessages { get; set; } = [];
    public ICollection<Report> ReportsMade { get; set; } = [];
    public ICollection<Report> ReportsReceived { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<Block> BlocksMade { get; set; } = [];
    public ICollection<Block> BlocksReceived { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
