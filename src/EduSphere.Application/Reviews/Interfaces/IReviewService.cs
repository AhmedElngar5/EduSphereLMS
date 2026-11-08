using EduSphere.Application.Reviews.Dtos;

namespace EduSphere.Application.Reviews.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> AddReviewAsync(string userId, int courseId, CreateReviewDto dto, CancellationToken ct = default);
    Task<ReviewDto> UpdateReviewAsync(string userId, int reviewId, UpdateReviewDto dto, CancellationToken ct = default);
    Task<bool> DeleteReviewAsync(string userId, int reviewId, CancellationToken ct = default);
    Task<IReadOnlyList<ReviewDto>> GetCourseReviewsAsync(int courseId, CancellationToken ct = default);
    Task<ReviewDto?> GetUserCourseReviewAsync(string userId, int courseId, CancellationToken ct = default);
}

