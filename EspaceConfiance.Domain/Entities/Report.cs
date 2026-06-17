using EspaceConfiance.Domain.Common;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Domain.Entities;

public class Report : BaseEntity
{
    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;

    public Guid ReportedUserId { get; set; }
    public User ReportedUser { get; set; } = null!;

    public string Reason { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public ReportStatus Status { get; set; } = ReportStatus.Pending;
}
