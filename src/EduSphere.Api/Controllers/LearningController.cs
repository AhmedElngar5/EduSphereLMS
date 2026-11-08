using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Learning.Dtos;
using EduSphere.Application.Learning.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LearningController : ControllerBase
{
    private readonly ILearningService _learningService;
    private readonly ICurrentUserService _currentUserService;

    public LearningController(
        ILearningService learningService,
        ICurrentUserService currentUserService)
    {
        _learningService = learningService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    /// <summary>
    /// Access enrolled lesson details, content HTML, and video stream link
    /// </summary>
    [HttpGet("courses/{courseId:int}/lessons/{lessonId:int}")]
    public async Task<ActionResult<StudentLessonDetailDto>> GetLesson(
        int courseId,
        int lessonId,
        CancellationToken ct)
    {
        var lesson = await _learningService.GetLessonDetailsAsync(
            CurrentUserId,
            courseId,
            lessonId,
            ct);

        return Ok(lesson);
    }

    /// <summary>
    /// Update video watched position and completion status
    /// </summary>
    [HttpPost("lessons/{lessonId:int}/progress")]
    public async Task<ActionResult<LessonProgressItemDto>> UpdateProgress(
        int lessonId,
        [FromBody] UpdateLessonProgressDto dto,
        CancellationToken ct)
    {
        var progress = await _learningService.UpdateLessonProgressAsync(
            CurrentUserId,
            lessonId,
            dto,
            ct);

        return Ok(progress);
    }

    /// <summary>
    /// Mark lesson as completed directly
    /// </summary>
    [HttpPost("lessons/{lessonId:int}/complete")]
    public async Task<ActionResult<LessonProgressItemDto>> CompleteLesson(
        int lessonId,
        CancellationToken ct)
    {
        var progress = await _learningService.CompleteLessonAsync(
            CurrentUserId,
            lessonId,
            ct);

        return Ok(progress);
    }

    /// <summary>
    /// Get course learning progress for student
    /// </summary>
    [HttpGet("courses/{courseId:int}/progress")]
    public async Task<ActionResult<CourseLearningProgressDto>> GetCourseProgress(
        int courseId,
        CancellationToken ct)
    {
        var progress = await _learningService.GetCourseProgressAsync(
            CurrentUserId,
            courseId,
            ct);

        return Ok(progress);
    }

    /// <summary>
    /// Continue learning from last watched or next uncompleted lesson
    /// </summary>
    [HttpGet("courses/{courseId:int}/continue")]
    public async Task<ActionResult<ContinueLearningDto>> ContinueLearning(
        int courseId,
        CancellationToken ct)
    {
        var next = await _learningService.GetContinueLearningAsync(
            CurrentUserId,
            courseId,
            ct);

        return Ok(next);
    }

    /// <summary>
    /// Stream video file securely with Range header (HTTP 206 Partial Content) support
    /// </summary>
    [HttpGet("lessons/{lessonId:int}/video-stream")]
    public async Task<IActionResult> StreamVideo(int lessonId, CancellationToken ct)
    {
        var (stream, contentType, fileName) = await _learningService.GetVideoStreamAsync(
            CurrentUserId,
            lessonId,
            ct);

        return File(stream, contentType, enableRangeProcessing: true);
    }

    /// <summary>
    /// Download course resource securely with active enrollment check
    /// </summary>
    [HttpGet("resources/{resourceId:int}/download")]
    public async Task<IActionResult> DownloadResource(int resourceId, CancellationToken ct)
    {
        var (stream, contentType, fileName) = await _learningService.GetResourceFileAsync(
            CurrentUserId,
            resourceId,
            ct);

        return File(stream, contentType, fileName);
    }
}

