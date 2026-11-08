using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Enrollments.Dtos;
using EduSphere.Application.Enrollments.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;
    private readonly ICurrentUserService _currentUserService;

    public EnrollmentsController(
        IEnrollmentService enrollmentService,
        ICurrentUserService currentUserService)
    {
        _enrollmentService = enrollmentService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    /// <summary>
    /// Enroll the authenticated student in a course
    /// </summary>
    [HttpPost("courses/{courseId:int}")]
    public async Task<ActionResult<EnrollmentDto>> Enroll(
        int courseId,
        [FromBody] EnrollCourseDto? dto,
        CancellationToken ct)
    {
        // For testing/mock checkout: if paymentMethod is provided and not free, we can simulate price payment or require order
        decimal? pricePaid = dto?.PaymentMethod?.ToLowerInvariant() == "mock_paid" ? 99.99m : null;

        var enrollment = await _enrollmentService.EnrollAsync(
            CurrentUserId,
            courseId,
            pricePaid,
            dto?.OrderId,
            ct);

        return Ok(enrollment);
    }

    /// <summary>
    /// View enrolled courses for authenticated student (supports filtering for completed courses)
    /// </summary>
    [HttpGet("my-courses")]
    public async Task<ActionResult<IReadOnlyList<EnrollmentDto>>> GetMyEnrolledCourses(
        [FromQuery] bool? completedOnly,
        CancellationToken ct)
    {
        var enrollments = await _enrollmentService.GetUserEnrollmentsAsync(
            CurrentUserId,
            completedOnly,
            ct);

        return Ok(enrollments);
    }

    /// <summary>
    /// Check current enrollment status for a specific course
    /// </summary>
    [HttpGet("courses/{courseId:int}/status")]
    public async Task<ActionResult<EnrollmentStatusDto>> GetEnrollmentStatus(
        int courseId,
        CancellationToken ct)
    {
        var status = await _enrollmentService.GetEnrollmentStatusAsync(
            CurrentUserId,
            courseId,
            ct);

        return Ok(status);
    }
}

