using EspaceConfiance.Domain.Common;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Domain.Entities;

public class FriendRequest : BaseEntity
{
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;

    public Guid ReceiverId { get; set; }
    public User Receiver { get; set; } = null!;

    public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;
}
