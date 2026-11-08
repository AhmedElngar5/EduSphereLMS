using EduSphere.Domain.Entities;

namespace EduSphere.Application.Payments.Interfaces;

public record GatewayInitiationResult(
    bool IsSuccessful,
    string GatewayTransactionId,
    string? ClientSecret,
    string? ErrorMessage
);

public record GatewayExecutionResult(
    bool IsSuccessful,
    string GatewayTransactionId,
    string? ReceiptUrl,
    string? ErrorMessage
);

public interface IPaymentGateway
{
    string GatewayName { get; }

    Task<GatewayInitiationResult> InitiatePaymentAsync(
        Order order,
        decimal amount,
        string currency,
        CancellationToken ct = default);

    Task<GatewayExecutionResult> ProcessPaymentAsync(
        string transactionId,
        bool simulateSuccess,
        string? failureReason = null,
        CancellationToken ct = default);
}

