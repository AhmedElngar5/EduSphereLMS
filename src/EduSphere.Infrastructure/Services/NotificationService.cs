using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Notifications.Dtos;
using EduSphere.Application.Notifications.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;

    public NotificationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationDto> CreateNotificationAsync(
        string userId,
        NotificationType type,
        string title,
        string message,
        string? actionUrl = null,
        CancellationToken ct = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title.Trim(),
            Message = message.Trim(),
            ActionUrl = actionUrl,
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(ct);

        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            Type = notification.Type,
            Title = notification.Title,
            Message = notification.Message,
            ActionUrl = notification.ActionUrl,
            IsRead = notification.IsRead,
            ReadAtUtc = notification.ReadAtUtc,
            CreatedAtUtc = notification.CreatedAtUtc
        };
    }

    public async Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(
        string userId,
        bool? unreadOnly = null,
        int limit = 50,
        CancellationToken ct = default)
    {
        var query = _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId);

        if (unreadOnly == true)
        {
            query = query.Where(n => !n.IsRead);
        }

        var notifications = await query
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(Math.Clamp(limit, 1, 100))
            .ToListAsync(ct);

        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Type = n.Type,
            Title = n.Title,
            Message = n.Message,
            ActionUrl = n.ActionUrl,
            IsRead = n.IsRead,
            ReadAtUtc = n.ReadAtUtc,
            CreatedAtUtc = n.CreatedAtUtc
        }).ToList();
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct);
    }

    public async Task<bool> MarkAsReadAsync(string userId, int notificationId, CancellationToken ct = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct)
            ?? throw new NotFoundException(nameof(Notification), notificationId);

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);
        }

        return true;
    }

    public async Task<int> MarkAllAsReadAsync(string userId, CancellationToken ct = default)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        if (!unread.Any()) return 0;

        var now = DateTime.UtcNow;
        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAtUtc = now;
        }

        await _context.SaveChangesAsync(ct);
        return unread.Count;
    }
}

