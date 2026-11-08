using EduSphere.Application.Notifications.Dtos;
using EduSphere.Domain.Enums;

namespace EduSphere.Application.Notifications.Interfaces;

public interface INotificationService
{
    Task<NotificationDto> CreateNotificationAsync(
        string userId,
        NotificationType type,
        string title,
        string message,
        string? actionUrl = null,
        CancellationToken ct = default);

    Task<IReadOnlyList<NotificationDto>> GetUserNotificationsAsync(
        string userId,
        bool? unreadOnly = null,
        int limit = 50,
        CancellationToken ct = default);

    Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default);

    Task<bool> MarkAsReadAsync(string userId, int notificationId, CancellationToken ct = default);

    Task<int> MarkAllAsReadAsync(string userId, CancellationToken ct = default);
}

