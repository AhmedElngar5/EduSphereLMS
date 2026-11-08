using EduSphere.Application.Common.Models;
using EduSphere.Application.Courses.Dtos;

namespace EduSphere.Application.Courses.Interfaces;

public interface ICourseService
{
    // Public queries
    Task<PaginatedResult<CourseSummaryDto>> GetPublishedCoursesAsync(CourseFilterDto filter, CancellationToken ct = default);
    Task<CourseDetailDto?> GetCourseDetailsBySlugOrIdAsync(string idOrSlug, CancellationToken ct = default);

    // Instructor operations
    Task<IReadOnlyList<CourseSummaryDto>> GetInstructorCoursesAsync(string instructorId, CancellationToken ct = default);
    Task<CourseDetailDto?> GetInstructorCourseByIdAsync(int id, string instructorId, CancellationToken ct = default);
    Task<CourseSummaryDto> CreateCourseAsync(CreateCourseDto dto, string instructorId, CancellationToken ct = default);
    Task<CourseSummaryDto> UpdateCourseAsync(int id, UpdateCourseDto dto, string instructorId, CancellationToken ct = default);
    Task<bool> DeleteCourseAsync(int id, string instructorId, CancellationToken ct = default);
    Task<string> UploadThumbnailAsync(int id, Stream stream, string fileName, string contentType, string instructorId, CancellationToken ct = default);
    Task<CourseApprovalStatusDto> SubmitForApprovalAsync(int id, string instructorId, CancellationToken ct = default);
    Task<CourseApprovalStatusDto?> GetApprovalStatusAsync(int id, string instructorId, CancellationToken ct = default);

    // Admin operations
    Task<PaginatedResult<CourseSummaryDto>> GetPendingCoursesAsync(int pageNumber, int pageSize, CancellationToken ct = default);
    Task<PaginatedResult<CourseSummaryDto>> GetAllCoursesForAdminAsync(int? status, int pageNumber, int pageSize, CancellationToken ct = default);
    Task<CourseDetailDto?> GetCourseForAdminByIdAsync(int id, CancellationToken ct = default);
    Task<CourseSummaryDto> ApproveCourseAsync(int id, CancellationToken ct = default);
    Task<CourseSummaryDto> RejectCourseAsync(int id, string reason, CancellationToken ct = default);
    Task<CourseSummaryDto> PublishCourseAsync(int id, CancellationToken ct = default);
    Task<CourseSummaryDto> UnpublishCourseAsync(int id, CancellationToken ct = default);
    Task<bool> AdminDeleteCourseAsync(int id, CancellationToken ct = default);
}
