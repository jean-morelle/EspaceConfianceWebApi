namespace EspaceConfiance.Application.DTOs.Report;

public class CreateReportDto
{
    public Guid ReportedUserId { get; set; }
    public string Reason { get; set; } = string.Empty;
}
