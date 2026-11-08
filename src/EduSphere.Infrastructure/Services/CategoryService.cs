using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Courses.Dtos;
using EduSphere.Application.Courses.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _context;

    public CategoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync(CancellationToken ct = default)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .Include(c => c.SubCategories)
            .Include(c => c.Courses)
            .Where(c => c.IsActive && c.ParentCategoryId == null)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(ct);

        return categories.Select(MapToCategoryDto).ToList();
    }

    public async Task SeedInitialCategoriesAsync(CancellationToken ct = default)
    {
        if (await _context.Categories.AnyAsync(ct))
        {
            return;
        }

        var categories = new List<Category>
        {
            new()
            {
                Name = "Software Development",
                Slug = "software-development",
                Description = "Learn programming languages, modern frameworks, and software engineering practices.",
                IconUrl = "code",
                DisplayOrder = 1,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                SubCategories = new List<Category>
                {
                    new() { Name = "Web Development", Slug = "web-development", DisplayOrder = 1, IsActive = true, CreatedAtUtc = DateTime.UtcNow },
                    new() { Name = "Mobile Development", Slug = "mobile-development", DisplayOrder = 2, IsActive = true, CreatedAtUtc = DateTime.UtcNow },
                    new() { Name = "DevOps & Cloud", Slug = "devops-cloud", DisplayOrder = 3, IsActive = true, CreatedAtUtc = DateTime.UtcNow }
                }
            },
            new()
            {
                Name = "Data Science & AI",
                Slug = "data-science-ai",
                Description = "Master machine learning, deep learning, Python, data analysis, and generative AI.",
                IconUrl = "cpu",
                DisplayOrder = 2,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                SubCategories = new List<Category>
                {
                    new() { Name = "Machine Learning", Slug = "machine-learning", DisplayOrder = 1, IsActive = true, CreatedAtUtc = DateTime.UtcNow },
                    new() { Name = "Data Analysis", Slug = "data-analysis", DisplayOrder = 2, IsActive = true, CreatedAtUtc = DateTime.UtcNow }
                }
            },
            new()
            {
                Name = "Business & Leadership",
                Slug = "business-leadership",
                Description = "Develop business management, agile leadership, and product management skills.",
                IconUrl = "briefcase",
                DisplayOrder = 3,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            },
            new()
            {
                Name = "Design & Creative",
                Slug = "design-creative",
                Description = "UI/UX design, Figma workflows, design systems, and graphic design principles.",
                IconUrl = "palette",
                DisplayOrder = 4,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            }
        };

        _context.Categories.AddRange(categories);
        await _context.SaveChangesAsync(ct);
    }

    private static CategoryDto MapToCategoryDto(Category c)
    {
        return new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Description = c.Description,
            IconUrl = c.IconUrl,
            ParentCategoryId = c.ParentCategoryId,
            DisplayOrder = c.DisplayOrder,
            CourseCount = c.Courses?.Count(co => co.Status == CourseStatus.Published) ?? 0,
            SubCategories = c.SubCategories?.Select(MapToCategoryDto).ToList() ?? new List<CategoryDto>()
        };
    }
}

