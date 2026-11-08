using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Wishlist.Dtos;
using EduSphere.Application.Wishlist.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class WishlistService : IWishlistService
{
    private readonly IApplicationDbContext _context;

    public WishlistService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistItemDto> AddToWishlistAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        if (course.Status != CourseStatus.Published)
        {
            throw new InvalidOperationException("Only published courses can be added to wishlist.");
        }

        var existing = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.CourseId == courseId, ct);

        if (existing != null)
        {
            return await MapToWishlistItemDtoAsync(existing, course, ct);
        }

        var wishlistItem = new Wishlist
        {
            UserId = userId,
            CourseId = courseId,
            AddedAtUtc = DateTime.UtcNow
        };

        _context.Wishlists.Add(wishlistItem);
        await _context.SaveChangesAsync(ct);

        return await MapToWishlistItemDtoAsync(wishlistItem, course, ct);
    }

    public async Task<bool> RemoveFromWishlistAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var item = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.CourseId == courseId, ct);

        if (item == null) return false;

        _context.Wishlists.Remove(item);
        await _context.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<WishlistItemDto>> GetUserWishlistAsync(string userId, CancellationToken ct = default)
    {
        var wishlist = await _context.Wishlists
            .AsNoTracking()
            .Include(w => w.Course)
                .ThenInclude(c => c.Category)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedAtUtc)
            .ToListAsync(ct);

        if (!wishlist.Any()) return Array.Empty<WishlistItemDto>();

        var instructorIds = wishlist.Select(w => w.Course.InstructorId).Distinct().ToList();
        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, instructorIds, ct);

        return wishlist.Select(w => new WishlistItemDto
        {
            Id = w.Id,
            CourseId = w.CourseId,
            Title = w.Course.Title,
            Slug = w.Course.Slug,
            ThumbnailUrl = w.Course.ThumbnailUrl,
            InstructorName = instructors.GetValueOrDefault(w.Course.InstructorId)?.FullName ?? "Instructor",
            CategoryName = w.Course.Category?.Name ?? string.Empty,
            Price = w.Course.Price,
            DiscountPrice = w.Course.DiscountPrice,
            IsFree = w.Course.IsFree,
            AverageRating = w.Course.AverageRating,
            TotalReviews = w.Course.TotalReviews,
            AddedAtUtc = w.AddedAtUtc
        }).ToList();
    }

    public async Task<bool> IsInWishlistAsync(string userId, int courseId, CancellationToken ct = default)
    {
        return await _context.Wishlists
            .AnyAsync(w => w.UserId == userId && w.CourseId == courseId, ct);
    }

    private async Task<WishlistItemDto> MapToWishlistItemDtoAsync(Wishlist w, Course course, CancellationToken ct)
    {
        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course.InstructorId], ct);

        return new WishlistItemDto
        {
            Id = w.Id,
            CourseId = w.CourseId,
            Title = course.Title,
            Slug = course.Slug,
            ThumbnailUrl = course.ThumbnailUrl,
            InstructorName = instructors.GetValueOrDefault(course.InstructorId)?.FullName ?? "Instructor",
            CategoryName = course.Category?.Name ?? string.Empty,
            Price = course.Price,
            DiscountPrice = course.DiscountPrice,
            IsFree = course.IsFree,
            AverageRating = course.AverageRating,
            TotalReviews = course.TotalReviews,
            AddedAtUtc = w.AddedAtUtc
        };
    }
}

