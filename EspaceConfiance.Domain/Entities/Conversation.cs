using EspaceConfiance.Domain.Common;

namespace EspaceConfiance.Domain.Entities;

public class Conversation : BaseEntity
{
    public ICollection<ConversationParticipant> Participants { get; set; } = [];
    public ICollection<Message> Messages { get; set; } = [];
}
