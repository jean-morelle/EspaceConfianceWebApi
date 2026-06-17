using EspaceConfiance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EspaceConfiance.Infractructure.Data.Configurations;

public class BlockConfiguration : IEntityTypeConfiguration<Block>
{
    public void Configure(EntityTypeBuilder<Block> builder)
    {
        builder.ToTable("blocks");
        builder.HasKey(b => b.Id);
        builder.HasIndex(b => new { b.BlockerId}).IsUnique();
    }
}
