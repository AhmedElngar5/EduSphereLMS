using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(c => c.Slug)
            .IsRequired()
            .HasMaxLength(400);

        builder.Property(c => c.ShortDescription)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.Description)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.InstructorId)
            .IsRequired();

        builder.Property(c => c.Language)
            .HasMaxLength(50);

        builder.Property(c => c.ThumbnailUrl)
            .HasMaxLength(500);

        builder.Property(c => c.PreviewVideoUrl)
            .HasMaxLength(500);

        builder.Property(c => c.Price)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.DiscountPrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(c => c.Level)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.AverageRating)
            .HasColumnType("float");

        builder.Property(c => c.Requirements)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.WhatYouWillLearn)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.WhoIsThisFor)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.RejectionReason)
            .HasMaxLength(1000);

        // Course → Category
        builder.HasOne(c => c.Category)
            .WithMany(cat => cat.Courses)
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.Slug).IsUnique();
        builder.HasIndex(c => c.InstructorId);
        builder.HasIndex(c => c.CategoryId);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.IsFree);
        builder.HasIndex(c => c.AverageRating);
    }
}
