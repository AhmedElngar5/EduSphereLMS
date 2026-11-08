using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Payments.Dtos;
using EduSphere.Application.Payments.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ICurrentUserService _currentUserService;

    public OrdersController(
        IPaymentService paymentService,
        ICurrentUserService currentUserService)
    {
        _paymentService = paymentService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    /// <summary>
    /// View order history for authenticated user
    /// </summary>
    [HttpGet("my-orders")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetMyOrders(CancellationToken ct)
    {
        var orders = await _paymentService.GetUserOrdersAsync(CurrentUserId, ct);
        return Ok(orders);
    }
}

