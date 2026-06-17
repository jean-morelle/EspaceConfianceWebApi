using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Domain.Enums;

namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IReportRepository : IGenericRepository<Report>
{
    Task<IEnumerable<Report>> GetAllWithUsersAsync();
    Task<IEnumerable<Report>> GetByStatusAsync(ReportStatus status);
    Task<IEnumerable<Report>> GetByUserAsync(Guid userId);
}
