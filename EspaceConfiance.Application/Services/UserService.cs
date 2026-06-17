using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.User;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Services;

public class UserService(IUnitOfWork uow, IPasswordService passwordService) : IUserService
{
    public async Task<Result<UserDto>> GetProfileAsync(Guid userId)
    {
        var user = await uow.Users.GetByIdAsync(userId);
        if (user is null)
            return Result<UserDto>.Failure("Utilisateur introuvable.", 404);

        return Result<UserDto>.Success(MapToDto(user));
    }

    public async Task<Result<UserDto>> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await uow.Users.GetByIdAsync(userId);
        if (user is null)
            return Result<UserDto>.Failure("Utilisateur introuvable.", 404);

        if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.Username)
        {
            if (await uow.Users.ExistsAsync(u => u.Username == dto.Username && u.Id != userId))
                return Result<UserDto>.Failure("Ce nom d'utilisateur est déjà pris.", 409);
            user.Username = dto.Username;
        }

        if (dto.Bio is not null) user.Bio = dto.Bio;
        if (dto.ProfilePicture is not null) user.ProfilePicture = dto.ProfilePicture;

        user.UpdatedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        return Result<UserDto>.Success(MapToDto(user));
    }

    public async Task<Result> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await uow.Users.GetByIdAsync(userId);
        if (user is null)
            return Result.Failure("Utilisateur introuvable.", 404);

        if (!passwordService.Verify(dto.CurrentPassword, user.PasswordHash))
            return Result.Failure("Mot de passe actuel incorrect.", 400);

        user.PasswordHash = passwordService.Hash(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<IEnumerable<UserDto>>> SearchUsersAsync(string query, Guid currentUserId)
    {
        var users = await uow.Users.SearchUsersAsync(query, currentUserId);
        return Result<IEnumerable<UserDto>>.Success(users.Select(MapToDto));
    }

    public async Task<Result> ToggleListenerStatusAsync(Guid userId)
    {
        var user = await uow.Users.GetByIdAsync(userId);
        if (user is null)
            return Result.Failure("Utilisateur introuvable.", 404);

        user.IsListener = !user.IsListener;
        user.UpdatedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> BlockUserAsync(Guid blockerId, Guid blockedId)
    {
        if (blockerId == blockedId)
            return Result.Failure("Vous ne pouvez pas vous bloquer vous-même.");

        var alreadyBlocked = await uow.Blocks.IsBlockedAsync(blockerId, blockedId);
        if (alreadyBlocked)
            return Result.Failure("Cet utilisateur est déjà bloqué.", 409);

        await uow.Blocks.AddAsync(new Block { BlockerId = blockerId = blockedId });
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> UnblockUserAsync(Guid blockerId, Guid blockedId)
    {
        var block = await uow.Blocks.GetBlockAsync(blockerId, blockedId);
        if (block is null)
            return Result.Failure("Cet utilisateur n'est pas bloqué.", 404);

        uow.Blocks.Remove(block);
        await uow.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<IEnumerable<UserDto>>> GetBlockedUsersAsync(Guid userId)
    {
        var blocks = await uow.Blocks.GetBlocksByUserAsync(userId);
        var users = blocks.Select(b => MapToDto(b.Blocker));
        return Result<IEnumerable<UserDto>>.Success(users);
    }

    private static UserDto MapToDto(User u) => new()
    {
        Id = u.Id,
        Username = u.Username,
        Email = u.Email,
        Bio = u.Bio,
        ProfilePicture = u.ProfilePicture,
        IsListener = u.IsListener,
        IsOnline = u.IsOnline,
        LastSeenAt = u.LastSeenAt,
        CreatedAt = u.CreatedAt
    };
}
