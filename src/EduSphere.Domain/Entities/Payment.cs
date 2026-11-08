using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string? PaymentGateway { get; set; }         // e.g. "Stripe", "PayPal"
    public string? GatewayTransactionId { get; set; }   // External gateway reference ID
    public string? GatewayPaymentIntentId { get; set; } // Stripe PaymentIntent, etc.
    public string? ReceiptUrl { get; set; }
    public string? FailureReason { get; set; }
    public DateTime? PaidAtUtc { get; set; }
    public DateTime? RefundedAtUtc { get; set; }
    public decimal? RefundedAmount { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
}

