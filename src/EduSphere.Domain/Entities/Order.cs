using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;  // FK → ApplicationUser.Id
    public int CourseId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string? CouponCode { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }

    // Navigation properties
    public Course Course { get; set; } = null!;
    public Payment? Payment { get; set; }
    public Enrollment? Enrollment { get; set; }
}
