using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.PricePaid)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(e => e.ProgressPercentage)
            .HasColumnType("float");

        // Prevent duplicate enrollments: one user ↔ one course
        builder.HasIndex(e => new { e.UserId, e.CourseId })
            .IsUnique()
            .HasDatabaseName("IX_Enrollments_UserId_CourseId_Unique");

        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.CourseId);
        builder.HasIndex(e => e.Status);

        // Course → Enrollments
        builder.HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Order → Enrollment (optional)
        builder.HasOne(e => e.Order)
            .WithOne(o => o.Enrollment)
            .HasForeignKey<Enrollment>(e => e.OrderId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}
