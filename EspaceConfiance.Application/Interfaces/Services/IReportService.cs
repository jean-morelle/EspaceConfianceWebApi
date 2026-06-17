using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Admin;
using EspaceConfiance.Application.DTOs.Report;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IReportService
{
    Task<Result> CreateReportAsync(Guid reporterId, CreateReportDto dto);
    Task<Result<IEnumerable<ReportDto>>> GetAllReportsAsync();
    Task<Result> UpdateReportStatusAsync(Guid reportId, UpdateReportDto dto);
}
