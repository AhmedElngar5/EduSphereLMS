namespace EduSphere.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // FK → ApplicationUser.Id
    public int CourseId { get; set; }
    public int Rating { get; set; }         // 1–5
    public string? Comment { get; set; }
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;
}
