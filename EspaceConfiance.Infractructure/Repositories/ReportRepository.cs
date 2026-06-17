using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class ReportRepository(AppDbContext context)
    : GenericRepository<Report>(context), IReportRepository
{
    public async Task<IEnumerable<Report>> GetAllWithUsersAsync() =>
        await DbSet
            .Include(r => r.Reporter)
            .Include(r => r.ReportedUser)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Report>> GetByStatusAsync(ReportStatus status) =>
        await DbSet
            .Include(r => r.Reporter)
            .Include(r => r.ReportedUser)
            .Where(r => r.Status == status)
            .ToListAsync();

    public async Task<IEnumerable<Report>> GetByUserAsync(Guid userId) =>
        await DbSet
            .Where(r => r.ReportedUserId == userId || r.ReporterId == userId)
            .ToListAsync();
}
