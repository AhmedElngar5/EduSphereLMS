namespace EduSphere.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(string userId, string email, string firstName, string lastName, IEnumerable<string> roles);
}

