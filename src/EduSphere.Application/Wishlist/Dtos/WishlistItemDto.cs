namespace EduSphere.Application.Wishlist.Dtos;

public class WishlistItemDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public bool IsFree { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public DateTime AddedAtUtc { get; set; }
}

public class WishlistStatusDto
{
    public bool InWishlist { get; set; }
}

