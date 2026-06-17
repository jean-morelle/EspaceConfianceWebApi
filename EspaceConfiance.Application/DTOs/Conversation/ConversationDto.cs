namespace EspaceConfiance.Application.DTOs.Conversation;

public class ConversationDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ParticipantDto> Participants { get; set; } = [];
    public MessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
}

public class ParticipantDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? ProfilePicture { get; set; }
    public bool IsOnline { get; set; }
}
