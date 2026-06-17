using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.User;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IUserService
{
    Task<Result<UserDto>> GetProfileAsync(Guid userId);
    Task<Result<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<Result<IEnumerable<UserDto>>> SearchUsersAsync(string query, Guid currentUserId);
    Task<Result> ToggleListenerStatusAsync(Guid userId);
    Task<Result> BlockUserAsync(Guid blockerId, Guid blockedId);
    Task<Result> UnblockUserAsync(Guid blockerId, Guid blockedId);
    Task<Result<IEnumerable<UserDto>>> GetBlockedUsersAsync(Guid userId);
}
