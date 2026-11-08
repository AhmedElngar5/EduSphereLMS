using EduSphere.Application.Common.Interfaces;

namespace EduSphere.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}

