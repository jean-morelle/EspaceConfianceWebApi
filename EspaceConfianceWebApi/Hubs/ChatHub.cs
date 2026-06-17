using System.Security.Claims;
using EspaceConfiance.Application.DTOs.Conversation;
using EspaceConfiance.Application.DTOs.Room;
using EspaceConfiance.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace EspaceConfianceWebApi.Hubs;

[Authorize]
public class ChatHub(IConversationService conversationService, IRoomService roomService) : Hub
{
    private static readonly Dictionary<string, string> _userConnections = [];

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (userId != Guid.Empty)
            _userConnections[userId.ToString()] = Context.ConnectionId;

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (userId != Guid.Empty)
            _userConnections.Remove(userId.ToString());

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
    }

    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"room_{roomId}");
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"room_{roomId}");
    }

    public async Task SendPrivateMessage(string conversationId, string content)
    {
        var senderId = GetUserId();
        var result = await conversationService.SendMessageAsync(
            Guid.Parse(conversationId),
            senderId,
            new SendMessageDto { Content = content });

        if (result.IsSuccess)
        {
            await Clients.Group($"conv_{conversationId}")
                .SendAsync("ReceiveMessage", result.Data);
        }
    }

    public async Task SendRoomMessage(string roomId, string content)
    {
        var senderId = GetUserId();
        var result = await roomService.SendMessageAsync(
            Guid.Parse(roomId),
            senderId,
            new SendRoomMessageDto { Content = content });

        if (result.IsSuccess)
        {
            await Clients.Group($"room_{roomId}")
                .SendAsync("ReceiveRoomMessage", result.Data);
        }
    }

    public async Task MarkMessagesRead(string conversationId)
    {
        var userId = GetUserId();
        await conversationService.MarkAsReadAsync(Guid.Parse(conversationId), userId);
        await Clients.Group($"conv_{conversationId}")
            .SendAsync("MessagesRead", new { conversationId, userId });
    }

    public async Task Typing(string conversationId, bool isTyping)
    {
        var userId = GetUserId();
        await Clients.OthersInGroup($"conv_{conversationId}")
            .SendAsync("UserTyping", new { userId, conversationId, isTyping });
    }

    public static string? GetConnectionId(string userId) =>
        _userConnections.TryGetValue(userId, out var connId) ? connId : null;

    private Guid GetUserId()
    {
        var sub = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? Context.User?.FindFirst("sub")?.Value;
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}
