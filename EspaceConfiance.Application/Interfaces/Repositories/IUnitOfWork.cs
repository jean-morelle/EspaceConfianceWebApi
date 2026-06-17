namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IFriendRequestRepository FriendRequests { get; }
    IConversationRepository Conversations { get; }
    IMessageRepository Messages { get; }
    IRoomRepository Rooms { get; }
    IReportRepository Reports { get; }
    INotificationRepository Notifications { get; }
    IBlockRepository Blocks { get; }
    IRefreshTokenRepository RefreshTokens { get; }

    Task<int> SaveChangesAsync();
}
