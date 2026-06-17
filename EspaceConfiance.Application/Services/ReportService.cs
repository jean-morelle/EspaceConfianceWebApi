using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Admin;
using EspaceConfiance.Application.DTOs.Report;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Services;

public class ReportService(IUnitOfWork uow) : IReportService
{
    public async Task<Result> CreateReportAsync(Guid reporterId, CreateReportDto dto)
    {
        if (reporterId == dto.ReportedUserId)
            return Result.Failure("Vous ne pouvez pas vous signaler vous-même.");

        var reported = await uow.Users.GetByIdAsync(dto.ReportedUserId);
        if (reported is null)
            return Result.Failure("Utilisateur introuvable.", 404);

        await uow.Reports.AddAsync(new Report
        {
            ReporterId = reporterId,
            ReportedUserId = dto.ReportedUserId,
            Reason = dto.Reason
        });
        await uow.SaveChangesAsync();

        return Result.Success(201);
    }

    public async Task<Result<IEnumerable<ReportDto>>> GetAllReportsAsync()
    {
        var reports = await uow.Reports.GetAllWithUsersAsync();
        var dtos = reports.Select(r => new ReportDto
        {
            Id = r.Id,
            ReporterId = r.ReporterId,
            ReporterUsername = r.Reporter.Username,
            ReportedUserId = r.ReportedUserId,
            ReportedUsername = r.ReportedUser.Username,
            Reason = r.Reason,
            AdminNote = r.AdminNote,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        });
        return Result<IEnumerable<ReportDto>>.Success(dtos);
    }

    public async Task<Result> UpdateReportStatusAsync(Guid reportId, UpdateReportDto dto)
    {
        var report = await uow.Reports.GetByIdAsync(reportId);
        if (report is null)
            return Result.Failure("Signalement introuvable.", 404);

        report.Status = dto.Status;
        if (dto.AdminNote is not null)
            report.AdminNote = dto.AdminNote;

        report.UpdatedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        return Result.Success();
    }
}
