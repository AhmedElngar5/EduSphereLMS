using EduSphere.Application.Common.Models;
using EduSphere.Application.Courses.Dtos;
using EduSphere.Application.Courses.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/admin/courses")]
[Authorize(Roles = "Admin")]
public class AdminCoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public AdminCoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<PaginatedResult<CourseSummaryDto>>> GetPendingCourses(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _courseService.GetPendingCoursesAsync(pageNumber, pageSize, ct);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<CourseSummaryDto>>> GetAllCourses(
        [FromQuery] int? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var result = await _courseService.GetAllCoursesForAdminAsync(status, pageNumber, pageSize, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseDetailDto>> GetCourseById(int id, CancellationToken ct = default)
    {
        var course = await _courseService.GetCourseForAdminByIdAsync(id, ct);
        if (course == null) return NotFound();
        return Ok(course);
    }

    [HttpPost("{id:int}/approve")]
    public async Task<ActionResult<CourseSummaryDto>> ApproveCourse(int id, CancellationToken ct)
    {
        var result = await _courseService.ApproveCourseAsync(id, ct);
        return Ok(result);
    }

    [HttpPost("{id:int}/reject")]
    public async Task<ActionResult<CourseSummaryDto>> RejectCourse(int id, [FromBody] RejectCourseDto dto, CancellationToken ct)
    {
        var result = await _courseService.RejectCourseAsync(id, dto.Reason, ct);
        return Ok(result);
    }

    [HttpPost("{id:int}/publish")]
    public async Task<ActionResult<CourseSummaryDto>> PublishCourse(int id, CancellationToken ct)
    {
        var result = await _courseService.PublishCourseAsync(id, ct);
        return Ok(result);
    }

    [HttpPost("{id:int}/unpublish")]
    public async Task<ActionResult<CourseSummaryDto>> UnpublishCourse(int id, CancellationToken ct)
    {
        var result = await _courseService.UnpublishCourseAsync(id, ct);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCourse(int id, CancellationToken ct)
    {
        await _courseService.AdminDeleteCourseAsync(id, ct);
        return NoContent();
    }
}
