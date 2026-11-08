using EduSphere.Domain.Enums;

namespace EduSphere.Application.Payments.Dtos;

public class CheckoutRequestDto
{
    public int CourseId { get; set; }
    public string? CouponCode { get; set; }
    public string? PaymentGateway { get; set; } = "MockGateway";
}

public class CheckoutResultDto
{
    public int OrderId { get; set; }
    public int PaymentId { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Currency { get; set; } = "USD";
    public string PaymentGateway { get; set; } = "MockGateway";
    public PaymentStatus PaymentStatus { get; set; }
    public string GatewayTransactionId { get; set; } = string.Empty;
    public string SimulateSuccessUrl { get; set; } = string.Empty;
    public string SimulateFailureUrl { get; set; } = string.Empty;
}

public class SimulatePaymentDto
{
    public string? FailureReason { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseThumbnailUrl { get; set; }
    public OrderStatus Status { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? CouponCode { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public int? PaymentId { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }
    public string? PaymentGateway { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus Status { get; set; }
    public string? PaymentGateway { get; set; }
    public string? GatewayTransactionId { get; set; }
    public string? ReceiptUrl { get; set; }
    public string? FailureReason { get; set; }
    public DateTime? PaidAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class PaymentStatusDto
{
    public int PaymentId { get; set; }
    public int OrderId { get; set; }
    public PaymentStatus Status { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime? PaidAtUtc { get; set; }
    public string? FailureReason { get; set; }
    public bool IsEnrolled { get; set; }
}

public class InstructorEarningsSummaryDto
{
    public string InstructorId { get; set; } = string.Empty;
    public int TotalSalesCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal InstructorEarnings { get; set; } // 80% default share
    public decimal PlatformFee { get; set; }         // 20% default share
    public IReadOnlyList<CourseEarningsDto> CourseBreakdown { get; set; } = Array.Empty<CourseEarningsDto>();
    public IReadOnlyList<EarningsTransactionDto> RecentTransactions { get; set; } = Array.Empty<EarningsTransactionDto>();
}

public class CourseEarningsDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int SalesCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal InstructorEarnings { get; set; }
}

public class EarningsTransactionDto
{
    public int OrderId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal InstructorEarnings { get; set; }
    public DateTime PaidAtUtc { get; set; }
}

public class AdminPaymentReportDto
{
    public decimal TotalGrossRevenue { get; set; }
    public decimal TotalNetPlatformRevenue { get; set; }
    public decimal TotalInstructorPayouts { get; set; }
    public int TotalCompletedOrders { get; set; }
    public int TotalFailedOrders { get; set; }
    public int TotalPendingOrders { get; set; }
    public IReadOnlyList<PaymentDto> RecentPayments { get; set; } = Array.Empty<PaymentDto>();
}

