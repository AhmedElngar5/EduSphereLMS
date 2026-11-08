using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Notifications.Interfaces;
using EduSphere.Application.Reviews.Dtos;
using EduSphere.Application.Reviews.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public ReviewService(
        IApplicationDbContext context,
        INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<ReviewDto> AddReviewAsync(string userId, int courseId, CreateReviewDto dto, CancellationToken ct = default)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        // Rule: Only enrolled students can rate or review a course
        var isEnrolled = await _context.Enrollments.AnyAsync(e =>
            e.UserId == userId && e.CourseId == courseId &&
            (e.Status == EnrollmentStatus.Active || e.Status == EnrollmentStatus.Completed), ct);

        if (!isEnrolled)
        {
            throw new UnauthorizedAccessException("Only enrolled students can review this course.");
        }

        // Rule: Prevent duplicate reviews
        var existing = await _context.Reviews.FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == courseId, ct);
        if (existing != null)
        {
            throw new InvalidOperationException("You have already reviewed this course. You can update your existing review.");
        }

        var review = new Review
        {
            UserId = userId,
            CourseId = courseId,
            Rating = Math.Clamp(dto.Rating, 1, 5),
            Comment = dto.Comment?.Trim(),
            IsPublished = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(ct);

        // Recalculate average rating & total reviews
        await RecalculateCourseRatingAsync(courseId, ct);

        // Notify instructor
        await _notificationService.CreateNotificationAsync(
            course.InstructorId,
            NotificationType.ReviewReceived,
            "New Course Review Received",
            $"A student left a {review.Rating}-star review on '{course.Title}'.",
            actionUrl: $"/courses/{course.Slug}",
            ct: ct);

        return await MapToReviewDtoAsync(review, ct);
    }

    public async Task<ReviewDto> UpdateReviewAsync(string userId, int reviewId, UpdateReviewDto dto, CancellationToken ct = default)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId, ct)
            ?? throw new NotFoundException(nameof(Review), reviewId);

        if (review.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only edit your own reviews.");
        }

        review.Rating = Math.Clamp(dto.Rating, 1, 5);
        review.Comment = dto.Comment?.Trim();
        review.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        await RecalculateCourseRatingAsync(review.CourseId, ct);

        return await MapToReviewDtoAsync(review, ct);
    }

    public async Task<bool> DeleteReviewAsync(string userId, int reviewId, CancellationToken ct = default)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == reviewId, ct)
            ?? throw new NotFoundException(nameof(Review), reviewId);

        if (review.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own reviews.");
        }

        var courseId = review.CourseId;
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync(ct);

        await RecalculateCourseRatingAsync(courseId, ct);
        return true;
    }

    public async Task<IReadOnlyList<ReviewDto>> GetCourseReviewsAsync(int courseId, CancellationToken ct = default)
    {
        var reviews = await _context.Reviews
            .AsNoTracking()
            .Where(r => r.CourseId == courseId && r.IsPublished)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync(ct);

        if (!reviews.Any()) return Array.Empty<ReviewDto>();

        var userIds = reviews.Select(r => r.UserId).Distinct().ToList();
        var users = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, userIds, ct);

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            CourseId = r.CourseId,
            UserId = r.UserId,
            StudentName = users.GetValueOrDefault(r.UserId)?.FullName ?? "Student",
            StudentPictureUrl = users.GetValueOrDefault(r.UserId)?.ProfilePictureUrl,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAtUtc = r.CreatedAtUtc,
            LastModifiedAtUtc = r.LastModifiedAtUtc
        }).ToList();
    }

    public async Task<ReviewDto?> GetUserCourseReviewAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var review = await _context.Reviews
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == courseId, ct);

        if (review == null) return null;
        return await MapToReviewDtoAsync(review, ct);
    }

    private async Task RecalculateCourseRatingAsync(int courseId, CancellationToken ct)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId, ct);
        if (course == null) return;

        var ratings = await _context.Reviews
            .Where(r => r.CourseId == courseId && r.IsPublished)
            .Select(r => r.Rating)
            .ToListAsync(ct);

        course.TotalReviews = ratings.Count;
        course.AverageRating = ratings.Count > 0 ? Math.Round(ratings.Average(), 2) : 0.0;
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    private async Task<ReviewDto> MapToReviewDtoAsync(Review r, CancellationToken ct)
    {
        var users = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [r.UserId], ct);

        return new ReviewDto
        {
            Id = r.Id,
            CourseId = r.CourseId,
            UserId = r.UserId,
            StudentName = users.GetValueOrDefault(r.UserId)?.FullName ?? "Student",
            StudentPictureUrl = users.GetValueOrDefault(r.UserId)?.ProfilePictureUrl,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAtUtc = r.CreatedAtUtc,
            LastModifiedAtUtc = r.LastModifiedAtUtc
        };
    }
}

