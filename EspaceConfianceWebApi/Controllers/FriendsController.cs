using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfianceWebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EspaceConfianceWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FriendsController(IFriendService friendService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetFriends()
    {
        var result = await friendService.GetFriendsAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("requests")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var result = await friendService.GetPendingRequestsAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("request/{receiverId:guid}")]
    public async Task<IActionResult> SendRequest(Guid receiverId)
    {
        var result = await friendService.SendFriendRequestAsync(User.GetUserId(), receiverId);
        return result.IsSuccess
            ? StatusCode(result.StatusCode)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("request/{requestId:guid}/accept")]
    public async Task<IActionResult> Accept(Guid requestId)
    {
        var result = await friendService.AcceptFriendRequestAsync(requestId, User.GetUserId());
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("request/{requestId:guid}/decline")]
    public async Task<IActionResult> Decline(Guid requestId)
    {
        var result = await friendService.DeclineFriendRequestAsync(requestId, User.GetUserId());
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("{friendId:guid}")]
    public async Task<IActionResult> Remove(Guid friendId)
    {
        var result = await friendService.RemoveFriendAsync(User.GetUserId(), friendId);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
