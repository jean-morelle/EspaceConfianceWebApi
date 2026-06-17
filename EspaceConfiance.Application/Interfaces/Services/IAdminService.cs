using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.User;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IAdminService
{
    Task<Result<IEnumerable<UserDto>>> GetAllUsersAsync();
    Task<Result> SuspendUserAsync(Guid userId, bool suspend);
    Task<Result> DeleteUserAsync(Guid userId);
}
