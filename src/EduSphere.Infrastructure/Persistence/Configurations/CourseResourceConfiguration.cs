using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class CourseResourceConfiguration : IEntityTypeConfiguration<CourseResource>
{
    public void Configure(EntityTypeBuilder<CourseResource> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(r => r.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(r => r.FileUrl)
            .HasMaxLength(1000);

        builder.Property(r => r.FileStorageKey)
            .HasMaxLength(500);

        builder.Property(r => r.ExternalUrl)
            .HasMaxLength(1000);

        builder.Property(r => r.FileExtension)
            .HasMaxLength(20);

        builder.Property(r => r.DisplayOrder)
            .HasDefaultValue(0);

        builder.HasOne(r => r.Course)
            .WithMany(c => c.Resources)
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Optional lesson-level resource
        builder.HasOne(r => r.Lesson)
            .WithMany(l => l.Resources)
            .HasForeignKey(r => r.LessonId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        builder.HasIndex(r => r.CourseId);
        builder.HasIndex(r => r.LessonId);
        builder.HasIndex(r => r.Type);
    }
}

