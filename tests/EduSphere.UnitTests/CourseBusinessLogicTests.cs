using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Xunit;

namespace EduSphere.UnitTests;

public class CourseBusinessLogicTests
{
    [Fact]
    public void Course_DefaultValues_AreSensible()
    {
        var course = new Course
        {
            Title = "Full-Stack .NET 10 & React",
            Slug = "full-stack-dotnet-10-react",
            InstructorId = "instructor-123"
        };

        Assert.Equal(CourseStatus.Draft, course.Status);
        Assert.Equal(CourseLevel.AllLevels, course.Level);
        Assert.Equal(0, course.EnrolledCount);
        Assert.Equal(0.0, course.AverageRating);
        Assert.Equal(0, course.TotalReviews);
    }

    [Theory]
    [InlineData(100.0, 0.80, 80.0, 20.0)]
    [InlineData(49.99, 0.80, 39.992, 9.998)]
    [InlineData(0.0, 0.80, 0.0, 0.0)]
    public void PlatformRevenueShare_80PercentToInstructor_CalculatesAccurately(
        decimal totalAmount,
        decimal instructorRate,
        decimal expectedInstructorEarnings,
        decimal expectedPlatformFee)
    {
        var instructorEarnings = totalAmount * instructorRate;
        var platformFee = totalAmount - instructorEarnings;

        Assert.Equal(expectedInstructorEarnings, instructorEarnings);
        Assert.Equal(expectedPlatformFee, platformFee);
    }

    [Fact]
    public void FreeCourse_RequiresNoPayment_HasZeroPrice()
    {
        var course = new Course
        {
            Title = "Free Intro to C#",
            Price = 0m,
            IsFree = true,
            Status = CourseStatus.Published
        };

        Assert.True(course.IsFree);
        Assert.Equal(0m, course.Price);
    }
}

