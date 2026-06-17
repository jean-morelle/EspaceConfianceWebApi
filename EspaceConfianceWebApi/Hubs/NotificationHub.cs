using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace EspaceConfianceWebApi.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private static readonly Dictionary<string, string> _connections = [];

    public override Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (userId != Guid.Empty)
            _connections[userId.ToString()] = Context.ConnectionId;

        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (userId != Guid.Empty)
            _connections.Remove(userId.ToString());

        return base.OnDisconnectedAsync(exception);
    }

    public static string? GetConnectionId(string userId) =>
        _connections.TryGetValue(userId, out var connId) ? connId : null;

    private Guid GetUserId()
    {
        var sub = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? Context.User?.FindFirst("sub")?.Value;
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }
}
