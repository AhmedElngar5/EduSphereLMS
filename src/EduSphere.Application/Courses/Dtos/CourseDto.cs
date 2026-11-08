using EduSphere.Domain.Enums;

namespace EduSphere.Application.Courses.Dtos;

public class CourseSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string InstructorId { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string? InstructorTitle { get; set; }
    public string? InstructorPictureUrl { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public CourseLevel Level { get; set; }
    public CourseStatus Status { get; set; }
    public string? Language { get; set; }
    public string? ThumbnailUrl { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public bool IsFree { get; set; }
    public int TotalDurationSeconds { get; set; }
    public int TotalLessons { get; set; }
    public int EnrolledCount { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CourseDetailDto : CourseSummaryDto
{
    public string Description { get; set; } = string.Empty;
    public string? PreviewVideoUrl { get; set; }
    public string? Requirements { get; set; }
    public string? WhatYouWillLearn { get; set; }
    public string? WhoIsThisFor { get; set; }
    public string? RejectionReason { get; set; }
    public IReadOnlyList<SectionDto> Sections { get; set; } = Array.Empty<SectionDto>();
    public IReadOnlyList<CourseResourceDto> Resources { get; set; } = Array.Empty<CourseResourceDto>();
}

