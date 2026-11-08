using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Enrollments.Dtos;
using EduSphere.Application.Enrollments.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly IApplicationDbContext _context;

    public EnrollmentService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EnrollmentDto> EnrollAsync(
        string userId,
        int courseId,
        decimal? pricePaid = null,
        int? orderId = null,
        CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        if (course.Status != CourseStatus.Published)
        {
            throw new InvalidOperationException("Course is not published and cannot be enrolled in.");
        }

        // Prevent duplicate enrollments
        var existing = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);

        if (existing != null)
        {
            throw new InvalidOperationException("You are already enrolled in this course.");
        }

        var isFree = course.IsFree || course.Price == 0;
        if (!isFree && pricePaid == null)
        {
            throw new InvalidOperationException("This is a paid course. An active order/payment is required to enroll.");
        }

        var actualPrice = pricePaid ?? (isFree ? 0m : course.DiscountPrice ?? course.Price);

        var enrollment = new Enrollment
        {
            UserId = userId,
            CourseId = courseId,
            Status = EnrollmentStatus.Active,
            PricePaid = actualPrice,
            OrderId = orderId,
            ProgressPercentage = 0,
            EnrolledAtUtc = DateTime.UtcNow,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Enrollments.Add(enrollment);
        course.EnrolledCount += 1;

        await _context.SaveChangesAsync(ct);

        var firstLesson = await _context.Lessons
            .Where(l => l.Section.CourseId == courseId)
            .OrderBy(l => l.Section.DisplayOrder)
            .ThenBy(l => l.DisplayOrder)
            .Select(l => new { l.Id, l.Title })
            .FirstOrDefaultAsync(ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);
        var instructorName = instructors.GetValueOrDefault(course.InstructorId)?.FullName ?? "Instructor";

        var totalLessons = await _context.Lessons
            .Where(l => l.Section.CourseId == courseId)
            .CountAsync(ct);

        return new EnrollmentDto
        {
            Id = enrollment.Id,
            UserId = enrollment.UserId,
            CourseId = enrollment.CourseId,
            CourseTitle = course.Title,
            CourseSlug = course.Slug,
            CourseThumbnailUrl = course.ThumbnailUrl,
            InstructorName = instructorName,
            CategoryName = course.Category?.Name ?? string.Empty,
            Status = enrollment.Status,
            PricePaid = enrollment.PricePaid,
            ProgressPercentage = 0,
            TotalLessons = totalLessons,
            CompletedLessons = 0,
            EnrolledAtUtc = enrollment.EnrolledAtUtc,
            NextLessonId = firstLesson?.Id,
            NextLessonTitle = firstLesson?.Title
        };
    }

    public async Task<IReadOnlyList<EnrollmentDto>> GetUserEnrollmentsAsync(
        string userId,
        bool? completedOnly = null,
        CancellationToken ct = default)
    {
        var query = _context.Enrollments
            .AsNoTracking()
            .Include(e => e.Course)
                .ThenInclude(c => c.Category)
            .Where(e => e.UserId == userId);

        if (completedOnly == true)
        {
            query = query.Where(e => e.Status == EnrollmentStatus.Completed || e.ProgressPercentage >= 100);
        }

        var enrollments = await query
            .OrderByDescending(e => e.LastAccessedAtUtc ?? e.EnrolledAtUtc)
            .ToListAsync(ct);

        if (!enrollments.Any())
        {
            return Array.Empty<EnrollmentDto>();
        }

        var courseIds = enrollments.Select(e => e.CourseId).Distinct().ToList();
        var instructorIds = enrollments.Select(e => e.Course.InstructorId).Distinct().ToList();

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, instructorIds, ct);

        // Fetch lessons and user progress for all enrolled courses
        var lessons = await _context.Lessons
            .AsNoTracking()
            .Where(l => courseIds.Contains(l.Section.CourseId))
            .Select(l => new
            {
                l.Id,
                l.Title,
                l.Section.CourseId,
                SectionOrder = l.Section.DisplayOrder,
                LessonOrder = l.DisplayOrder
            })
            .OrderBy(l => l.CourseId)
            .ThenBy(l => l.SectionOrder)
            .ThenBy(l => l.LessonOrder)
            .ToListAsync(ct);

        var completedLessonIds = await _context.LessonProgresses
            .AsNoTracking()
            .Where(lp => lp.UserId == userId && lp.Status == LessonProgressStatus.Completed)
            .Select(lp => lp.LessonId)
            .ToHashSetAsync(ct);

        var result = new List<EnrollmentDto>();

        foreach (var e in enrollments)
        {
            var courseLessons = lessons.Where(l => l.CourseId == e.CourseId).ToList();
            var total = courseLessons.Count;
            var completed = courseLessons.Count(l => completedLessonIds.Contains(l.Id));
            var computedPercentage = total > 0 ? Math.Round((double)completed / total * 100.0, 2) : 100.0;
            var isCompleted = e.Status == EnrollmentStatus.Completed || (computedPercentage >= 100.0 && total > 0);

            // Find next uncompleted lesson
            var nextLesson = courseLessons.FirstOrDefault(l => !completedLessonIds.Contains(l.Id))
                             ?? courseLessons.LastOrDefault();

            result.Add(new EnrollmentDto
            {
                Id = e.Id,
                UserId = e.UserId,
                CourseId = e.CourseId,
                CourseTitle = e.Course.Title,
                CourseSlug = e.Course.Slug,
                CourseThumbnailUrl = e.Course.ThumbnailUrl,
                InstructorName = instructors.GetValueOrDefault(e.Course.InstructorId)?.FullName ?? "Instructor",
                CategoryName = e.Course.Category?.Name ?? string.Empty,
                Status = isCompleted ? EnrollmentStatus.Completed : e.Status,
                PricePaid = e.PricePaid,
                ProgressPercentage = Math.Max(e.ProgressPercentage, computedPercentage),
                TotalLessons = total,
                CompletedLessons = completed,
                EnrolledAtUtc = e.EnrolledAtUtc,
                LastAccessedAtUtc = e.LastAccessedAtUtc,
                CompletedAtUtc = e.CompletedAtUtc ?? (isCompleted ? DateTime.UtcNow : null),
                NextLessonId = nextLesson?.Id,
                NextLessonTitle = nextLesson?.Title
            });
        }

        return result;
    }

    public async Task<EnrollmentStatusDto> GetEnrollmentStatusAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var enrollment = await _context.Enrollments
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);

        if (enrollment == null)
        {
            return new EnrollmentStatusDto { IsEnrolled = false };
        }

        return new EnrollmentStatusDto
        {
            IsEnrolled = true,
            Status = enrollment.Status,
            ProgressPercentage = enrollment.ProgressPercentage,
            EnrolledAtUtc = enrollment.EnrolledAtUtc,
            CompletedAtUtc = enrollment.CompletedAtUtc
        };
    }

    public async Task<bool> IsEnrolledAsync(string userId, int courseId, CancellationToken ct = default)
    {
        return await _context.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == courseId &&
                           (e.Status == EnrollmentStatus.Active || e.Status == EnrollmentStatus.Completed), ct);
    }
}
