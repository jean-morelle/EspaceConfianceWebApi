using EspaceConfiance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EspaceConfiance.Infractructure.Data.Configurations;

public class FriendRequestConfiguration : IEntityTypeConfiguration<FriendRequest>
{
    public void Configure(EntityTypeBuilder<FriendRequest> builder)
    {
        builder.ToTable("friend_requests");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Status).IsRequired();

        builder.HasIndex(f => new { f.SenderId, f.ReceiverId }).IsUnique();
    }
}
