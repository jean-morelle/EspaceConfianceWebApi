using EspaceConfiance.Application.Interfaces.Services;
using EspaceConfiance.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace EspaceConfiance.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IFriendService, FriendService>();
        services.AddScoped<IConversationService, ConversationService>();
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IListenerService, ListenerService>();
        services.AddScoped<IAdminService, AdminService>();

        return services;
    }
}
