using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Wishlist.Dtos;
using EduSphere.Application.Wishlist.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly IWishlistService _wishlistService;
    private readonly ICurrentUserService _currentUserService;

    public WishlistController(
        IWishlistService wishlistService,
        ICurrentUserService currentUserService)
    {
        _wishlistService = wishlistService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    /// <summary>
    /// View saved courses in wishlist
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<WishlistItemDto>>> GetWishlist(CancellationToken ct)
    {
        var items = await _wishlistService.GetUserWishlistAsync(CurrentUserId, ct);
        return Ok(items);
    }

    /// <summary>
    /// Add a course to wishlist
    /// </summary>
    [HttpPost("courses/{courseId:int}")]
    public async Task<ActionResult<WishlistItemDto>> AddToWishlist(int courseId, CancellationToken ct)
    {
        var item = await _wishlistService.AddToWishlistAsync(CurrentUserId, courseId, ct);
        return Ok(item);
    }

    /// <summary>
    /// Remove a course from wishlist
    /// </summary>
    [HttpDelete("courses/{courseId:int}")]
    public async Task<IActionResult> RemoveFromWishlist(int courseId, CancellationToken ct)
    {
        await _wishlistService.RemoveFromWishlistAsync(CurrentUserId, courseId, ct);
        return NoContent();
    }

    /// <summary>
    /// Check if course is in wishlist
    /// </summary>
    [HttpGet("courses/{courseId:int}/status")]
    public async Task<ActionResult<WishlistStatusDto>> CheckWishlistStatus(int courseId, CancellationToken ct)
    {
        var inWishlist = await _wishlistService.IsInWishlistAsync(CurrentUserId, courseId, ct);
        return Ok(new WishlistStatusDto { InWishlist = inWishlist });
    }
}

