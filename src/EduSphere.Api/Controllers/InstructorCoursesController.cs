using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Courses.Dtos;
using EduSphere.Application.Courses.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/instructor")]
[Authorize(Roles = "Instructor,Admin")]
public class InstructorCoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly ISectionLessonService _sectionLessonService;
    private readonly ICurrentUserService _currentUserService;

    public InstructorCoursesController(
        ICourseService courseService,
        ISectionLessonService sectionLessonService,
        ICurrentUserService currentUserService)
    {
        _courseService = courseService;
        _sectionLessonService = sectionLessonService;
        _currentUserService = currentUserService;
    }

    private string CurrentInstructorId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("Current user is not authenticated.");

    #region Course CRUD & Workflow

    [HttpGet("courses")]
    public async Task<ActionResult<IReadOnlyList<CourseSummaryDto>>> GetMyCourses(CancellationToken ct)
    {
        var courses = await _courseService.GetInstructorCoursesAsync(CurrentInstructorId, ct);
        return Ok(courses);
    }

    [HttpGet("courses/{id:int}")]
    public async Task<ActionResult<CourseDetailDto>> GetMyCourseById(int id, CancellationToken ct)
    {
        var course = await _courseService.GetInstructorCourseByIdAsync(id, CurrentInstructorId, ct);
        if (course == null) return NotFound();
        return Ok(course);
    }

    [HttpPost("courses")]
    public async Task<ActionResult<CourseSummaryDto>> CreateCourse([FromBody] CreateCourseDto dto, CancellationToken ct)
    {
        var course = await _courseService.CreateCourseAsync(dto, CurrentInstructorId, ct);
        return CreatedAtAction(nameof(GetMyCourseById), new { id = course.Id }, course);
    }

    [HttpPut("courses/{id:int}")]
    public async Task<ActionResult<CourseSummaryDto>> UpdateCourse(int id, [FromBody] UpdateCourseDto dto, CancellationToken ct)
    {
        var updated = await _courseService.UpdateCourseAsync(id, dto, CurrentInstructorId, ct);
        return Ok(updated);
    }

    [HttpDelete("courses/{id:int}")]
    public async Task<IActionResult> DeleteCourse(int id, CancellationToken ct)
    {
        await _courseService.DeleteCourseAsync(id, CurrentInstructorId, ct);
        return NoContent();
    }

    [HttpPost("courses/{id:int}/thumbnail")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<object>> UploadThumbnail(int id, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { errors = new[] { "No thumbnail file was provided." } });
        }

        using var stream = file.OpenReadStream();
        var url = await _courseService.UploadThumbnailAsync(id, stream, file.FileName, file.ContentType, CurrentInstructorId, ct);
        return Ok(new { thumbnailUrl = url });
    }

    [HttpPost("courses/{id:int}/submit-approval")]
    public async Task<ActionResult<CourseApprovalStatusDto>> SubmitForApproval(int id, CancellationToken ct)
    {
        var status = await _courseService.SubmitForApprovalAsync(id, CurrentInstructorId, ct);
        return Ok(status);
    }

    [HttpGet("courses/{id:int}/approval-status")]
    public async Task<ActionResult<CourseApprovalStatusDto>> GetApprovalStatus(int id, CancellationToken ct)
    {
        var status = await _courseService.GetApprovalStatusAsync(id, CurrentInstructorId, ct);
        if (status == null) return NotFound();
        return Ok(status);
    }

    #endregion

    #region Sections Management

    [HttpPost("courses/{courseId:int}/sections")]
    public async Task<ActionResult<SectionDto>> AddSection(int courseId, [FromBody] CreateSectionDto dto, CancellationToken ct)
    {
        var section = await _sectionLessonService.CreateSectionAsync(courseId, dto, CurrentInstructorId, ct);
        return Ok(section);
    }

    [HttpPut("sections/{sectionId:int}")]
    public async Task<ActionResult<SectionDto>> UpdateSection(int sectionId, [FromBody] UpdateSectionDto dto, CancellationToken ct)
    {
        var section = await _sectionLessonService.UpdateSectionAsync(sectionId, dto, CurrentInstructorId, ct);
        return Ok(section);
    }

    [HttpDelete("sections/{sectionId:int}")]
    public async Task<IActionResult> DeleteSection(int sectionId, CancellationToken ct)
    {
        await _sectionLessonService.DeleteSectionAsync(sectionId, CurrentInstructorId, ct);
        return NoContent();
    }

    [HttpPut("courses/{courseId:int}/sections/reorder")]
    public async Task<IActionResult> ReorderSections(int courseId, [FromBody] IReadOnlyList<ReorderItemDto> items, CancellationToken ct)
    {
        await _sectionLessonService.ReorderSectionsAsync(courseId, items, CurrentInstructorId, ct);
        return NoContent();
    }

    #endregion

    #region Lessons Management

    [HttpPost("sections/{sectionId:int}/lessons")]
    public async Task<ActionResult<LessonDto>> AddLesson(int sectionId, [FromBody] CreateLessonDto dto, CancellationToken ct)
    {
        var lesson = await _sectionLessonService.CreateLessonAsync(sectionId, dto, CurrentInstructorId, ct);
        return Ok(lesson);
    }

    [HttpPut("lessons/{lessonId:int}")]
    public async Task<ActionResult<LessonDto>> UpdateLesson(int lessonId, [FromBody] UpdateLessonDto dto, CancellationToken ct)
    {
        var lesson = await _sectionLessonService.UpdateLessonAsync(lessonId, dto, CurrentInstructorId, ct);
        return Ok(lesson);
    }

    [HttpDelete("lessons/{lessonId:int}")]
    public async Task<IActionResult> DeleteLesson(int lessonId, CancellationToken ct)
    {
        await _sectionLessonService.DeleteLessonAsync(lessonId, CurrentInstructorId, ct);
        return NoContent();
    }

    [HttpPost("lessons/{lessonId:int}/video")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<LessonDto>> UploadVideo(int lessonId, IFormFile file, [FromForm] int? durationSeconds, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { errors = new[] { "No video file was provided." } });
        }

        using var stream = file.OpenReadStream();
        var lesson = await _sectionLessonService.UploadLessonVideoAsync(
            lessonId,
            stream,
            file.FileName,
            file.ContentType,
            durationSeconds,
            CurrentInstructorId,
            ct);

        return Ok(lesson);
    }

    [HttpPut("sections/{sectionId:int}/lessons/reorder")]
    public async Task<IActionResult> ReorderLessons(int sectionId, [FromBody] IReadOnlyList<ReorderItemDto> items, CancellationToken ct)
    {
        await _sectionLessonService.ReorderLessonsAsync(sectionId, items, CurrentInstructorId, ct);
        return NoContent();
    }

    #endregion

    #region Resources Management

    [HttpPost("courses/{courseId:int}/resources")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CourseResourceDto>> UploadCourseResource(
        int courseId,
        [FromForm] string title,
        [FromForm] int type,
        [FromForm] string? externalUrl,
        IFormFile? file,
        CancellationToken ct)
    {
        Stream? stream = null;
        if (file != null && file.Length > 0)
        {
            stream = file.OpenReadStream();
        }

        var dto = new CreateCourseResourceDto
        {
            Title = title,
            Type = (Domain.Enums.ResourceType)type,
            ExternalUrl = externalUrl
        };

        var resource = await _sectionLessonService.UploadCourseResourceAsync(
            courseId,
            null,
            dto,
            stream,
            file?.FileName,
            file?.ContentType,
            CurrentInstructorId,
            ct);

        return Ok(resource);
    }

    [HttpPost("lessons/{lessonId:int}/resources")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CourseResourceDto>> UploadLessonResource(
        int lessonId,
        [FromForm] int courseId,
        [FromForm] string title,
        [FromForm] int type,
        [FromForm] string? externalUrl,
        IFormFile? file,
        CancellationToken ct)
    {
        Stream? stream = null;
        if (file != null && file.Length > 0)
        {
            stream = file.OpenReadStream();
        }

        var dto = new CreateCourseResourceDto
        {
            Title = title,
            Type = (Domain.Enums.ResourceType)type,
            ExternalUrl = externalUrl
        };

        var resource = await _sectionLessonService.UploadCourseResourceAsync(
            courseId,
            lessonId,
            dto,
            stream,
            file?.FileName,
            file?.ContentType,
            CurrentInstructorId,
            ct);

        return Ok(resource);
    }

    [HttpDelete("resources/{resourceId:int}")]
    public async Task<IActionResult> DeleteResource(int resourceId, CancellationToken ct)
    {
        await _sectionLessonService.DeleteResourceAsync(resourceId, CurrentInstructorId, ct);
        return NoContent();
    }

    #endregion
}

