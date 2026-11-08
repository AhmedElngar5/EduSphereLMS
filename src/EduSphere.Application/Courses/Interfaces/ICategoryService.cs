using EduSphere.Application.Courses.Dtos;

namespace EduSphere.Application.Courses.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync(CancellationToken ct = default);
    Task SeedInitialCategoriesAsync(CancellationToken ct = default);
}

