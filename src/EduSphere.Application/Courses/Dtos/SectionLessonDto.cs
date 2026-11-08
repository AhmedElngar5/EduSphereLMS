using System.ComponentModel.DataAnnotations;
using EduSphere.Domain.Enums;

namespace EduSphere.Application.Courses.Dtos;

public class SectionDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public IReadOnlyList<LessonDto> Lessons { get; set; } = Array.Empty<LessonDto>();
}

public class CreateSectionDto
{
    [Required]
    [StringLength(300, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public int DisplayOrder { get; set; }
}

public class UpdateSectionDto
{
    [Required]
    [StringLength(300, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public int DisplayOrder { get; set; }
}

public class LessonDto
{
    public int Id { get; set; }
    public int SectionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public LessonType Type { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPreviewFree { get; set; }
    public int? DurationSeconds { get; set; }
    public string? VideoUrl { get; set; }
    public string? VideoThumbnailUrl { get; set; }
    public string? ContentHtml { get; set; }
    public IReadOnlyList<CourseResourceDto> Resources { get; set; } = Array.Empty<CourseResourceDto>();
}

public class CreateLessonDto
{
    [Required]
    [StringLength(300, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public LessonType Type { get; set; } = LessonType.Video;
    public int DisplayOrder { get; set; }
    public bool IsPreviewFree { get; set; }
    public string? ContentHtml { get; set; }
    public string? VideoUrl { get; set; }
    public int? DurationSeconds { get; set; }
}

public class UpdateLessonDto
{
    [Required]
    [StringLength(300, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public LessonType Type { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPreviewFree { get; set; }
    public string? ContentHtml { get; set; }
    public string? VideoUrl { get; set; }
    public int? DurationSeconds { get; set; }
}

public class ReorderItemDto
{
    public int Id { get; set; }
    public int NewOrder { get; set; }
}

public class CourseResourceDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int? LessonId { get; set; }
    public string Title { get; set; } = string.Empty;
    public ResourceType Type { get; set; }
    public string? FileUrl { get; set; }
    public string? ExternalUrl { get; set; }
    public string? FileExtension { get; set; }
    public long? FileSizeBytes { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateCourseResourceDto
{
    [Required]
    [StringLength(300)]
    public string Title { get; set; } = string.Empty;

    public ResourceType Type { get; set; } = ResourceType.Document;
    public string? ExternalUrl { get; set; }
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public int? ParentCategoryId { get; set; }
    public int DisplayOrder { get; set; }
    public int CourseCount { get; set; }
    public IReadOnlyList<CategoryDto> SubCategories { get; set; } = Array.Empty<CategoryDto>();
}

