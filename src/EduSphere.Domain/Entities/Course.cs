using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string InstructorId { get; set; } = string.Empty;  // FK → ApplicationUser.Id (string)
    public int CategoryId { get; set; }
    public CourseLevel Level { get; set; } = CourseLevel.AllLevels;
    public CourseStatus Status { get; set; } = CourseStatus.Draft;
    public string? Language { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? PreviewVideoUrl { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public DateTime? DiscountExpiresAtUtc { get; set; }
    public bool IsFree { get; set; }
    public string? Requirements { get; set; }
    public string? WhatYouWillLearn { get; set; }
    public string? WhoIsThisFor { get; set; }
    public int TotalDurationSeconds { get; set; }
    public int TotalLessons { get; set; }
    public int EnrolledCount { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Category Category { get; set; } = null!;
    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Wishlist> WishlistItems { get; set; } = new List<Wishlist>();
    public ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    public ICollection<CourseResource> Resources { get; set; } = new List<CourseResource>();
}
