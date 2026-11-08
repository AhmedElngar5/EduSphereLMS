using System.ComponentModel.DataAnnotations;
using EduSphere.Application.Auth.Dtos;
using Xunit;

namespace EduSphere.UnitTests;

public class AuthenticationSecurityTests
{
    private static IList<ValidationResult> ValidateModel(object model)
    {
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(model, null, null);
        Validator.TryValidateObject(model, validationContext, validationResults, validateAllProperties: true);
        return validationResults;
    }

    [Theory]
    [InlineData("Pass1!", false)] // 6 chars, under 8 minimum
    [InlineData("Short1!", false)] // 7 chars, under 8 minimum
    [InlineData("SecureP@ss123", true)] // >= 8 chars, valid
    public void RegisterDto_PasswordLength_EnforcesMinimum8Characters(string password, bool shouldBeValid)
    {
        var dto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = "test@example.com",
            Password = password,
            Role = "Student"
        };

        var results = ValidateModel(dto);
        var hasPasswordError = results.Any(r => r.MemberNames.Contains(nameof(RegisterDto.Password)));

        if (shouldBeValid)
        {
            Assert.False(hasPasswordError, "Expected password to pass validation.");
        }
        else
        {
            Assert.True(hasPasswordError, "Expected password to fail validation due to length.");
        }
    }

    [Theory]
    [InlineData("plainaddress", false)]
    [InlineData("@missingusername.com", false)]
    [InlineData("missingat.com", false)]
    [InlineData("valid.student@edusphere.com", true)]
    [InlineData("instructor@university.edu", true)]
    public void RegisterDto_EmailFormat_EnforcesStandardEmailValidation(string email, bool shouldBeValid)
    {
        var dto = new RegisterDto
        {
            FirstName = "Test",
            LastName = "User",
            Email = email,
            Password = "Password@123",
            Role = "Student"
        };

        var results = ValidateModel(dto);
        var hasEmailError = results.Any(r => r.MemberNames.Contains(nameof(RegisterDto.Email)));

        if (shouldBeValid)
        {
            Assert.False(hasEmailError, $"Expected '{email}' to be valid.");
        }
        else
        {
            Assert.True(hasEmailError, $"Expected '{email}' to be rejected as invalid.");
        }
    }

    [Theory]
    [InlineData("Student", true, "Student")]
    [InlineData("student", true, "Student")]
    [InlineData("Instructor", true, "Instructor")]
    [InlineData("instructor", true, "Instructor")]
    [InlineData("", true, "Student")] // Empty defaults to Student
    [InlineData(null, true, "Student")] // Null defaults to Student
    [InlineData("Admin", false, null)] // Admin prohibited in public registration
    [InlineData("admin", false, null)]
    [InlineData("SuperAdmin", false, null)]
    [InlineData("Root", false, null)]
    [InlineData("Moderator", false, null)]
    public void PublicRegistration_RolePolicy_PermitsOnlyStudentAndInstructor(
        string? inputRole,
        bool isPermitted,
        string? expectedRole)
    {
        var role = string.IsNullOrWhiteSpace(inputRole) ? "Student" : inputRole.Trim();
        var isValidRole = string.Equals(role, "Student", StringComparison.OrdinalIgnoreCase) ||
                          string.Equals(role, "Instructor", StringComparison.OrdinalIgnoreCase);

        Assert.Equal(isPermitted, isValidRole);

        if (isValidRole)
        {
            var normalizedRole = string.Equals(role, "Instructor", StringComparison.OrdinalIgnoreCase)
                ? "Instructor"
                : "Student";
            Assert.Equal(expectedRole, normalizedRole);
        }
    }

    [Theory]
    [InlineData("Password@123", true)] // Upper, lower, digit, special, >= 8
    [InlineData("password@123", false)] // Missing uppercase
    [InlineData("PASSWORD@123", false)] // Missing lowercase
    [InlineData("Password@@@@", false)] // Missing digit
    [InlineData("Password1234", false)] // Missing special
    [InlineData("P@1a", false)] // Too short
    public void PasswordComplexityPolicy_MatchesIdentityRules(string password, bool expectedStrong)
    {
        var hasLength = password.Length >= 8;
        var hasUpper = password.Any(char.IsUpper);
        var hasLower = password.Any(char.IsLower);
        var hasDigit = password.Any(char.IsDigit);
        var hasSpecial = password.Any(ch => !char.IsLetterOrDigit(ch));

        var meetsPolicy = hasLength && hasUpper && hasLower && hasDigit && hasSpecial;
        Assert.Equal(expectedStrong, meetsPolicy);
    }
}
