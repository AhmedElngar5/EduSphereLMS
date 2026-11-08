using EduSphere.Application.Wishlist.Dtos;

namespace EduSphere.Application.Wishlist.Interfaces;

public interface IWishlistService
{
    Task<WishlistItemDto> AddToWishlistAsync(string userId, int courseId, CancellationToken ct = default);
    Task<bool> RemoveFromWishlistAsync(string userId, int courseId, CancellationToken ct = default);
    Task<IReadOnlyList<WishlistItemDto>> GetUserWishlistAsync(string userId, CancellationToken ct = default);
    Task<bool> IsInWishlistAsync(string userId, int courseId, CancellationToken ct = default);
}

