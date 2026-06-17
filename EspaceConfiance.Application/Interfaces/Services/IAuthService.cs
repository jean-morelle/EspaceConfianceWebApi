using EspaceConfiance.Application.Common;
using EspaceConfiance.Application.DTOs.Auth;

namespace EspaceConfiance.Application.Interfaces.Services;

public interface IAuthService
{
    Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto);
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken);
    Task<Result> LogoutAsync(Guid userId, string refreshToken);
}
