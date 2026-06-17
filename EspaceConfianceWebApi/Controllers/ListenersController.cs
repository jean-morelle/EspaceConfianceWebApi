using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfianceWebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EspaceConfianceWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ListenersController(IListenerService listenerService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAvailable()
    {
        var result = await listenerService.GetAvailableListenersAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("{listenerId:guid}/request")]
    public async Task<IActionResult> RequestListener(Guid listenerId)
    {
        var result = await listenerService.RequestListenerAsync(User.GetUserId(), listenerId);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
