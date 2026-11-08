using EduSphere.Domain.Enums;

namespace EduSphere.Application.Enrollments.Dtos;

public class EnrollCourseDto
{
    public string? PaymentMethod { get; set; } = "Free";
    public int? OrderId { get; set; }
}

public class EnrollmentDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string CourseSlug { get; set; } = string.Empty;
    public string? CourseThumbnailUrl { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public EnrollmentStatus Status { get; set; }
    public decimal PricePaid { get; set; }
    public double ProgressPercentage { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public DateTime EnrolledAtUtc { get; set; }
    public DateTime? LastAccessedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public int? NextLessonId { get; set; }
    public string? NextLessonTitle { get; set; }
}

public class EnrollmentStatusDto
{
    public bool IsEnrolled { get; set; }
    public EnrollmentStatus? Status { get; set; }
    public double? ProgressPercentage { get; set; }
    public DateTime? EnrolledAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
}

