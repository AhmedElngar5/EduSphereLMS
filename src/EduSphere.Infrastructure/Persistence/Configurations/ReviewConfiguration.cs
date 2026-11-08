using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Rating)
            .IsRequired();

        builder.ToTable(t => t.HasCheckConstraint("CK_Reviews_Rating", "[Rating] BETWEEN 1 AND 5"));

        builder.Property(r => r.Comment)
            .HasMaxLength(3000);

        // Prevent a student from reviewing the same course more than once
        builder.HasIndex(r => new { r.UserId, r.CourseId })
            .IsUnique()
            .HasDatabaseName("IX_Reviews_UserId_CourseId_Unique");

        builder.HasIndex(r => r.CourseId);
        builder.HasIndex(r => r.Rating);
        builder.HasIndex(r => r.IsPublished);

        builder.HasOne(r => r.Course)
            .WithMany(c => c.Reviews)
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
