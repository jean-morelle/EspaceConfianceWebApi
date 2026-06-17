using EspaceConfiance.Domain.Common;

namespace EspaceConfiance.Domain.Entities;

public class Block : BaseEntity
{
    public Guid BlockerId { get; set; }
    public User Blocker { get; set; } = null!;
}
