using EduSphere.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace EduSphere.Infrastructure.Identity;

/// <summary>
/// Application user identity entity. Extends ASP.NET Core IdentityUser with
/// EduSphere-specific profile fields. Lives in Infrastructure because it carries
/// a framework dependency (IdentityUser); the Domain stays framework-free.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Headline { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? TwitterHandle { get; set; }
    public string? LinkedInUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }
    public DateTime? LastLoginAtUtc { get; set; }

    // Navigation properties – domain aggregates back to identity
    public ICollection<Course> TaughtCourses { get; set; } = new List<Course>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Wishlist> WishlistItems { get; set; } = new List<Wishlist>();
    public ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}

