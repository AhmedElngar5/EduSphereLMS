using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<EduSphere.Infrastructure.Identity.ApplicationUser>
{
    public void Configure(EntityTypeBuilder<Infrastructure.Identity.ApplicationUser> builder)
    {
        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Bio)
            .HasMaxLength(2000);

        builder.Property(u => u.ProfilePictureUrl)
            .HasMaxLength(500);

        builder.Property(u => u.Headline)
            .HasMaxLength(200);

        builder.Property(u => u.WebsiteUrl)
            .HasMaxLength(300);

        builder.Property(u => u.TwitterHandle)
            .HasMaxLength(100);

        builder.Property(u => u.LinkedInUrl)
            .HasMaxLength(300);

        builder.Property(u => u.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(u => u.IsActive);
    }
}
