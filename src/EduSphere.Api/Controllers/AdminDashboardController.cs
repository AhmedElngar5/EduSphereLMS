using EduSphere.Domain.Enums;
using EduSphere.Infrastructure.Identity;
using EduSphere.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public class AdminDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminDashboardController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    /// <summary>
    /// Returns aggregated platform statistics for the Admin Dashboard.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct)
    {
        // --- User counts by role ---
        var allUsers = await _userManager.Users.ToListAsync(ct);
        var totalUsers = allUsers.Count;

        var studentIds = new HashSet<string>();
        var instructorIds = new HashSet<string>();

        foreach (var u in allUsers)
        {
            var roles = await _userManager.GetRolesAsync(u);
            if (roles.Contains("Student")) studentIds.Add(u.Id);
            if (roles.Contains("Instructor")) instructorIds.Add(u.Id);
        }

        var totalStudents = studentIds.Count;
        var totalInstructors = instructorIds.Count;

        // --- Course stats ---
        var courseCounts = await _context.Courses
            .GroupBy(c => c.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var totalCourses = courseCounts.Sum(x => x.Count);
        var publishedCourses = courseCounts.FirstOrDefault(x => x.Status == CourseStatus.Published)?.Count ?? 0;
        var pendingCourses = courseCounts.FirstOrDefault(x => x.Status == CourseStatus.PendingApproval)?.Count ?? 0;

        // --- Enrollment stats ---
        var totalEnrollments = await _context.Enrollments.CountAsync(ct);

        // --- Revenue (from completed payments) ---
        var totalRevenue = await _context.Payments
            .Where(p => p.Status == PaymentStatus.Succeeded)
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;

        // --- Monthly enrollment trends (last 12 months) ---
        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);
        var monthlyEnrollments = await _context.Enrollments
            .Where(e => e.EnrolledAtUtc >= twelveMonthsAgo)
            .GroupBy(e => new { e.EnrolledAtUtc.Year, e.EnrolledAtUtc.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync(ct);

        var monthlyData = monthlyEnrollments.Select(x => new
        {
            month = $"{x.Year}-{x.Month:D2}",
            label = new DateTime(x.Year, x.Month, 1).ToString("MMM yyyy"),
            count = x.Count
        }).ToList();

        // --- Top performing courses by enrollment ---
        var topCourses = await _context.Courses
            .Include(c => c.Category)
            .OrderByDescending(c => c.EnrolledCount)
            .Take(10)
            .Select(c => new
            {
                courseId = c.Id,
                title = c.Title,
                instructorId = c.InstructorId,
                categoryName = c.Category != null ? c.Category.Name : string.Empty,
                enrolledCount = c.EnrolledCount,
                averageRating = c.AverageRating,
                totalReviews = c.TotalReviews,
                status = c.Status,
                price = c.Price,
                isFree = c.IsFree
            })
            .ToListAsync(ct);

        // Add instructor names
        var instructorUserIds = topCourses.Select(c => c.instructorId).Distinct().ToList();
        var instructorNames = new Dictionary<string, string>();
        foreach (var uid in instructorUserIds)
        {
            var u = await _userManager.FindByIdAsync(uid);
            if (u != null) instructorNames[uid] = $"{u.FirstName} {u.LastName}".Trim();
        }

        var topCoursesWithNames = topCourses.Select(c => new
        {
            c.courseId,
            c.title,
            instructorName = instructorNames.GetValueOrDefault(c.instructorId, "Unknown"),
            c.categoryName,
            c.enrolledCount,
            c.averageRating,
            c.totalReviews,
            c.status,
            c.price,
            c.isFree
        }).ToList();

        // --- Recent users (last 10) ---
        var recentUsers = await _userManager.Users
            .OrderByDescending(u => u.CreatedAtUtc)
            .Take(10)
            .ToListAsync(ct);

        var recentUsersResult = new List<object>();
        foreach (var u in recentUsers)
        {
            var roles = await _userManager.GetRolesAsync(u);
            recentUsersResult.Add(new
            {
                id = u.Id,
                email = u.Email,
                firstName = u.FirstName,
                lastName = u.LastName,
                roles = roles,
                isActive = u.IsActive,
                createdAtUtc = u.CreatedAtUtc
            });
        }

        // --- Recent transactions (last 10 completed payments) ---
        var recentPayments = await _context.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.Course)
            .Where(p => p.Status == PaymentStatus.Succeeded)
            .OrderByDescending(p => p.PaidAtUtc)
            .Take(10)
            .Select(p => new
            {
                paymentId = p.Id,
                orderId = p.OrderId,
                courseTitle = p.Order != null && p.Order.Course != null ? p.Order.Course.Title : string.Empty,
                userId = p.Order != null ? p.Order.UserId : string.Empty,
                amount = p.Amount,
                currency = p.Currency,
                paidAtUtc = p.PaidAtUtc,
                gateway = p.PaymentGateway
            })
            .ToListAsync(ct);

        // Add student names to transactions
        var transactionUserIds = recentPayments.Select(p => p.userId).Distinct().ToList();
        var transactionUserNames = new Dictionary<string, string>();
        foreach (var uid in transactionUserIds)
        {
            var u = await _userManager.FindByIdAsync(uid);
            if (u != null) transactionUserNames[uid] = $"{u.FirstName} {u.LastName}".Trim();
        }

        var recentTransactions = recentPayments.Select(p => new
        {
            p.paymentId,
            p.orderId,
            p.courseTitle,
            studentName = transactionUserNames.GetValueOrDefault(p.userId, "Unknown"),
            p.amount,
            p.currency,
            p.paidAtUtc,
            p.gateway
        }).ToList();

        return Ok(new
        {
            totalUsers,
            totalStudents,
            totalInstructors,
            totalCourses,
            publishedCourses,
            pendingCourses,
            totalEnrollments,
            totalRevenue,
            monthlyEnrollments = monthlyData,
            topCourses = topCoursesWithNames,
            recentUsers = recentUsersResult,
            recentTransactions
        });
    }
}
