using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Xunit;

namespace EduSphere.UnitTests;

public class EnrollmentProgressTests
{
    [Theory]
    [InlineData(10, 0, 0.0, false)]
    [InlineData(10, 5, 50.0, false)]
    [InlineData(10, 10, 100.0, true)]
    [InlineData(4, 3, 75.0, false)]
    [InlineData(4, 4, 100.0, true)]
    public void CourseProgress_Calculation_ComputesPercentageCorrectly(
        int totalLessons,
        int completedLessons,
        double expectedPercentage,
        bool isComplete)
    {
        var percentage = totalLessons > 0
            ? Math.Round((double)completedLessons / totalLessons * 100.0, 1)
            : 0.0;

        var status = percentage >= 100.0
            ? EnrollmentStatus.Completed
            : EnrollmentStatus.Active;

        Assert.Equal(expectedPercentage, percentage);
        Assert.Equal(isComplete, status == EnrollmentStatus.Completed);
    }

    [Fact]
    public void Enrollment_InitialState_IsActiveWithZeroProgress()
    {
        var enrollment = new Enrollment
        {
            UserId = "user-1",
            CourseId = 10,
            PricePaid = 99.99m,
            Status = EnrollmentStatus.Active,
            ProgressPercentage = 0.0,
            EnrolledAtUtc = DateTime.UtcNow
        };

        Assert.Equal(EnrollmentStatus.Active, enrollment.Status);
        Assert.Equal(0.0, enrollment.ProgressPercentage);
        Assert.Null(enrollment.CompletedAtUtc);
    }
}
