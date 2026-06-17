using EspaceConfiance.Application.DTOs.User;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfianceWebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EspaceConfianceWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var result = await userService.GetProfileAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("{userId:guid}")]
    public async Task<IActionResult> GetUser(Guid userId)
    {
        var result = await userService.GetProfileAsync(userId);
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var result = await userService.UpdateProfileAsync(User.GetUserId(), dto);
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var result = await userService.ChangePasswordAsync(User.GetUserId(), dto);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return BadRequest(new { message = "La recherche doit contenir au moins 2 caractères." });

        var result = await userService.SearchUsersAsync(q, User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("me/listener")]
    public async Task<IActionResult> ToggleListener()
    {
        var result = await userService.ToggleListenerStatusAsync(User.GetUserId());
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("block/{userId:guid}")]
    public async Task<IActionResult> Block(Guid userId)
    {
        var result = await userService.BlockUserAsync(User.GetUserId(), userId);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("block/{userId:guid}")]
    public async Task<IActionResult> Unblock(Guid userId)
    {
        var result = await userService.UnblockUserAsync(User.GetUserId(), userId);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("blocked")]
    public async Task<IActionResult> GetBlockedUsers()
    {
        var result = await userService.GetBlockedUsersAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
