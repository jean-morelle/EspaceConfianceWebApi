using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.DTOs.Report;

public class ReportDto
{
    public Guid Id { get; set; }
    public Guid ReporterId { get; set; }
    public string ReporterUsername { get; set; } = string.Empty;
    public Guid ReportedUserId { get; set; }
    public string ReportedUsername { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public ReportStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
