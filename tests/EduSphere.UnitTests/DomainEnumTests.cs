using EduSphere.Domain.Enums;
using Xunit;

namespace EduSphere.UnitTests;

public class DomainEnumTests
{
    [Fact]
    public void CourseStatus_EnumValues_AreCorrectlyDefined()
    {
        Assert.Equal(1, (int)CourseStatus.Draft);
        Assert.Equal(2, (int)CourseStatus.PendingApproval);
        Assert.Equal(3, (int)CourseStatus.Approved);
        Assert.Equal(4, (int)CourseStatus.Published);
        Assert.Equal(5, (int)CourseStatus.Rejected);
        Assert.Equal(6, (int)CourseStatus.Archived);
    }

    [Fact]
    public void PaymentStatus_EnumValues_AreCorrectlyDefined()
    {
        Assert.Equal(1, (int)PaymentStatus.Pending);
        Assert.Equal(2, (int)PaymentStatus.Succeeded);
        Assert.Equal(3, (int)PaymentStatus.Failed);
        Assert.Equal(4, (int)PaymentStatus.Refunded);
    }

    [Fact]
    public void OrderStatus_EnumValues_AreCorrectlyDefined()
    {
        Assert.Equal(1, (int)OrderStatus.Pending);
        Assert.Equal(2, (int)OrderStatus.Completed);
        Assert.Equal(3, (int)OrderStatus.Cancelled);
        Assert.Equal(4, (int)OrderStatus.Refunded);
    }

    [Fact]
    public void EnrollmentStatus_EnumValues_AreCorrectlyDefined()
    {
        Assert.Equal(1, (int)EnrollmentStatus.Active);
        Assert.Equal(2, (int)EnrollmentStatus.Completed);
        Assert.Equal(3, (int)EnrollmentStatus.Dropped);
        Assert.Equal(4, (int)EnrollmentStatus.Expired);
    }
}
