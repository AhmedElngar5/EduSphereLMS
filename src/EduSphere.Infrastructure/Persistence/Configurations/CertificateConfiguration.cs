using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.CertificateNumber)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.CertificateUrl)
            .HasMaxLength(1000);

        builder.Property(c => c.CertificateStorageKey)
            .HasMaxLength(500);

        // A user can only earn one certificate per course
        builder.HasIndex(c => new { c.UserId, c.CourseId })
            .IsUnique()
            .HasDatabaseName("IX_Certificates_UserId_CourseId_Unique");

        builder.HasIndex(c => c.CertificateNumber).IsUnique();
        builder.HasIndex(c => c.UserId);
        builder.HasIndex(c => c.CourseId);

        builder.HasOne(c => c.Course)
            .WithMany(co => co.Certificates)
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
