namespace EduSphere.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    bool IsAdmin { get; }
    bool IsInstructor { get; }
    bool IsStudent { get; }
    bool IsInRole(string role);
}

