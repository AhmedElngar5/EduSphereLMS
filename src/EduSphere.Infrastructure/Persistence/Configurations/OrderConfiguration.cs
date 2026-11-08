using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(o => o.SubTotal)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(o => o.DiscountAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(o => o.TaxAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(o => o.TotalAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(o => o.CouponCode)
            .HasMaxLength(100);

        builder.Property(o => o.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.CourseId);
        builder.HasIndex(o => o.Status);

        builder.HasOne(o => o.Course)
            .WithMany(c => c.Orders)
            .HasForeignKey(o => o.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
