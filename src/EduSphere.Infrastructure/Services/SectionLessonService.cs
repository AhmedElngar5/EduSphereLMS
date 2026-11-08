using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Courses.Dtos;
using EduSphere.Application.Courses.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class SectionLessonService : ISectionLessonService
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;

    public SectionLessonService(IApplicationDbContext context, IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    #region Section Management

    public async Task<SectionDto> CreateSectionAsync(int courseId, CreateSectionDto dto, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only add sections to your own courses.");
        }

        var displayOrder = dto.DisplayOrder > 0
            ? dto.DisplayOrder
            : (course.Sections.Any() ? course.Sections.Max(s => s.DisplayOrder) + 1 : 1);

        var section = new Section
        {
            CourseId = courseId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            DisplayOrder = displayOrder,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Sections.Add(section);
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return new SectionDto
        {
            Id = section.Id,
            CourseId = section.CourseId,
            Title = section.Title,
            Description = section.Description,
            DisplayOrder = section.DisplayOrder,
            Lessons = Array.Empty<LessonDto>()
        };
    }

    public async Task<SectionDto> UpdateSectionAsync(int sectionId, UpdateSectionDto dto, string instructorId, CancellationToken ct = default)
    {
        var section = await _context.Sections
            .Include(s => s.Course)
            .Include(s => s.Lessons.OrderBy(l => l.DisplayOrder))
            .FirstOrDefaultAsync(s => s.Id == sectionId, ct)
            ?? throw new NotFoundException(nameof(Section), sectionId);

        if (section.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only modify sections of your own courses.");
        }

        section.Title = dto.Title.Trim();
        section.Description = dto.Description?.Trim();
        if (dto.DisplayOrder > 0)
        {
            section.DisplayOrder = dto.DisplayOrder;
        }
        section.LastModifiedAtUtc = DateTime.UtcNow;
        section.Course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return new SectionDto
        {
            Id = section.Id,
            CourseId = section.CourseId,
            Title = section.Title,
            Description = section.Description,
            DisplayOrder = section.DisplayOrder,
            Lessons = section.Lessons.Select(MapToLessonDto).ToList()
        };
    }

    public async Task<bool> DeleteSectionAsync(int sectionId, string instructorId, CancellationToken ct = default)
    {
        var section = await _context.Sections
            .Include(s => s.Course)
            .Include(s => s.Lessons)
            .FirstOrDefaultAsync(s => s.Id == sectionId, ct)
            ?? throw new NotFoundException(nameof(Section), sectionId);

        if (section.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only delete sections of your own courses.");
        }

        foreach (var lesson in section.Lessons.Where(l => !string.IsNullOrEmpty(l.VideoUrl)))
        {
            await _fileStorageService.DeleteFileAsync(lesson.VideoUrl!, ct);
        }

        _context.Sections.Remove(section);
        await _context.SaveChangesAsync(ct);

        await RecalculateCourseTotalsAsync(section.CourseId, ct);
        return true;
    }

    public async Task<bool> ReorderSectionsAsync(int courseId, IReadOnlyList<ReorderItemDto> items, string instructorId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only reorder sections in your own courses.");
        }

        var sectionMap = course.Sections.ToDictionary(s => s.Id);
        foreach (var item in items)
        {
            if (sectionMap.TryGetValue(item.Id, out var section))
            {
                section.DisplayOrder = item.NewOrder;
                section.LastModifiedAtUtc = DateTime.UtcNow;
            }
        }

        course.LastModifiedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
        return true;
    }

    #endregion

    #region Lesson Management

    public async Task<LessonDto> CreateLessonAsync(int sectionId, CreateLessonDto dto, string instructorId, CancellationToken ct = default)
    {
        var section = await _context.Sections
            .Include(s => s.Course)
            .Include(s => s.Lessons)
            .FirstOrDefaultAsync(s => s.Id == sectionId, ct)
            ?? throw new NotFoundException(nameof(Section), sectionId);

        if (section.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only add lessons to your own courses.");
        }

        var displayOrder = dto.DisplayOrder > 0
            ? dto.DisplayOrder
            : (section.Lessons.Any() ? section.Lessons.Max(l => l.DisplayOrder) + 1 : 1);

        var lesson = new Lesson
        {
            SectionId = sectionId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Type = dto.Type,
            DisplayOrder = displayOrder,
            IsPreviewFree = dto.IsPreviewFree,
            ContentHtml = dto.ContentHtml,
            VideoUrl = dto.VideoUrl,
            DurationSeconds = dto.DurationSeconds,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Lessons.Add(lesson);
        section.Course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        await RecalculateCourseTotalsAsync(section.CourseId, ct);

        return MapToLessonDto(lesson);
    }

    public async Task<LessonDto> UpdateLessonAsync(int lessonId, UpdateLessonDto dto, string instructorId, CancellationToken ct = default)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Section)
                .ThenInclude(s => s.Course)
            .Include(l => l.Resources)
            .FirstOrDefaultAsync(l => l.Id == lessonId, ct)
            ?? throw new NotFoundException(nameof(Lesson), lessonId);

        if (lesson.Section.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only modify lessons in your own courses.");
        }

        lesson.Title = dto.Title.Trim();
        lesson.Description = dto.Description?.Trim();
        lesson.Type = dto.Type;
        if (dto.DisplayOrder > 0)
        {
            lesson.DisplayOrder = dto.DisplayOrder;
        }
        lesson.IsPreviewFree = dto.IsPreviewFree;
        lesson.ContentHtml = dto.ContentHtml;
        if (!string.IsNullOrEmpty(dto.VideoUrl))
        {
            lesson.VideoUrl = dto.VideoUrl;
        }
        if (dto.DurationSeconds.HasValue)
        {
            lesson.DurationSeconds = dto.DurationSeconds;
        }
        lesson.LastModifiedAtUtc = DateTime.UtcNow;
        lesson.Section.Course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        await RecalculateCourseTotalsAsync(lesson.Section.CourseId, ct);

        return MapToLessonDto(lesson);
    }

    public async Task<bool> DeleteLessonAsync(int lessonId, string instructorId, CancellationToken ct = default)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Section)
                .ThenInclude(s => s.Course)
            .Include(l => l.Resources)
            .FirstOrDefaultAsync(l => l.Id == lessonId, ct)
            ?? throw new NotFoundException(nameof(Lesson), lessonId);

        if (lesson.Section.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only delete lessons in your own courses.");
        }

        var courseId = lesson.Section.CourseId;

        if (!string.IsNullOrEmpty(lesson.VideoUrl))
        {
            await _fileStorageService.DeleteFileAsync(lesson.VideoUrl, ct);
        }

        foreach (var resource in lesson.Resources.Where(r => !string.IsNullOrEmpty(r.FileUrl)))
        {
            await _fileStorageService.DeleteFileAsync(resource.FileUrl!, ct);
        }

        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync(ct);

        await RecalculateCourseTotalsAsync(courseId, ct);
        return true;
    }

    public async Task<LessonDto> UploadLessonVideoAsync(int lessonId, Stream stream, string fileName, string contentType, int? durationSeconds, string instructorId, CancellationToken ct = default)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Section)
                .ThenInclude(s => s.Course)
            .Include(l => l.Resources)
            .FirstOrDefaultAsync(l => l.Id == lessonId, ct)
            ?? throw new NotFoundException(nameof(Lesson), lessonId);

        if (lesson.Section.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only upload videos to your own lessons.");
        }

        if (!string.IsNullOrEmpty(lesson.VideoUrl))
        {
            await _fileStorageService.DeleteFileAsync(lesson.VideoUrl, ct);
        }

        var result = await _fileStorageService.SaveFileAsync(stream, fileName, contentType, FileCategory.Video, ct);

        lesson.VideoUrl = result.RelativeUrl;
        lesson.VideoStorageKey = result.StorageKey;
        lesson.VideoProvider = "LocalDisk";
        lesson.VideoFileSizeBytes = result.FileSizeBytes;
        lesson.Type = LessonType.Video;
        if (durationSeconds.HasValue && durationSeconds.Value > 0)
        {
            lesson.DurationSeconds = durationSeconds.Value;
        }
        lesson.LastModifiedAtUtc = DateTime.UtcNow;
        lesson.Section.Course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        await RecalculateCourseTotalsAsync(lesson.Section.CourseId, ct);

        return MapToLessonDto(lesson);
    }

    public async Task<bool> ReorderLessonsAsync(int sectionId, IReadOnlyList<ReorderItemDto> items, string instructorId, CancellationToken ct = default)
    {
        var section = await _context.Sections
            .Include(s => s.Course)
            .Include(s => s.Lessons)
            .FirstOrDefaultAsync(s => s.Id == sectionId, ct)
            ?? throw new NotFoundException(nameof(Section), sectionId);

        if (section.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only reorder lessons in your own courses.");
        }

        var lessonMap = section.Lessons.ToDictionary(l => l.Id);
        foreach (var item in items)
        {
            if (lessonMap.TryGetValue(item.Id, out var lesson))
            {
                lesson.DisplayOrder = item.NewOrder;
                lesson.LastModifiedAtUtc = DateTime.UtcNow;
            }
        }

        section.Course.LastModifiedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);
        return true;
    }

    #endregion

    #region Resource Management

    public async Task<CourseResourceDto> UploadCourseResourceAsync(
        int courseId,
        int? lessonId,
        CreateCourseResourceDto dto,
        Stream? stream,
        string? fileName,
        string? contentType,
        string instructorId,
        CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Resources)
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        if (course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only attach resources to your own courses.");
        }

        if (lessonId.HasValue)
        {
            var lessonExists = await _context.Lessons.AnyAsync(l => l.Id == lessonId.Value && l.Section.CourseId == courseId, ct);
            if (!lessonExists)
            {
                throw new NotFoundException(nameof(Lesson), lessonId.Value);
            }
        }

        string? fileUrl = null;
        string? storageKey = null;
        string? extension = null;
        long? sizeBytes = null;

        if (stream != null && !string.IsNullOrEmpty(fileName))
        {
            var upload = await _fileStorageService.SaveFileAsync(stream, fileName, contentType ?? "application/octet-stream", FileCategory.Resource, ct);
            fileUrl = upload.RelativeUrl;
            storageKey = upload.StorageKey;
            extension = upload.FileExtension;
            sizeBytes = upload.FileSizeBytes;
        }

        var resource = new CourseResource
        {
            CourseId = courseId,
            LessonId = lessonId,
            Title = dto.Title.Trim(),
            Type = dto.Type,
            FileUrl = fileUrl,
            FileStorageKey = storageKey,
            ExternalUrl = dto.ExternalUrl,
            FileExtension = extension,
            FileSizeBytes = sizeBytes,
            DisplayOrder = course.Resources.Any() ? course.Resources.Max(r => r.DisplayOrder) + 1 : 1,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.CourseResources.Add(resource);
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return new CourseResourceDto
        {
            Id = resource.Id,
            CourseId = resource.CourseId,
            LessonId = resource.LessonId,
            Title = resource.Title,
            Type = resource.Type,
            FileUrl = resource.FileUrl,
            ExternalUrl = resource.ExternalUrl,
            FileExtension = resource.FileExtension,
            FileSizeBytes = resource.FileSizeBytes,
            DisplayOrder = resource.DisplayOrder
        };
    }

    public async Task<bool> DeleteResourceAsync(int resourceId, string instructorId, CancellationToken ct = default)
    {
        var resource = await _context.CourseResources
            .Include(r => r.Course)
            .FirstOrDefaultAsync(r => r.Id == resourceId, ct)
            ?? throw new NotFoundException(nameof(CourseResource), resourceId);

        if (resource.Course.InstructorId != instructorId)
        {
            throw new UnauthorizedAccessException("You can only delete resources from your own courses.");
        }

        if (!string.IsNullOrEmpty(resource.FileUrl))
        {
            await _fileStorageService.DeleteFileAsync(resource.FileUrl, ct);
        }

        _context.CourseResources.Remove(resource);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    #endregion

    #region Helpers

    private async Task RecalculateCourseTotalsAsync(int courseId, CancellationToken ct)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .FirstOrDefaultAsync(c => c.Id == courseId, ct);

        if (course == null) return;

        var allLessons = course.Sections.SelectMany(s => s.Lessons).ToList();
        course.TotalLessons = allLessons.Count;
        course.TotalDurationSeconds = allLessons.Sum(l => l.DurationSeconds ?? 0);
        course.LastModifiedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    private static LessonDto MapToLessonDto(Lesson l)
    {
        return new LessonDto
        {
            Id = l.Id,
            SectionId = l.SectionId,
            Title = l.Title,
            Description = l.Description,
            Type = l.Type,
            DisplayOrder = l.DisplayOrder,
            IsPreviewFree = l.IsPreviewFree,
            DurationSeconds = l.DurationSeconds,
            VideoUrl = l.VideoUrl,
            VideoThumbnailUrl = l.VideoThumbnailUrl,
            ContentHtml = l.ContentHtml,
            Resources = l.Resources?.Select(r => new CourseResourceDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                LessonId = r.LessonId,
                Title = r.Title,
                Type = r.Type,
                FileUrl = r.FileUrl,
                ExternalUrl = r.ExternalUrl,
                FileExtension = r.FileExtension,
                FileSizeBytes = r.FileSizeBytes,
                DisplayOrder = r.DisplayOrder
            }).ToList() ?? new List<CourseResourceDto>()
        };
    }

    #endregion
}

