using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.User;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;

namespace EspaceConfiance.Application.Services;

public class AdminService(IUnitOfWork uow) : IAdminService
{
    public async Task<Result<IEnumerable<UserDto>>> GetAllUsersAsync()
    {
        var users = await uow.Users.GetAllAsync();
        var dtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Bio = u.Bio,
            ProfilePicture = u.ProfilePicture,
            IsListener = u.IsListener,
            IsOnline = u.IsOnline,
            CreatedAt = u.CreatedAt
        });
        return Result<IEnumerable<UserDto>>.Success(dtos);
    }

    public async Task<Result> SuspendUserAsync(Guid userId, bool suspend)
    {
        var user = await uow.Users.GetByIdAsync(userId);
        if (user is null)
            return Result.Failure("Utilisateur introuvable.", 404);

        user.IsBlocked = suspend;
        user.UpdatedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> DeleteUserAsync(Guid userId)
    {
        var user = await uow.Users.GetByIdAsync(userId);
        if (user is null)
            return Result.Failure("Utilisateur introuvable.", 404);

        uow.Users.Remove(user);
        await uow.SaveChangesAsync();
        return Result.Success();
    }
}
