using EduSphere.Application.Payments.Dtos;

namespace EduSphere.Application.Payments.Interfaces;

public interface IPaymentService
{
    Task<CheckoutResultDto> CheckoutAsync(string userId, CheckoutRequestDto dto, CancellationToken ct = default);
    Task<PaymentDto> SimulatePaymentSuccessAsync(int paymentId, string userId, CancellationToken ct = default);
    Task<PaymentDto> SimulatePaymentFailureAsync(int paymentId, string userId, string? failureReason = null, CancellationToken ct = default);
    Task<PaymentStatusDto> GetPaymentStatusAsync(int paymentId, string userId, CancellationToken ct = default);
    Task<IReadOnlyList<PaymentDto>> GetUserPaymentsAsync(string userId, CancellationToken ct = default);
    Task<IReadOnlyList<OrderDto>> GetUserOrdersAsync(string userId, CancellationToken ct = default);
    Task<InstructorEarningsSummaryDto> GetInstructorEarningsAsync(string instructorId, CancellationToken ct = default);
    Task<AdminPaymentReportDto> GetAdminPaymentReportAsync(CancellationToken ct = default);
}

