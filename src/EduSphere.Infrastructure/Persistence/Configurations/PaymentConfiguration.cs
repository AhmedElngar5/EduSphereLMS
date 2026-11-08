using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduSphere.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(p => p.RefundedAmount)
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.PaymentGateway)
            .HasMaxLength(100);

        builder.Property(p => p.GatewayTransactionId)
            .HasMaxLength(500);

        builder.Property(p => p.GatewayPaymentIntentId)
            .HasMaxLength(500);

        builder.Property(p => p.ReceiptUrl)
            .HasMaxLength(1000);

        builder.Property(p => p.FailureReason)
            .HasMaxLength(1000);

        // One-to-one: Order → Payment
        builder.HasOne(p => p.Order)
            .WithOne(o => o.Payment)
            .HasForeignKey<Payment>(p => p.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.OrderId).IsUnique();
        builder.HasIndex(p => p.GatewayTransactionId);
        builder.HasIndex(p => p.Status);
    }
}

