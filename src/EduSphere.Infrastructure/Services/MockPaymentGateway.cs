using EduSphere.Application.Payments.Interfaces;
using EduSphere.Domain.Entities;

namespace EduSphere.Infrastructure.Services;

public class MockPaymentGateway : IPaymentGateway
{
    public string GatewayName => "MockGateway";

    public Task<GatewayInitiationResult> InitiatePaymentAsync(
        Order order,
        decimal amount,
        string currency,
        CancellationToken ct = default)
    {
        var txnId = $"MOCK-TXN-{Guid.NewGuid():N}";
        var clientSecret = $"mock_secret_{Guid.NewGuid():N}";

        return Task.FromResult(new GatewayInitiationResult(
            IsSuccessful: true,
            GatewayTransactionId: txnId,
            ClientSecret: clientSecret,
            ErrorMessage: null
        ));
    }

    public Task<GatewayExecutionResult> ProcessPaymentAsync(
        string transactionId,
        bool simulateSuccess,
        string? failureReason = null,
        CancellationToken ct = default)
    {
        if (simulateSuccess)
        {
            var receiptUrl = $"/receipts/mock/{transactionId}.pdf";
            return Task.FromResult(new GatewayExecutionResult(
                IsSuccessful: true,
                GatewayTransactionId: transactionId,
                ReceiptUrl: receiptUrl,
                ErrorMessage: null
            ));
        }

        return Task.FromResult(new GatewayExecutionResult(
            IsSuccessful: false,
            GatewayTransactionId: transactionId,
            ReceiptUrl: null,
            ErrorMessage: failureReason ?? "Card declined by mock payment gateway."
        ));
    }
}

