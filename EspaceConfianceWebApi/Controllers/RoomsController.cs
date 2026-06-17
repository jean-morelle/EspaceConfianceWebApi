using EspaceConfiance.Application.DTOs.Room;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfianceWebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EspaceConfianceWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController(IRoomService roomService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPublicRooms()
    {
        var result = await roomService.GetPublicRoomsAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMyRooms()
    {
        var result = await roomService.GetUserRoomsAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("{roomId:guid}")]
    public async Task<IActionResult> GetRoom(Guid roomId)
    {
        var result = await roomService.GetRoomAsync(roomId, User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
    {
        var result = await roomService.CreateRoomAsync(dto);
        return result.IsSuccess
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("{roomId:guid}/join")]
    public async Task<IActionResult> Join(Guid roomId)
    {
        var result = await roomService.JoinRoomAsync(roomId, User.GetUserId());
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("{roomId:guid}/leave")]
    public async Task<IActionResult> Leave(Guid roomId)
    {
        var result = await roomService.LeaveRoomAsync(roomId, User.GetUserId());
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("{roomId:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid roomId, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
    {
        var result = await roomService.GetMessagesAsync(roomId, page, pageSize);
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("{roomId:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid roomId, [FromBody] SendRoomMessageDto dto)
    {
        var result = await roomService.SendMessageAsync(roomId, User.GetUserId(), dto);
        return result.IsSuccess
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("{roomId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid roomId)
    {
        var result = await roomService.DeleteRoomAsync(roomId);
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
