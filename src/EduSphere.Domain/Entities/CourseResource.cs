using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class CourseResource
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int? LessonId { get; set; }   // Null = course-level resource; set = lesson-level resource
    public string Title { get; set; } = string.Empty;
    public ResourceType Type { get; set; } = ResourceType.Document;
    public string? FileUrl { get; set; }             // URL to file (blob/S3/CDN)
    public string? FileStorageKey { get; set; }      // Object key in blob/S3
    public string? ExternalUrl { get; set; }         // For ResourceType.Link
    public string? FileExtension { get; set; }
    public long? FileSizeBytes { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;
    public Lesson? Lesson { get; set; }
}

