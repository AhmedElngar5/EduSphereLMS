using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(l => l.Description)
            .HasMaxLength(1000);

        builder.Property(l => l.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(l => l.VideoUrl)
            .HasMaxLength(1000);

        builder.Property(l => l.VideoStorageKey)
            .HasMaxLength(500);

        builder.Property(l => l.VideoProvider)
            .HasMaxLength(100);

        builder.Property(l => l.VideoThumbnailUrl)
            .HasMaxLength(1000);

        builder.Property(l => l.VideoTranscriptUrl)
            .HasMaxLength(1000);

        builder.Property(l => l.ContentHtml)
            .HasColumnType("nvarchar(max)");

        builder.Property(l => l.DisplayOrder)
            .HasDefaultValue(0);

        builder.HasOne(l => l.Section)
            .WithMany(s => s.Lessons)
            .HasForeignKey(l => l.SectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => l.SectionId);
        builder.HasIndex(l => new { l.SectionId, l.DisplayOrder });
        builder.HasIndex(l => l.Type);
    }
}

