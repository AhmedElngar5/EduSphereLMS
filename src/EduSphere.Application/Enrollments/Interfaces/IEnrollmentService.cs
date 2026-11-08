using EduSphere.Application.Enrollments.Dtos;

namespace EduSphere.Application.Enrollments.Interfaces;

public interface IEnrollmentService
{
    Task<EnrollmentDto> EnrollAsync(string userId, int courseId, decimal? pricePaid = null, int? orderId = null, CancellationToken ct = default);
    Task<IReadOnlyList<EnrollmentDto>> GetUserEnrollmentsAsync(string userId, bool? completedOnly = null, CancellationToken ct = default);
    Task<EnrollmentStatusDto> GetEnrollmentStatusAsync(string userId, int courseId, CancellationToken ct = default);
    Task<bool> IsEnrolledAsync(string userId, int courseId, CancellationToken ct = default);
}

