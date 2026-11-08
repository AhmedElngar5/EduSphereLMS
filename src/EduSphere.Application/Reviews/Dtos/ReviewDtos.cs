using System.ComponentModel.DataAnnotations;

namespace EduSphere.Application.Reviews.Dtos;

public class CreateReviewDto
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
    public int Rating { get; set; }

    [StringLength(3000, ErrorMessage = "Review comment cannot exceed 3000 characters.")]
    public string? Comment { get; set; }
}

public class UpdateReviewDto
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
    public int Rating { get; set; }

    [StringLength(3000, ErrorMessage = "Review comment cannot exceed 3000 characters.")]
    public string? Comment { get; set; }
}

public class ReviewDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string? StudentPictureUrl { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? LastModifiedAtUtc { get; set; }
}

