using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Infractructure.Data;

namespace EspaceConfiance.Infractructure.Repositories;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private IUserRepository? _users;
    private IFriendRequestRepository? _friendRequests;
    private IConversationRepository? _conversations;
    private IMessageRepository? _messages;
    private IRoomRepository? _rooms;
    private IReportRepository? _reports;
    private INotificationRepository? _notifications;
    private IBlockRepository? _blocks;
    private IRefreshTokenRepository? _refreshTokens;

    public IUserRepository Users => _users ??= new UserRepository(context);
    public IFriendRequestRepository FriendRequests => _friendRequests ??= new FriendRequestRepository(context);
    public IConversationRepository Conversations => _conversations ??= new ConversationRepository(context);
    public IMessageRepository Messages => _messages ??= new MessageRepository(context);
    public IRoomRepository Rooms => _rooms ??= new RoomRepository(context);
    public IReportRepository Reports => _reports ??= new ReportRepository(context);
    public INotificationRepository Notifications => _notifications ??= new NotificationRepository(context);
    public IBlockRepository Blocks => _blocks ??= new BlockRepository(context);
    public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(context);

    public async Task<int> SaveChangesAsync() => await context.SaveChangesAsync();

    public void Dispose() => context.Dispose();
}
