using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetWithFriendsAsync(Guid userId);
    Task<IEnumerable<User>> SearchUsersAsync(string query, Guid excludeUserId);
    Task<IEnumerable<User>> GetListenersAsync();
    Task<IEnumerable<User>> GetFriendsAsync(Guid userId);
}
