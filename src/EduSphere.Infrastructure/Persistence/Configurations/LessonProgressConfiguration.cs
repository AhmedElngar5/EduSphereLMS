using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
    public void Configure(EntityTypeBuilder<LessonProgress> builder)
    {
        builder.HasKey(lp => lp.Id);

        builder.Property(lp => lp.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(lp => lp.WatchedDurationSeconds)
            .HasDefaultValue(0);

        // One progress record per user per lesson
        builder.HasIndex(lp => new { lp.UserId, lp.LessonId })
            .IsUnique()
            .HasDatabaseName("IX_LessonProgress_UserId_LessonId_Unique");

        builder.HasIndex(lp => lp.UserId);
        builder.HasIndex(lp => lp.LessonId);

        builder.HasOne(lp => lp.Lesson)
            .WithMany(l => l.Progresses)
            .HasForeignKey(lp => lp.LessonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
