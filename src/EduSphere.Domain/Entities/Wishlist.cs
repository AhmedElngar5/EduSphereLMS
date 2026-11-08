namespace EduSphere.Domain.Entities;

public class Wishlist
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // FK → ApplicationUser.Id
    public int CourseId { get; set; }
    public DateTime AddedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Course Course { get; set; } = null!;
}
