using EduSphere.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UsersController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers(CancellationToken ct)
    {
        var users = await _userManager.Users
            .OrderByDescending(u => u.CreatedAtUtc)
            .ToListAsync(ct);

        var result = new List<object>();
        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            result.Add(new
            {
                id = u.Id,
                email = u.Email,
                firstName = u.FirstName,
                lastName = u.LastName,
                headline = u.Headline,
                profilePictureUrl = u.ProfilePictureUrl,
                roles = roles,
                isActive = u.IsActive,
                createdAtUtc = u.CreatedAtUtc
            });
        }

        return Ok(result);
    }

    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);

        return Ok(new { id = user.Id, isActive = user.IsActive });
    }
}

