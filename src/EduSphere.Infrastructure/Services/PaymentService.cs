using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Enrollments.Interfaces;
using EduSphere.Application.Notifications.Interfaces;
using EduSphere.Application.Payments.Dtos;
using EduSphere.Application.Payments.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly IApplicationDbContext _context;
    private readonly IPaymentGateway _paymentGateway;
    private readonly IEnrollmentService _enrollmentService;
    private readonly INotificationService _notificationService;

    public PaymentService(
        IApplicationDbContext context,
        IPaymentGateway paymentGateway,
        IEnrollmentService enrollmentService,
        INotificationService notificationService)
    {
        _context = context;
        _paymentGateway = paymentGateway;
        _enrollmentService = enrollmentService;
        _notificationService = notificationService;
    }

    public async Task<CheckoutResultDto> CheckoutAsync(string userId, CheckoutRequestDto dto, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == dto.CourseId, ct)
            ?? throw new NotFoundException(nameof(Course), dto.CourseId);

        if (course.Status != CourseStatus.Published)
        {
            throw new InvalidOperationException("Course is not available for purchase.");
        }

        // Prevent purchasing if already enrolled
        var isEnrolled = await _enrollmentService.IsEnrolledAsync(userId, course.Id, ct);
        if (isEnrolled)
        {
            throw new InvalidOperationException("You are already enrolled in this course.");
        }

        var subTotal = course.Price;
        var discount = 0m;

        if (course.DiscountPrice.HasValue &&
            (!course.DiscountExpiresAtUtc.HasValue || course.DiscountExpiresAtUtc.Value > DateTime.UtcNow))
        {
            discount = Math.Max(0m, course.Price - course.DiscountPrice.Value);
        }

        // Optional mock coupon code handling
        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            var code = dto.CouponCode.Trim().ToUpperInvariant();
            if (code == "SAVE10")
            {
                discount += (subTotal - discount) * 0.10m;
            }
            else if (code == "FREE100")
            {
                discount = subTotal;
            }
        }

        var total = Math.Max(0m, Math.Round(subTotal - discount, 2));

        var order = new Order
        {
            UserId = userId,
            CourseId = course.Id,
            Status = OrderStatus.Pending,
            SubTotal = subTotal,
            DiscountAmount = Math.Round(discount, 2),
            TaxAmount = 0m,
            TotalAmount = total,
            CouponCode = dto.CouponCode?.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);

        var initiation = await _paymentGateway.InitiatePaymentAsync(order, total, "USD", ct);

        var payment = new Payment
        {
            OrderId = order.Id,
            Status = PaymentStatus.Pending,
            Amount = total,
            Currency = "USD",
            PaymentGateway = _paymentGateway.GatewayName,
            GatewayTransactionId = initiation.GatewayTransactionId,
            GatewayPaymentIntentId = initiation.ClientSecret,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync(ct);

        return new CheckoutResultDto
        {
            OrderId = order.Id,
            PaymentId = payment.Id,
            CourseId = course.Id,
            CourseTitle = course.Title,
            SubTotal = order.SubTotal,
            DiscountAmount = order.DiscountAmount,
            TaxAmount = order.TaxAmount,
            TotalAmount = order.TotalAmount,
            Currency = payment.Currency,
            PaymentGateway = payment.PaymentGateway ?? _paymentGateway.GatewayName,
            PaymentStatus = payment.Status,
            GatewayTransactionId = payment.GatewayTransactionId ?? string.Empty,
            SimulateSuccessUrl = $"/api/payments/{payment.Id}/simulate-success",
            SimulateFailureUrl = $"/api/payments/{payment.Id}/simulate-failure"
        };
    }

    public async Task<PaymentDto> SimulatePaymentSuccessAsync(int paymentId, string userId, CancellationToken ct = default)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.Course)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct)
            ?? throw new NotFoundException(nameof(Payment), paymentId);

        if (payment.Order.UserId != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to process this payment.");
        }

        if (payment.Status == PaymentStatus.Succeeded)
        {
            return MapToPaymentDto(payment);
        }

        var gatewayResult = await _paymentGateway.ProcessPaymentAsync(
            payment.GatewayTransactionId ?? $"MOCK-TXN-{Guid.NewGuid():N}",
            simulateSuccess: true,
            ct: ct);

        payment.Status = PaymentStatus.Succeeded;
        payment.PaidAtUtc = DateTime.UtcNow;
        payment.ReceiptUrl = gatewayResult.ReceiptUrl;
        payment.LastModifiedAtUtc = DateTime.UtcNow;

        payment.Order.Status = OrderStatus.Completed;
        payment.Order.LastModifiedAtUtc = DateTime.UtcNow;

        // Automatically activate student enrollment
        await _enrollmentService.EnrollAsync(
            userId,
            payment.Order.CourseId,
            pricePaid: payment.Amount,
            orderId: payment.OrderId,
            ct: ct);

        // Send payment and enrollment notifications
        await _notificationService.CreateNotificationAsync(
            userId,
            NotificationType.PaymentConfirmed,
            "Payment Confirmed",
            $"Your payment of ${payment.Amount:F2} for '{payment.Order.Course.Title}' was successful.",
            actionUrl: $"/courses/{payment.Order.Course.Slug}",
            ct: ct);

        await _notificationService.CreateNotificationAsync(
            userId,
            NotificationType.CourseEnrollment,
            "Course Enrolled",
            $"You have successfully enrolled in '{payment.Order.Course.Title}'. Start learning now!",
            actionUrl: $"/learning/{payment.Order.CourseId}",
            ct: ct);

        await _context.SaveChangesAsync(ct);

        return MapToPaymentDto(payment);
    }

    public async Task<PaymentDto> SimulatePaymentFailureAsync(int paymentId, string userId, string? failureReason = null, CancellationToken ct = default)
    {
        var payment = await _context.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.Course)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct)
            ?? throw new NotFoundException(nameof(Payment), paymentId);

        if (payment.Order.UserId != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to process this payment.");
        }

        var reason = failureReason ?? "Card declined by mock payment gateway.";
        var gatewayResult = await _paymentGateway.ProcessPaymentAsync(
            payment.GatewayTransactionId ?? $"MOCK-TXN-{Guid.NewGuid():N}",
            simulateSuccess: false,
            failureReason: reason,
            ct: ct);

        payment.Status = PaymentStatus.Failed;
        payment.FailureReason = reason;
        payment.LastModifiedAtUtc = DateTime.UtcNow;

        payment.Order.Status = OrderStatus.Failed;
        payment.Order.LastModifiedAtUtc = DateTime.UtcNow;

        await _notificationService.CreateNotificationAsync(
            userId,
            NotificationType.PaymentFailed,
            "Payment Failed",
            $"Your payment of ${payment.Amount:F2} for '{payment.Order.Course.Title}' was declined: {reason}",
            actionUrl: $"/checkout/{payment.Order.CourseId}",
            ct: ct);

        await _context.SaveChangesAsync(ct);

        return MapToPaymentDto(payment);
    }

    public async Task<PaymentStatusDto> GetPaymentStatusAsync(int paymentId, string userId, CancellationToken ct = default)
    {
        var payment = await _context.Payments
            .AsNoTracking()
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct)
            ?? throw new NotFoundException(nameof(Payment), paymentId);

        if (payment.Order.UserId != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to view this payment status.");
        }

        var isEnrolled = await _enrollmentService.IsEnrolledAsync(userId, payment.Order.CourseId, ct);

        return new PaymentStatusDto
        {
            PaymentId = payment.Id,
            OrderId = payment.OrderId,
            Status = payment.Status,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaidAtUtc = payment.PaidAtUtc,
            FailureReason = payment.FailureReason,
            IsEnrolled = isEnrolled
        };
    }

    public async Task<IReadOnlyList<PaymentDto>> GetUserPaymentsAsync(string userId, CancellationToken ct = default)
    {
        var payments = await _context.Payments
            .AsNoTracking()
            .Include(p => p.Order)
                .ThenInclude(o => o.Course)
            .Where(p => p.Order.UserId == userId)
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(ct);

        return payments.Select(MapToPaymentDto).ToList();
    }

    public async Task<IReadOnlyList<OrderDto>> GetUserOrdersAsync(string userId, CancellationToken ct = default)
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Course)
            .Include(o => o.Payment)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync(ct);

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            UserId = o.UserId,
            CourseId = o.CourseId,
            CourseTitle = o.Course?.Title ?? string.Empty,
            CourseThumbnailUrl = o.Course?.ThumbnailUrl,
            Status = o.Status,
            SubTotal = o.SubTotal,
            DiscountAmount = o.DiscountAmount,
            TaxAmount = o.TaxAmount,
            TotalAmount = o.TotalAmount,
            CouponCode = o.CouponCode,
            CreatedAtUtc = o.CreatedAtUtc,
            PaymentId = o.Payment?.Id,
            PaymentStatus = o.Payment?.Status,
            PaymentGateway = o.Payment?.PaymentGateway
        }).ToList();
    }

    public async Task<InstructorEarningsSummaryDto> GetInstructorEarningsAsync(string instructorId, CancellationToken ct = default)
    {
        var completedOrders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Course)
            .Include(o => o.Payment)
            .Where(o => o.Course.InstructorId == instructorId && o.Status == OrderStatus.Completed)
            .OrderByDescending(o => o.Payment != null ? o.Payment.PaidAtUtc : o.CreatedAtUtc)
            .ToListAsync(ct);

        var totalRevenue = completedOrders.Sum(o => o.TotalAmount);
        var instructorEarnings = Math.Round(totalRevenue * 0.80m, 2); // 80% instructor share
        var platformFee = totalRevenue - instructorEarnings;          // 20% platform fee

        var userIds = completedOrders.Select(o => o.UserId).Distinct().ToList();
        var users = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, userIds, ct);

        var courseGroups = completedOrders
            .GroupBy(o => new { o.CourseId, o.Course.Title })
            .Select(g =>
            {
                var rev = g.Sum(x => x.TotalAmount);
                return new CourseEarningsDto
                {
                    CourseId = g.Key.CourseId,
                    CourseTitle = g.Key.Title,
                    SalesCount = g.Count(),
                    TotalRevenue = rev,
                    InstructorEarnings = Math.Round(rev * 0.80m, 2)
                };
            })
            .OrderByDescending(c => c.TotalRevenue)
            .ToList();

        var recentTransactions = completedOrders
            .Take(20)
            .Select(o => new EarningsTransactionDto
            {
                OrderId = o.Id,
                CourseTitle = o.Course.Title,
                StudentName = users.GetValueOrDefault(o.UserId)?.FullName ?? "Student",
                Amount = o.TotalAmount,
                InstructorEarnings = Math.Round(o.TotalAmount * 0.80m, 2),
                PaidAtUtc = o.Payment?.PaidAtUtc ?? o.CreatedAtUtc
            })
            .ToList();

        return new InstructorEarningsSummaryDto
        {
            InstructorId = instructorId,
            TotalSalesCount = completedOrders.Count,
            TotalRevenue = totalRevenue,
            InstructorEarnings = instructorEarnings,
            PlatformFee = platformFee,
            CourseBreakdown = courseGroups,
            RecentTransactions = recentTransactions
        };
    }

    public async Task<AdminPaymentReportDto> GetAdminPaymentReportAsync(CancellationToken ct = default)
    {
        var payments = await _context.Payments
            .AsNoTracking()
            .Include(p => p.Order)
                .ThenInclude(o => o.Course)
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(ct);

        var completed = payments.Where(p => p.Status == PaymentStatus.Succeeded).ToList();
        var failedCount = payments.Count(p => p.Status == PaymentStatus.Failed);
        var pendingCount = payments.Count(p => p.Status == PaymentStatus.Pending);

        var totalGross = completed.Sum(p => p.Amount);
        var instructorPayouts = Math.Round(totalGross * 0.80m, 2);
        var netPlatformRevenue = totalGross - instructorPayouts;

        return new AdminPaymentReportDto
        {
            TotalGrossRevenue = totalGross,
            TotalNetPlatformRevenue = netPlatformRevenue,
            TotalInstructorPayouts = instructorPayouts,
            TotalCompletedOrders = completed.Count,
            TotalFailedOrders = failedCount,
            TotalPendingOrders = pendingCount,
            RecentPayments = payments.Take(25).Select(MapToPaymentDto).ToList()
        };
    }

    private static PaymentDto MapToPaymentDto(Payment p)
    {
        return new PaymentDto
        {
            Id = p.Id,
            OrderId = p.OrderId,
            CourseId = p.Order?.CourseId ?? 0,
            CourseTitle = p.Order?.Course?.Title ?? string.Empty,
            Amount = p.Amount,
            Currency = p.Currency,
            Status = p.Status,
            PaymentGateway = p.PaymentGateway,
            GatewayTransactionId = p.GatewayTransactionId,
            ReceiptUrl = p.ReceiptUrl,
            FailureReason = p.FailureReason,
            PaidAtUtc = p.PaidAtUtc,
            CreatedAtUtc = p.CreatedAtUtc
        };
    }
}
