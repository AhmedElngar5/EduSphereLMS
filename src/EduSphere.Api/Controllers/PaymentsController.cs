using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Payments.Dtos;
using EduSphere.Application.Payments.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ICurrentUserService _currentUserService;

    public PaymentsController(
        IPaymentService paymentService,
        ICurrentUserService currentUserService)
    {
        _paymentService = paymentService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    /// <summary>
    /// Initiate course checkout and create order + pending payment
    /// </summary>
    [HttpPost("checkout")]
    public async Task<ActionResult<CheckoutResultDto>> Checkout(
        [FromBody] CheckoutRequestDto dto,
        CancellationToken ct)
    {
        var result = await _paymentService.CheckoutAsync(CurrentUserId, dto, ct);
        return Ok(result);
    }

    /// <summary>
    /// Mock payment gateway: simulate successful card/payment completion
    /// </summary>
    [HttpPost("{paymentId:int}/simulate-success")]
    public async Task<ActionResult<PaymentDto>> SimulateSuccess(
        int paymentId,
        CancellationToken ct)
    {
        var result = await _paymentService.SimulatePaymentSuccessAsync(paymentId, CurrentUserId, ct);
        return Ok(result);
    }

    /// <summary>
    /// Mock payment gateway: simulate failed payment
    /// </summary>
    [HttpPost("{paymentId:int}/simulate-failure")]
    public async Task<ActionResult<PaymentDto>> SimulateFailure(
        int paymentId,
        [FromBody] SimulatePaymentDto? dto,
        CancellationToken ct)
    {
        var result = await _paymentService.SimulatePaymentFailureAsync(
            paymentId,
            CurrentUserId,
            dto?.FailureReason,
            ct);

        return Ok(result);
    }

    /// <summary>
    /// Check payment status
    /// </summary>
    [HttpGet("{paymentId:int}/status")]
    public async Task<ActionResult<PaymentStatusDto>> GetStatus(
        int paymentId,
        CancellationToken ct)
    {
        var result = await _paymentService.GetPaymentStatusAsync(paymentId, CurrentUserId, ct);
        return Ok(result);
    }

    /// <summary>
    /// View payment history for authenticated student
    /// </summary>
    [HttpGet("my-payments")]
    public async Task<ActionResult<IReadOnlyList<PaymentDto>>> GetMyPayments(CancellationToken ct)
    {
        var result = await _paymentService.GetUserPaymentsAsync(CurrentUserId, ct);
        return Ok(result);
    }

    /// <summary>
    /// Admin: view overall payment reports and platform revenue metrics
    /// </summary>
    [HttpGet("admin/report")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminPaymentReportDto>> GetAdminReport(CancellationToken ct)
    {
        var report = await _paymentService.GetAdminPaymentReportAsync(ct);
        return Ok(report);
    }

    /// <summary>
    /// Instructor: view course sales revenue and earnings breakdown
    /// </summary>
    [HttpGet("instructor/earnings")]
    [Authorize(Roles = "Instructor,Admin")]
    public async Task<ActionResult<InstructorEarningsSummaryDto>> GetInstructorEarnings(CancellationToken ct)
    {
        var earnings = await _paymentService.GetInstructorEarningsAsync(CurrentUserId, ct);
        return Ok(earnings);
    }
}

