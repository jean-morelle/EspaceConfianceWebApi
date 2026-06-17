using EspaceConfiance.Application.Interfaces.Repositories;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Infractructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EspaceConfiance.Infractructure.Repositories;

public class BlockRepository(AppDbContext context)
    : GenericRepository<Block>(context), IBlockRepository
{
    public async Task<bool> IsBlockedAsync(Guid blockerId, Guid blockedId) =>
        await DbSet.AnyAsync(b => b.BlockerId == blockerId && b.BlockerId == blockedId);

    public async Task<Block?> GetBlockAsync(Guid blockerId, Guid blockedId) =>
        await DbSet.FirstOrDefaultAsync(b => b.BlockerId == blockerId && b.BlockerId == blockedId);

    public async Task<IEnumerable<Block>> GetBlocksByUserAsync(Guid userId) =>
        await DbSet.Include(b => b.Blocker).Where(b => b.BlockerId == userId).ToListAsync();
}
