using EspaceConfiance.Application.DTOs.Conversation;
using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfianceWebApi.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EspaceConfianceWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConversationsController(IConversationService conversationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetConversations()
    {
        var result = await conversationService.GetUserConversationsAsync(User.GetUserId());
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("with/{userId:guid}")]
    public async Task<IActionResult> GetOrCreate(Guid userId)
    {
        var result = await conversationService.GetOrCreateConversationAsync(User.GetUserId(), userId);
        return result.IsSuccess
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("{conversationId:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid conversationId, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
    {
        var result = await conversationService.GetMessagesAsync(conversationId, User.GetUserId(), page, pageSize);
        return result.IsSuccess ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("{conversationId:guid}/messages")]
    public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessageDto dto)
    {
        var result = await conversationService.SendMessageAsync(conversationId, User.GetUserId(), dto);
        return result.IsSuccess
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("{conversationId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid conversationId)
    {
        var result = await conversationService.MarkAsReadAsync(conversationId, User.GetUserId());
        return result.IsSuccess ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
