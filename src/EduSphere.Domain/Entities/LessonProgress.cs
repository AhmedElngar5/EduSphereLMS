using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class LessonProgress
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // FK → ApplicationUser.Id
    public int LessonId { get; set; }
    public LessonProgressStatus Status { get; set; } = LessonProgressStatus.NotStarted;
    public int WatchedDurationSeconds { get; set; }
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Lesson Lesson { get; set; } = null!;
}
