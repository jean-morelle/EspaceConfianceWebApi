using EspaceConfiance.Domain.Entities;

namespace EspaceConfiance.Application.Interfaces.Repositories;

public interface IBlockRepository : IGenericRepository<Block>
{
    Task<bool> IsBlockedAsync(Guid blockerId, Guid blockedId);
    Task<Block?> GetBlockAsync(Guid blockerId, Guid blockedId);
    Task<IEnumerable<Block>> GetBlocksByUserAsync(Guid userId);
}
