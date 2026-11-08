using EduSphere.Application.Courses.Dtos;
using EduSphere.Domain.Enums;

namespace EduSphere.Application.Learning.Dtos;

public class StudentLessonDetailDto
{
    public int Id { get; set; }
    public int SectionId { get; set; }
    public string SectionTitle { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public LessonType Type { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPreviewFree { get; set; }
    public int? DurationSeconds { get; set; }
    public string? VideoStreamUrl { get; set; }
    public string? VideoThumbnailUrl { get; set; }
    public string? ContentHtml { get; set; }
    public int WatchedDurationSeconds { get; set; }
    public LessonProgressStatus ProgressStatus { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public int? PreviousLessonId { get; set; }
    public int? NextLessonId { get; set; }
    public IReadOnlyList<CourseResourceDto> Resources { get; set; } = Array.Empty<CourseResourceDto>();
}

public class UpdateLessonProgressDto
{
    public int WatchedDurationSeconds { get; set; }
    public bool IsCompleted { get; set; }
}

public class CourseLearningProgressDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public EnrollmentStatus Status { get; set; }
    public double ProgressPercentage { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public DateTime EnrolledAtUtc { get; set; }
    public DateTime? LastAccessedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public IReadOnlyList<SectionProgressDto> Sections { get; set; } = Array.Empty<SectionProgressDto>();
}

public class SectionProgressDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public IReadOnlyList<LessonProgressItemDto> Lessons { get; set; } = Array.Empty<LessonProgressItemDto>();
}

public class LessonProgressItemDto
{
    public int Id { get; set; }
    public int SectionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public LessonType Type { get; set; }
    public int? DurationSeconds { get; set; }
    public bool IsPreviewFree { get; set; }
    public LessonProgressStatus Status { get; set; }
    public int WatchedDurationSeconds { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}

public class ContinueLearningDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public int SectionId { get; set; }
    public string SectionTitle { get; set; } = string.Empty;
    public int WatchedDurationSeconds { get; set; }
    public int? DurationSeconds { get; set; }
    public double CourseProgressPercentage { get; set; }
}

