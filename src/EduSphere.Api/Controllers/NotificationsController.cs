using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Notifications.Dtos;
using EduSphere.Application.Notifications.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public NotificationsController(
        INotificationService notificationService,
        ICurrentUserService currentUserService)
    {
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetNotifications(
        [FromQuery] bool? unreadOnly,
        [FromQuery] int limit = 50,
        CancellationToken ct = default)
    {
        var result = await _notificationService.GetUserNotificationsAsync(CurrentUserId, unreadOnly, limit, ct);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount(CancellationToken ct)
    {
        var count = await _notificationService.GetUnreadCountAsync(CurrentUserId, ct);
        return Ok(new { unreadCount = count });
    }

    [HttpPost("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken ct)
    {
        await _notificationService.MarkAsReadAsync(CurrentUserId, id, ct);
        return NoContent();
    }

    [HttpPost("mark-all-read")]
    public async Task<ActionResult<object>> MarkAllAsRead(CancellationToken ct)
    {
        var count = await _notificationService.MarkAllAsReadAsync(CurrentUserId, ct);
        return Ok(new { markedReadCount = count });
    }
}

