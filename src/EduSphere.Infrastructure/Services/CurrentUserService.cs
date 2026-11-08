using System.Security.Claims;
using EduSphere.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace EduSphere.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public string? UserId =>
        User?.FindFirstValue(ClaimTypes.NameIdentifier) ??
        User?.FindFirstValue("sub") ??
        User?.FindFirstValue("id");

    public string? Email =>
        User?.FindFirstValue(ClaimTypes.Email) ??
        User?.FindFirstValue("email");

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public bool IsAdmin => IsInRole("Admin");

    public bool IsInstructor => IsInRole("Instructor");

    public bool IsStudent => IsInRole("Student");

    public bool IsInRole(string role)
    {
        if (User == null) return false;
        return User.IsInRole(role) || User.HasClaim(ClaimTypes.Role, role) || User.HasClaim("role", role);
    }
}

