using System.ComponentModel.DataAnnotations;
using EduSphere.Domain.Enums;

namespace EduSphere.Application.Courses.Dtos;

public class CreateCourseDto
{
    [Required]
    [StringLength(300, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    public CourseLevel Level { get; set; } = CourseLevel.AllLevels;

    [Range(0, 10000)]
    public decimal Price { get; set; }

    [Range(0, 10000)]
    public decimal? DiscountPrice { get; set; }

    public DateTime? DiscountExpiresAtUtc { get; set; }

    public bool IsFree { get; set; }

    [StringLength(50)]
    public string? Language { get; set; } = "English";

    public string? Requirements { get; set; }
    public string? WhatYouWillLearn { get; set; }
    public string? WhoIsThisFor { get; set; }
}

public class UpdateCourseDto
{
    [Required]
    [StringLength(300, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    public CourseLevel Level { get; set; }

    [Range(0, 10000)]
    public decimal Price { get; set; }

    [Range(0, 10000)]
    public decimal? DiscountPrice { get; set; }

    public DateTime? DiscountExpiresAtUtc { get; set; }

    public bool IsFree { get; set; }

    [StringLength(50)]
    public string? Language { get; set; }

    public string? Requirements { get; set; }
    public string? WhatYouWillLearn { get; set; }
    public string? WhoIsThisFor { get; set; }
}

