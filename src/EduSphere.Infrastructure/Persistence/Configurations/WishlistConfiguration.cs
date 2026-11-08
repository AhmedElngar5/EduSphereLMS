using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.HasKey(w => w.Id);

        // Prevent duplicate wishlist entries
        builder.HasIndex(w => new { w.UserId, w.CourseId })
            .IsUnique()
            .HasDatabaseName("IX_Wishlists_UserId_CourseId_Unique");

        builder.HasIndex(w => w.UserId);

        builder.HasOne(w => w.Course)
            .WithMany(c => c.WishlistItems)
            .HasForeignKey(w => w.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
