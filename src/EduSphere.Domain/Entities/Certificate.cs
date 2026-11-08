namespace EduSphere.Domain.Entities;

public class Certificate
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // FK → ApplicationUser.Id
    public int CourseId { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string? CertificateUrl { get; set; }
    public string? CertificateStorageKey { get; set; }
    public DateTime IssuedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Course Course { get; set; } = null!;
}
