using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class Lesson
{
    public int Id { get; set; }
    public int SectionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public LessonType Type { get; set; } = LessonType.Video;
    public int DisplayOrder { get; set; }
    public bool IsPreviewFree { get; set; }

    // Video metadata (URL/path only - no binary data stored in DB)
    public string? VideoUrl { get; set; }
    public string? VideoStorageKey { get; set; }  // e.g. Azure Blob / S3 object key
    public string? VideoProvider { get; set; }     // e.g. "AzureBlob", "S3", "Vimeo"
    public int? DurationSeconds { get; set; }
    public long? VideoFileSizeBytes { get; set; }
    public string? VideoThumbnailUrl { get; set; }
    public string? VideoTranscriptUrl { get; set; }

    // Text/article content
    public string? ContentHtml { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Section Section { get; set; } = null!;
    public ICollection<LessonProgress> Progresses { get; set; } = new List<LessonProgress>();
    public ICollection<CourseResource> Resources { get; set; } = new List<CourseResource>();
}

