using EduSphere.Application.Auth.Dtos;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Courses.Interfaces;
using EduSphere.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICategoryService _categoryService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IJwtTokenService jwtTokenService,
        ICategoryService categoryService,
        ICurrentUserService currentUserService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _categoryService = categoryService;
        _currentUserService = currentUserService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        // 1. Enforce strict role validation on public registration
        var role = string.IsNullOrWhiteSpace(dto.Role) ? "Student" : dto.Role.Trim();
        if (!string.Equals(role, "Student", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(role, "Instructor", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Invalid registration role. Only 'Student' and 'Instructor' accounts can be registered publicly. Admin accounts cannot be created via public registration.",
                errors = new[] { "Invalid registration role. Only 'Student' and 'Instructor' accounts can be registered publicly. Admin accounts cannot be created via public registration." }
            });
        }

        var requestedRole = string.Equals(role, "Instructor", StringComparison.OrdinalIgnoreCase)
            ? "Instructor"
            : "Student";

        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            return BadRequest(new
            {
                message = "An account with this email address already exists.",
                errors = new[] { "An account with this email address already exists." }
            });
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errorList = result.Errors.Select(e => e.Description).ToArray();
            return BadRequest(new
            {
                message = string.Join(" ", errorList),
                errors = errorList
            });
        }

        if (!await _roleManager.RoleExistsAsync(requestedRole))
        {
            await _roleManager.CreateAsync(new IdentityRole(requestedRole));
        }

        await _userManager.AddToRoleAsync(user, requestedRole);

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user.Id, user.Email!, user.FirstName, user.LastName, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Headline = user.Headline,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Roles = roles.ToList(),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        user.LastLoginAtUtc = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user.Id, user.Email!, user.FirstName, user.LastName, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Headline = user.Headline,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Roles = roles.ToList(),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponseDto>> GetCurrentUser()
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user.Id, user.Email!, user.FirstName, user.LastName, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Headline = user.Headline,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Roles = roles.ToList(),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });
    }

    [HttpPost("seed")]
    [AllowAnonymous]
    public async Task<ActionResult<SeedResultDto>> SeedDefaultRolesAndUsers()
    {
        // 1. Ensure Roles
        string[] roles = ["Admin", "Instructor", "Student"];
        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Ensure Admin User
        var adminEmail = "admin@edusphere.com";
        var adminUser = await _userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "System",
                Headline = "EduSphere Lead Administrator",
                EmailConfirmed = true,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var createRes = await _userManager.CreateAsync(adminUser, "Admin@123456");
            if (createRes.Succeeded)
            {
                await _userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }

        // 3. Ensure Instructor User
        var instructorEmail = "instructor@edusphere.com";
        var instructorUser = await _userManager.FindByEmailAsync(instructorEmail);
        if (instructorUser == null)
        {
            instructorUser = new ApplicationUser
            {
                UserName = instructorEmail,
                Email = instructorEmail,
                FirstName = "Sarah",
                LastName = "Connor",
                Headline = "Senior Cloud Architect & .NET Expert",
                Bio = "Over 12 years of industry experience building cloud-native enterprise systems with .NET and React.",
                EmailConfirmed = true,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var createRes = await _userManager.CreateAsync(instructorUser, "Instructor@123456");
            if (createRes.Succeeded)
            {
                await _userManager.AddToRoleAsync(instructorUser, "Instructor");
            }
        }

        // 4. Ensure Student User
        var studentEmail = "student@edusphere.com";
        var studentUser = await _userManager.FindByEmailAsync(studentEmail);
        if (studentUser == null)
        {
            studentUser = new ApplicationUser
            {
                UserName = studentEmail,
                Email = studentEmail,
                FirstName = "Alex",
                LastName = "Johnson",
                Headline = "Aspiring Full Stack Engineer",
                EmailConfirmed = true,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var createRes = await _userManager.CreateAsync(studentUser, "Student@123456");
            if (createRes.Succeeded)
            {
                await _userManager.AddToRoleAsync(studentUser, "Student");
            }
        }

        // 5. Seed categories
        await _categoryService.SeedInitialCategoriesAsync();

        return Ok(new SeedResultDto
        {
            Succeeded = true,
            Message = "Roles, test accounts, and categories initialized successfully.",
            TestAccounts = new
            {
                Admin = new { Email = "admin@edusphere.com", Password = "Admin@123456", Role = "Admin" },
                Instructor = new { Email = "instructor@edusphere.com", Password = "Instructor@123456", Role = "Instructor" },
                Student = new { Email = "student@edusphere.com", Password = "Student@123456", Role = "Student" }
            }
        });
    }
}

