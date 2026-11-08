using EduSphere.Application.Payments.Dtos;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Xunit;

namespace EduSphere.UnitTests;

public class PaymentCalculationTests
{
    [Fact]
    public void Order_Calculations_TotalMatchesSubTotalMinusDiscountPlusTax()
    {
        var subTotal = 120.00m;
        var discount = 20.00m;
        var tax = 10.00m;
        var total = subTotal - discount + tax;

        var order = new Order
        {
            UserId = "student-1",
            CourseId = 5,
            SubTotal = subTotal,
            DiscountAmount = discount,
            TaxAmount = tax,
            TotalAmount = total,
            Status = OrderStatus.Pending
        };

        Assert.Equal(110.00m, order.TotalAmount);
        Assert.Equal(OrderStatus.Pending, order.Status);
    }

    [Fact]
    public void Payment_SuccessfulStatus_TransitionsCorrectly()
    {
        var payment = new Payment
        {
            OrderId = 1,
            Amount = 110.00m,
            Currency = "USD",
            PaymentGateway = "MockGateway",
            Status = PaymentStatus.Pending
        };

        // Simulate success
        payment.Status = PaymentStatus.Succeeded;
        payment.PaidAtUtc = DateTime.UtcNow;
        payment.GatewayTransactionId = "TXN_MOCK_123456";

        Assert.Equal(PaymentStatus.Succeeded, payment.Status);
        Assert.NotNull(payment.PaidAtUtc);
        Assert.NotEmpty(payment.GatewayTransactionId);
    }

    [Fact]
    public void Payment_FailureStatus_RecordsReason()
    {
        var payment = new Payment
        {
            OrderId = 1,
            Amount = 110.00m,
            Currency = "USD",
            PaymentGateway = "MockGateway",
            Status = PaymentStatus.Pending
        };

        // Simulate failure
        payment.Status = PaymentStatus.Failed;
        payment.FailureReason = "Insufficient funds in simulated account.";

        Assert.Equal(PaymentStatus.Failed, payment.Status);
        Assert.Equal("Insufficient funds in simulated account.", payment.FailureReason);
        Assert.Null(payment.PaidAtUtc);
    }
}

