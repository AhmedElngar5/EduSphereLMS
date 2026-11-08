using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Reviews.Dtos;
using EduSphere.Application.Reviews.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly ICurrentUserService _currentUserService;

    public ReviewsController(
        IReviewService reviewService,
        ICurrentUserService currentUserService)
    {
        _reviewService = reviewService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    /// <summary>
    /// View reviews for a course
    /// </summary>
    [HttpGet("api/courses/{courseId:int}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ReviewDto>>> GetReviews(int courseId, CancellationToken ct)
    {
        var reviews = await _reviewService.GetCourseReviewsAsync(courseId, ct);
        return Ok(reviews);
    }

    /// <summary>
    /// Get current student's review for a course
    /// </summary>
    [HttpGet("api/courses/{courseId:int}/reviews/my-review")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> GetMyReview(int courseId, CancellationToken ct)
    {
        var review = await _reviewService.GetUserCourseReviewAsync(CurrentUserId, courseId, ct);
        if (review == null) return NotFound(new { message = "You have not reviewed this course yet." });
        return Ok(review);
    }

    /// <summary>
    /// Submit review for an enrolled course
    /// </summary>
    [HttpPost("api/courses/{courseId:int}/reviews")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> AddReview(
        int courseId,
        [FromBody] CreateReviewDto dto,
        CancellationToken ct)
    {
        var review = await _reviewService.AddReviewAsync(CurrentUserId, courseId, dto, ct);
        return Ok(review);
    }

    /// <summary>
    /// Update existing review
    /// </summary>
    [HttpPut("api/reviews/{reviewId:int}")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> UpdateReview(
        int reviewId,
        [FromBody] UpdateReviewDto dto,
        CancellationToken ct)
    {
        var review = await _reviewService.UpdateReviewAsync(CurrentUserId, reviewId, dto, ct);
        return Ok(review);
    }

    /// <summary>
    /// Delete existing review
    /// </summary>
    [HttpDelete("api/reviews/{reviewId:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(int reviewId, CancellationToken ct)
    {
        await _reviewService.DeleteReviewAsync(CurrentUserId, reviewId, ct);
        return NoContent();
    }
}

