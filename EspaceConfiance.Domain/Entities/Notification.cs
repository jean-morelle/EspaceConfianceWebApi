using EspaceConfiance.Domain.Common;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public NotificationType Type { get; set; }
    public Guid? ReferenceId { get; set; }
}
