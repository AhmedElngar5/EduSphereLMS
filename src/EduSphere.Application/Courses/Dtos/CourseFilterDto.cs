using EduSphere.Domain.Enums;

namespace EduSphere.Application.Courses.Dtos;

public class CourseFilterDto
{
    public string? SearchTerm { get; set; }
    public int? CategoryId { get; set; }
    public CourseLevel? Level { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsFree { get; set; }
    public double? MinRating { get; set; }
    public string? SortBy { get; set; } = "newest"; // newest, price_asc, price_desc, rating, popular
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class CourseApprovalStatusDto
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public CourseStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
}

public class RejectCourseDto
{
    public string Reason { get; set; } = string.Empty;
}

