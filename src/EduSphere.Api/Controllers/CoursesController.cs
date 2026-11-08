using EduSphere.Application.Common.Models;
using EduSphere.Application.Courses.Dtos;
using EduSphere.Application.Courses.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    /// <summary>
    /// Public endpoint: View published courses with pagination and filtering
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PaginatedResult<CourseSummaryDto>>> GetPublishedCourses(
        [FromQuery] CourseFilterDto filter,
        CancellationToken ct)
    {
        var result = await _courseService.GetPublishedCoursesAsync(filter, ct);
        return Ok(result);
    }

    /// <summary>
    /// Public endpoint: View published course details by ID or Slug
    /// </summary>
    [HttpGet("{idOrSlug}")]
    [AllowAnonymous]
    public async Task<ActionResult<CourseDetailDto>> GetCourseDetails(string idOrSlug, CancellationToken ct)
    {
        var course = await _courseService.GetCourseDetailsBySlugOrIdAsync(idOrSlug, ct);
        if (course == null)
        {
            return NotFound(new { message = $"Published course '{idOrSlug}' was not found." });
        }

        return Ok(course);
    }
}

