using System.Text.RegularExpressions;
using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Courses.Dtos;
using EduSphere.Application.Courses.Interfaces;
using EduSphere.Application.Notifications.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class CourseService : ICourseService
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly INotificationService _notificationService;

    public CourseService(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        INotificationService notificationService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _notificationService = notificationService;
    }

    #region Public Queries

    public async Task<PaginatedResult<CourseSummaryDto>> GetPublishedCoursesAsync(CourseFilterDto filter, CancellationToken ct = default)
    {
        var query = _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Where(c => c.Status == CourseStatus.Published);

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.Trim().ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(term) ||
                c.ShortDescription.ToLower().Contains(term) ||
                c.Description.ToLower().Contains(term));
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(c => c.CategoryId == filter.CategoryId.Value);
        }

        if (filter.Level.HasValue)
        {
            query = query.Where(c => c.Level == filter.Level.Value);
        }

        if (filter.MinPrice.HasValue)
        {
            query = query.Where(c => (c.DiscountPrice ?? c.Price) >= filter.MinPrice.Value);
        }

        if (filter.MaxPrice.HasValue)
        {
            query = query.Where(c => (c.DiscountPrice ?? c.Price) <= filter.MaxPrice.Value);
        }

        if (filter.IsFree.HasValue)
        {
            query = query.Where(c => c.IsFree == filter.IsFree.Value);
        }

        if (filter.MinRating.HasValue)
        {
            query = query.Where(c => c.AverageRating >= filter.MinRating.Value);
        }

        query = filter.SortBy?.ToLowerInvariant() switch
        {
            "price_asc" => query.OrderBy(c => c.DiscountPrice ?? c.Price),
            "price_desc" => query.OrderByDescending(c => c.DiscountPrice ?? c.Price),
            "rating" => query.OrderByDescending(c => c.AverageRating),
            "popular" => query.OrderByDescending(c => c.EnrolledCount),
            _ => query.OrderByDescending(c => c.PublishedAtUtc ?? c.CreatedAtUtc)
        };

        var totalCount = await query.CountAsync(ct);
        var pageNumber = Math.Max(1, filter.PageNumber);
        var pageSize = Math.Clamp(filter.PageSize, 1, 100);

        var courses = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var instructorIds = courses.Select(c => c.InstructorId).Distinct().ToList();
        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, instructorIds, ct);

        var dtos = courses.Select(c => MapToSummaryDto(c, instructors.GetValueOrDefault(c.InstructorId))).ToList();

        return new PaginatedResult<CourseSummaryDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<CourseDetailDto?> GetCourseDetailsBySlugOrIdAsync(string idOrSlug, CancellationToken ct = default)
    {
        IQueryable<Course> query = _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.Sections.OrderBy(s => s.DisplayOrder))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.DisplayOrder))
            .Include(c => c.Resources.OrderBy(r => r.DisplayOrder));

        Course? course;
        if (int.TryParse(idOrSlug, out var id))
        {
            course = await query.FirstOrDefaultAsync(c => c.Id == id, ct);
        }
        else
        {
            course = await query.FirstOrDefaultAsync(c => c.Slug == idOrSlug, ct);
        }

        if (course == null || course.Status != CourseStatus.Published)
        {
            return null;
        }

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);

        return MapToDetailDto(course, instructors.GetValueOrDefault(course.InstructorId), isPublicView: true);
    }

    #endregion

    #region Instructor Operations

    public async Task<IReadOnlyList<CourseSummaryDto>> GetInstructorCoursesAsync(string instructorId, CancellationToken ct = default)
    {
        var courses = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Where(c => c.InstructorId == instructorId)
            .OrderByDescending(c => c.CreatedAtUtc)
            .ToListAsync(ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [instructorId], ct);

        return courses.Select(c => MapToSummaryDto(c, instructors.GetValueOrDefault(instructorId))).ToList();
    }

    public async Task<CourseDetailDto?> GetInstructorCourseByIdAsync(int id, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.Sections.OrderBy(s => s.DisplayOrder))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.DisplayOrder))
            .Include(c => c.Resources.OrderBy(r => r.DisplayOrder))
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (course == null) return null;

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You are not authorized to view this course.");
        }

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [instructorId], ct);

        return MapToDetailDto(course, instructors.GetValueOrDefault(instructorId));
    }

    public async Task<CourseSummaryDto> CreateCourseAsync(CreateCourseDto dto, string instructorId, CancellationToken ct = default)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId, ct);
        if (!categoryExists)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["CategoryId"] = [$"Category with ID {dto.CategoryId} does not exist."]
            });
        }

        var slug = await GenerateUniqueSlugAsync(dto.Title, ct);

        var course = new Course
        {
            Title = dto.Title.Trim(),
            Slug = slug,
            ShortDescription = dto.ShortDescription.Trim(),
            Description = dto.Description.Trim(),
            InstructorId = instructorId,
            CategoryId = dto.CategoryId,
            Level = dto.Level,
            Status = CourseStatus.Draft,
            Price = dto.IsFree ? 0 : dto.Price,
            DiscountPrice = dto.IsFree ? null : dto.DiscountPrice,
            DiscountExpiresAtUtc = dto.DiscountExpiresAtUtc,
            IsFree = dto.IsFree,
            Language = dto.Language ?? "English",
            Requirements = dto.Requirements,
            WhatYouWillLearn = dto.WhatYouWillLearn,
            WhoIsThisFor = dto.WhoIsThisFor,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync(ct);

        var category = await _context.Categories.FindAsync([course.CategoryId], ct);
        course.Category = category!;

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [instructorId], ct);

        return MapToSummaryDto(course, instructors.GetValueOrDefault(instructorId));
    }

    public async Task<CourseSummaryDto> UpdateCourseAsync(int id, UpdateCourseDto dto, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only modify your own courses.");
        }

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId, ct);
        if (!categoryExists)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["CategoryId"] = [$"Category with ID {dto.CategoryId} does not exist."]
            });
        }

        if (!string.Equals(course.Title, dto.Title.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            course.Slug = await GenerateUniqueSlugAsync(dto.Title, ct, course.Id);
        }

        course.Title = dto.Title.Trim();
        course.ShortDescription = dto.ShortDescription.Trim();
        course.Description = dto.Description.Trim();
        course.CategoryId = dto.CategoryId;
        course.Level = dto.Level;
        course.Price = dto.IsFree ? 0 : dto.Price;
        course.DiscountPrice = dto.IsFree ? null : dto.DiscountPrice;
        course.DiscountExpiresAtUtc = dto.DiscountExpiresAtUtc;
        course.IsFree = dto.IsFree;
        course.Language = dto.Language;
        course.Requirements = dto.Requirements;
        course.WhatYouWillLearn = dto.WhatYouWillLearn;
        course.WhoIsThisFor = dto.WhoIsThisFor;
        course.LastModifiedAtUtc = DateTime.UtcNow;

        if (course.Status == CourseStatus.Rejected)
        {
            course.Status = CourseStatus.Draft;
        }

        await _context.SaveChangesAsync(ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [instructorId], ct);

        return MapToSummaryDto(course, instructors.GetValueOrDefault(instructorId));
    }

    public async Task<bool> DeleteCourseAsync(int id, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .Include(c => c.Resources)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only delete your own courses.");
        }

        if (course.Status != CourseStatus.Draft && course.Status != CourseStatus.Rejected)
        {
            throw new InvalidOperationException($"Cannot delete course with status '{course.Status}'. Only Draft or Rejected courses can be deleted by instructors.");
        }

        if (!string.IsNullOrEmpty(course.ThumbnailUrl))
        {
            await _fileStorageService.DeleteFileAsync(course.ThumbnailUrl, ct);
        }

        foreach (var resource in course.Resources.Where(r => !string.IsNullOrEmpty(r.FileUrl)))
        {
            await _fileStorageService.DeleteFileAsync(resource.FileUrl!, ct);
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<string> UploadThumbnailAsync(int id, Stream stream, string fileName, string contentType, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only upload thumbnails for your own courses.");
        }

        if (!string.IsNullOrEmpty(course.ThumbnailUrl))
        {
            await _fileStorageService.DeleteFileAsync(course.ThumbnailUrl, ct);
        }

        var result = await _fileStorageService.SaveFileAsync(stream, fileName, contentType, FileCategory.Thumbnail, ct);
        course.ThumbnailUrl = result.RelativeUrl;
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return result.RelativeUrl;
    }

    public async Task<CourseApprovalStatusDto> SubmitForApprovalAsync(int id, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only submit your own courses for approval.");
        }

        if (course.Sections.Count == 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Sections"] = ["Course must contain at least one section before submission."]
            });
        }

        var totalLessons = course.Sections.SelectMany(s => s.Lessons).Count();
        if (totalLessons == 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Lessons"] = ["Course must contain at least one lesson before submission."]
            });
        }

        course.Status = CourseStatus.PendingApproval;
        course.RejectionReason = null;
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return new CourseApprovalStatusDto
        {
            CourseId = course.Id,
            Title = course.Title,
            Status = course.Status,
            RejectionReason = null,
            PublishedAtUtc = course.PublishedAtUtc,
            LastModifiedAtUtc = course.LastModifiedAtUtc
        };
    }

    public async Task<CourseApprovalStatusDto?> GetApprovalStatusAsync(int id, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);
        if (course == null) return null;

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only check status of your own courses.");
        }

        return new CourseApprovalStatusDto
        {
            CourseId = course.Id,
            Title = course.Title,
            Status = course.Status,
            RejectionReason = course.RejectionReason,
            PublishedAtUtc = course.PublishedAtUtc,
            LastModifiedAtUtc = course.LastModifiedAtUtc
        };
    }

    #endregion

    #region Admin Operations

    public async Task<PaginatedResult<CourseSummaryDto>> GetPendingCoursesAsync(int pageNumber, int pageSize, CancellationToken ct = default)
    {
        return await GetAllCoursesForAdminAsync((int)CourseStatus.PendingApproval, pageNumber, pageSize, ct);
    }

    public async Task<PaginatedResult<CourseSummaryDto>> GetAllCoursesForAdminAsync(int? status, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .AsQueryable();

        if (status.HasValue)
        {
            var st = (CourseStatus)status.Value;
            query = query.Where(c => c.Status == st);
        }

        query = query.OrderByDescending(c => c.CreatedAtUtc);

        var totalCount = await query.CountAsync(ct);
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var courses = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var instructorIds = courses.Select(c => c.InstructorId).Distinct().ToList();
        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, instructorIds, ct);

        var dtos = courses.Select(c => MapToSummaryDto(c, instructors.GetValueOrDefault(c.InstructorId))).ToList();

        return new PaginatedResult<CourseSummaryDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<CourseDetailDto?> GetCourseForAdminByIdAsync(int id, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Category)
            .Include(c => c.Sections.OrderBy(s => s.DisplayOrder))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.DisplayOrder))
            .Include(c => c.Resources.OrderBy(r => r.DisplayOrder))
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (course == null) return null;

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);

        return MapToDetailDto(course, instructors.GetValueOrDefault(course.InstructorId), isPublicView: true);
    }

    public async Task<CourseSummaryDto> ApproveCourseAsync(int id, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        course.Status = CourseStatus.Approved;
        course.RejectionReason = null;
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _notificationService.CreateNotificationAsync(
            course.InstructorId,
            NotificationType.CourseApproved,
            "Course Approved",
            $"Great news! Your course '{course.Title}' has been approved and is ready to be published.",
            actionUrl: $"/instructor/courses/{course.Id}",
            ct: ct);

        await _context.SaveChangesAsync(ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);

        return MapToSummaryDto(course, instructors.GetValueOrDefault(course.InstructorId));
    }

    public async Task<CourseSummaryDto> RejectCourseAsync(int id, string reason, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["Reason"] = ["A rejection reason must be provided."]
            });
        }

        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        course.Status = CourseStatus.Rejected;
        course.RejectionReason = reason.Trim();
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _notificationService.CreateNotificationAsync(
            course.InstructorId,
            NotificationType.CourseRejected,
            "Course Review Feedback",
            $"Your course '{course.Title}' requires modifications: {reason.Trim()}",
            actionUrl: $"/instructor/courses/{course.Id}",
            ct: ct);

        await _context.SaveChangesAsync(ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);

        return MapToSummaryDto(course, instructors.GetValueOrDefault(course.InstructorId));
    }

    public async Task<CourseSummaryDto> PublishCourseAsync(int id, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        if (course.Status != CourseStatus.Approved && course.Status != CourseStatus.PendingApproval)
        {
            throw new InvalidOperationException($"Cannot publish a course in '{course.Status}' status. It must be Approved first.");
        }

        course.Status = CourseStatus.Published;
        course.PublishedAtUtc = DateTime.UtcNow;
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);

        return MapToSummaryDto(course, instructors.GetValueOrDefault(course.InstructorId));
    }

    public async Task<CourseSummaryDto> UnpublishCourseAsync(int id, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        course.Status = CourseStatus.Approved;
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);

        return MapToSummaryDto(course, instructors.GetValueOrDefault(course.InstructorId));
    }

    public async Task<bool> AdminDeleteCourseAsync(int id, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .Include(c => c.Resources)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException(nameof(Course), id);

        if (!string.IsNullOrEmpty(course.ThumbnailUrl))
        {
            await _fileStorageService.DeleteFileAsync(course.ThumbnailUrl, ct);
        }

        foreach (var resource in course.Resources.Where(r => !string.IsNullOrEmpty(r.FileUrl)))
        {
            await _fileStorageService.DeleteFileAsync(resource.FileUrl!, ct);
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    #endregion

    #region Helpers

    private async Task<string> GenerateUniqueSlugAsync(string title, CancellationToken ct, int? currentCourseId = null)
    {
        var baseSlug = Regex.Replace(title.ToLowerInvariant(), @"[^a-z0-9\s-]", "");
        baseSlug = Regex.Replace(baseSlug, @"\s+", " ").Trim();
        baseSlug = baseSlug.Replace(" ", "-");

        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "course";
        }

        var slug = baseSlug;
        var suffix = 1;

        while (await _context.Courses.AnyAsync(c => c.Slug == slug && (!currentCourseId.HasValue || c.Id != currentCourseId.Value), ct))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }

    private static CourseSummaryDto MapToSummaryDto(Course c, InstructorProfile? instructor)
    {
        return new CourseSummaryDto
        {
            Id = c.Id,
            Title = c.Title,
            Slug = c.Slug,
            ShortDescription = c.ShortDescription,
            InstructorId = c.InstructorId,
            InstructorName = instructor?.FullName ?? "Instructor",
            InstructorTitle = instructor?.Headline,
            InstructorPictureUrl = instructor?.ProfilePictureUrl,
            CategoryId = c.CategoryId,
            CategoryName = c.Category?.Name ?? string.Empty,
            Level = c.Level,
            Status = c.Status,
            Language = c.Language,
            ThumbnailUrl = c.ThumbnailUrl,
            Price = c.Price,
            DiscountPrice = c.DiscountPrice,
            IsFree = c.IsFree,
            TotalDurationSeconds = c.TotalDurationSeconds,
            TotalLessons = c.TotalLessons,
            EnrolledCount = c.EnrolledCount,
            AverageRating = c.AverageRating,
            TotalReviews = c.TotalReviews,
            PublishedAtUtc = c.PublishedAtUtc,
            CreatedAtUtc = c.CreatedAtUtc
        };
    }

    private static CourseDetailDto MapToDetailDto(Course c, InstructorProfile? instructor, bool isPublicView = false)
    {
        return new CourseDetailDto
        {
            Id = c.Id,
            Title = c.Title,
            Slug = c.Slug,
            ShortDescription = c.ShortDescription,
            Description = c.Description,
            InstructorId = c.InstructorId,
            InstructorName = instructor?.FullName ?? "Instructor",
            InstructorTitle = instructor?.Headline,
            InstructorPictureUrl = instructor?.ProfilePictureUrl,
            CategoryId = c.CategoryId,
            CategoryName = c.Category?.Name ?? string.Empty,
            Level = c.Level,
            Status = c.Status,
            Language = c.Language,
            ThumbnailUrl = c.ThumbnailUrl,
            PreviewVideoUrl = c.PreviewVideoUrl,
            Price = c.Price,
            DiscountPrice = c.DiscountPrice,
            IsFree = c.IsFree,
            TotalDurationSeconds = c.TotalDurationSeconds,
            TotalLessons = c.TotalLessons,
            EnrolledCount = c.EnrolledCount,
            AverageRating = c.AverageRating,
            TotalReviews = c.TotalReviews,
            PublishedAtUtc = c.PublishedAtUtc,
            CreatedAtUtc = c.CreatedAtUtc,
            Requirements = c.Requirements,
            WhatYouWillLearn = c.WhatYouWillLearn,
            WhoIsThisFor = c.WhoIsThisFor,
            RejectionReason = c.RejectionReason,
            Sections = c.Sections.Select(s => new SectionDto
            {
                Id = s.Id,
                CourseId = s.CourseId,
                Title = s.Title,
                Description = s.Description,
                DisplayOrder = s.DisplayOrder,
                Lessons = s.Lessons.Select(l => new LessonDto
                {
                    Id = l.Id,
                    SectionId = l.SectionId,
                    Title = l.Title,
                    Description = l.Description,
                    Type = l.Type,
                    DisplayOrder = l.DisplayOrder,
                    IsPreviewFree = l.IsPreviewFree,
                    DurationSeconds = l.DurationSeconds,
                    VideoUrl = (!isPublicView || l.IsPreviewFree) ? l.VideoUrl : null,
                    VideoThumbnailUrl = l.VideoThumbnailUrl,
                    ContentHtml = (!isPublicView || l.IsPreviewFree) ? l.ContentHtml : null
                }).ToList()
            }).ToList(),
            Resources = c.Resources.Select(r => new CourseResourceDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                LessonId = r.LessonId,
                Title = r.Title,
                Type = r.Type,
                FileUrl = !isPublicView ? r.FileUrl : null,
                ExternalUrl = r.ExternalUrl,
                FileExtension = r.FileExtension,
                FileSizeBytes = r.FileSizeBytes,
                DisplayOrder = r.DisplayOrder
            }).ToList()
        };
    }

    #endregion
}

public record InstructorProfile(string Id, string FullName, string? Headline, string? ProfilePictureUrl);

public static class InstructorQueryExtensions
{
    public static async Task<Dictionary<string, InstructorProfile>> QueryInstructorsAsync(
        this System.Data.Common.DbConnection connection,
        IApplicationDbContext context,
        IReadOnlyList<string> instructorIds,
        CancellationToken ct)
    {
        if (instructorIds.Count == 0) return new();

        var query = context.Database.SqlQueryRaw<InstructorQueryRaw>(
            "SELECT Id, FirstName, LastName, Headline, ProfilePictureUrl FROM Users");

        var all = await query.ToListAsync(ct);
        return all
            .Where(u => instructorIds.Contains(u.Id))
            .ToDictionary(
                u => u.Id,
                u => new InstructorProfile(u.Id, $"{u.FirstName} {u.LastName}".Trim(), u.Headline, u.ProfilePictureUrl));
    }
}

public class InstructorQueryRaw
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Headline { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
