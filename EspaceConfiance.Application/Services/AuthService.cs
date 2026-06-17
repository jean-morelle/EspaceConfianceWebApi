using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.Common.Exceptions;
using EspaceConfiance.Application.DTOs.Auth;
using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Services;

public class AuthService(IUnitOfWork uow, ITokenService tokenService, IPasswordService passwordService) : IAuthService
{
    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        if (await uow.Users.ExistsAsync(u => u.Email == dto.Email.ToLower()))
            return Result<AuthResponseDto>.Failure("Un compte avec cet email existe déjà.", 409);

        if (await uow.Users.ExistsAsync(u => u.Username == dto.Username))
            return Result<AuthResponseDto>.Failure("Ce nom d'utilisateur est déjà pris.", 409);

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email.ToLower(),
            PasswordHash = passwordService.Hash(dto.Password)
        };

        await uow.Users.AddAsync(user);

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = tokenService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        await uow.RefreshTokens.AddAsync(refreshTokenEntity);
        await uow.SaveChangesAsync();

        return Result<AuthResponseDto>.Success(BuildAuthResponse(user, refreshTokenEntity.Token), 201);
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        var user = await uow.Users.GetByEmailAsync(dto.Email.ToLower());
        if (user is null || !passwordService.Verify(dto.Password, user.PasswordHash))
            return Result<AuthResponseDto>.Failure("Email ou mot de passe incorrect.", 401);

        if (user.IsBlocked)
            return Result<AuthResponseDto>.Failure("Ce compte a été suspendu.", 403);

        user.IsOnline = true;
        user.LastSeenAt = DateTime.UtcNow;

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = tokenService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        await uow.RefreshTokens.AddAsync(refreshTokenEntity);
        await uow.SaveChangesAsync();

        return Result<AuthResponseDto>.Success(BuildAuthResponse(user, refreshTokenEntity.Token));
    }

    public async Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
    {
        var token = await uow.RefreshTokens.GetByTokenAsync(refreshToken);
        if (token is null || !token.IsActive)
            return Result<AuthResponseDto>.Failure("Token de rafraîchissement invalide ou expiré.", 401);

        var user = await uow.Users.GetByIdAsync(token.UserId);
        if (user is null)
            return Result<AuthResponseDto>.Failure("Utilisateur introuvable.", 404);

        token.RevokedAt = DateTime.UtcNow;

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = tokenService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };
        await uow.RefreshTokens.AddAsync(newRefreshToken);
        await uow.SaveChangesAsync();

        return Result<AuthResponseDto>.Success(BuildAuthResponse(user, newRefreshToken.Token));
    }

    public async Task<Result> LogoutAsync(Guid userId, string refreshToken)
    {
        var token = await uow.RefreshTokens.GetByTokenAsync(refreshToken);
        if (token is not null && token.UserId == userId)
            token.RevokedAt = DateTime.UtcNow;

        var user = await uow.Users.GetByIdAsync(userId);
        if (user is not null)
        {
            user.IsOnline = false;
            user.LastSeenAt = DateTime.UtcNow;
        }

        await uow.SaveChangesAsync();
        return Result.Success();
    }

    private AuthResponseDto BuildAuthResponse(User user, string refreshToken)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(60);
        return new AuthResponseDto
        {
            AccessToken = tokenService.GenerateAccessToken(user),
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = new UserInfoDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                ProfilePicture = user.ProfilePicture,
                Role = user.Role
            }
        };
    }
}
