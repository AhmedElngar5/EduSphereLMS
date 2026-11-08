using EduSphere.Application.Common.Interfaces;
using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/instructor/dashboard")]
[Authorize(Roles = "Instructor,Admin")]
public class InstructorDashboardController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public InstructorDashboardController(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Returns aggregated stats for the authenticated instructor's dashboard.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct)
    {
        var instructorId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("Not authenticated.");

        // --- Course list ---
        var courses = await _context.Courses
            .Include(c => c.Category)
            .Where(c => c.InstructorId == instructorId)
            .OrderByDescending(c => c.EnrolledCount)
            .ToListAsync(ct);

        var totalCourses = courses.Count;
        var totalStudents = courses.Sum(c => c.EnrolledCount);
        var publishedCourses = courses.Count(c => c.Status == CourseStatus.Published);

        // --- Revenue from completed payments for instructor's courses ---
        var courseIds = courses.Select(c => c.Id).ToList();

        var payments = await _context.Payments
            .Include(p => p.Order)
            .Where(p =>
                p.Status == PaymentStatus.Succeeded &&
                p.Order != null &&
                courseIds.Contains(p.Order.CourseId))
            .ToListAsync(ct);

        const decimal instructorShare = 0.80m;
        var totalRevenue = payments.Sum(p => p.Amount);
        var instructorEarnings = totalRevenue * instructorShare;

        // --- Per-course earnings breakdown ---
        var courseBreakdown = courses.Select(c =>
        {
            var coursePayments = payments.Where(p => p.Order?.CourseId == c.Id).ToList();
            var courseRevenue = coursePayments.Sum(p => p.Amount);
            return new
            {
                courseId = c.Id,
                title = c.Title,
                status = c.Status,
                enrolledCount = c.EnrolledCount,
                averageRating = c.AverageRating,
                totalReviews = c.TotalReviews,
                salesCount = coursePayments.Count,
                totalRevenue = courseRevenue,
                instructorEarnings = courseRevenue * instructorShare,
                thumbnailUrl = c.ThumbnailUrl,
                categoryName = c.Category?.Name ?? string.Empty,
                isFree = c.IsFree,
                price = c.Price
            };
        }).OrderByDescending(x => x.enrolledCount).ToList();

        // --- Monthly enrollment trend (last 12 months) for instructor's courses ---
        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);
        var monthlyEnrollments = await _context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId) && e.EnrolledAtUtc >= twelveMonthsAgo)
            .GroupBy(e => new { e.EnrolledAtUtc.Year, e.EnrolledAtUtc.Month })
            .Select(g => new { Year = g.Key.Year, Month = g.Key.Month, Count = g.Count() })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync(ct);

        var monthlyData = monthlyEnrollments.Select(x => new
        {
            month = $"{x.Year}-{x.Month:D2}",
            label = new DateTime(x.Year, x.Month, 1).ToString("MMM yyyy"),
            count = x.Count
        }).ToList();

        // --- Recent enrollments (last 10 across instructor's courses) ---
        var recentEnrollments = await _context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .OrderByDescending(e => e.EnrolledAtUtc)
            .Take(10)
            .Join(_context.Courses,
                e => e.CourseId,
                c => c.Id,
                (e, c) => new { Enrollment = e, CourseTitle = c.Title })
            .ToListAsync(ct);

        // Get student names
        var studentUserIds = recentEnrollments.Select(x => x.Enrollment.UserId).Distinct().ToList();
        var studentNames = new Dictionary<string, string>();
        foreach (var uid in studentUserIds)
        {
            var u = await _userManager.FindByIdAsync(uid);
            if (u != null) studentNames[uid] = $"{u.FirstName} {u.LastName}".Trim();
        }

        var recentEnrollmentsList = recentEnrollments.Select(x => new
        {
            enrollmentId = x.Enrollment.Id,
            courseId = x.Enrollment.CourseId,
            courseTitle = x.CourseTitle,
            studentName = studentNames.GetValueOrDefault(x.Enrollment.UserId, "Unknown Student"),
            enrolledAtUtc = x.Enrollment.EnrolledAtUtc,
            progressPercentage = x.Enrollment.ProgressPercentage,
            status = x.Enrollment.Status
        }).ToList();

        // --- Average rating across all courses ---
        var avgRating = courses.Where(c => c.TotalReviews > 0).Any()
            ? courses.Where(c => c.TotalReviews > 0).Average(c => c.AverageRating)
            : 0.0;

        return Ok(new
        {
            totalCourses,
            publishedCourses,
            totalStudents,
            totalRevenue,
            instructorEarnings,
            totalSalesCount = payments.Count,
            averageRating = Math.Round(avgRating, 2),
            courseBreakdown,
            monthlyEnrollments = monthlyData,
            recentEnrollments = recentEnrollmentsList
        });
    }
}
