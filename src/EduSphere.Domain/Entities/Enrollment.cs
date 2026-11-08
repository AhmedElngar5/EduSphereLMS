using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class Enrollment
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // FK → ApplicationUser.Id
    public int CourseId { get; set; }
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
    public decimal PricePaid { get; set; }
    public int? OrderId { get; set; }
    public double ProgressPercentage { get; set; }
    public DateTime EnrolledAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public DateTime? LastAccessedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;
    public Order? Order { get; set; }
}
