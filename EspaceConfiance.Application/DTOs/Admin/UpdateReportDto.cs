using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.DTOs.Admin;

public class UpdateReportDto
{
    public ReportStatus Status { get; set; }
    public string? AdminNote { get; set; }
}
