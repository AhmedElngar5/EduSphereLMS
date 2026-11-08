using EduSphere.Application.Courses.Dtos;

namespace EduSphere.Application.Courses.Interfaces;

public interface ISectionLessonService
{
    // Section management
    Task<SectionDto> CreateSectionAsync(int courseId, CreateSectionDto dto, string instructorId, CancellationToken ct = default);
    Task<SectionDto> UpdateSectionAsync(int sectionId, UpdateSectionDto dto, string instructorId, CancellationToken ct = default);
    Task<bool> DeleteSectionAsync(int sectionId, string instructorId, CancellationToken ct = default);
    Task<bool> ReorderSectionsAsync(int courseId, IReadOnlyList<ReorderItemDto> items, string instructorId, CancellationToken ct = default);

    // Lesson management
    Task<LessonDto> CreateLessonAsync(int sectionId, CreateLessonDto dto, string instructorId, CancellationToken ct = default);
    Task<LessonDto> UpdateLessonAsync(int lessonId, UpdateLessonDto dto, string instructorId, CancellationToken ct = default);
    Task<bool> DeleteLessonAsync(int lessonId, string instructorId, CancellationToken ct = default);
    Task<LessonDto> UploadLessonVideoAsync(int lessonId, Stream stream, string fileName, string contentType, int? durationSeconds, string instructorId, CancellationToken ct = default);
    Task<bool> ReorderLessonsAsync(int sectionId, IReadOnlyList<ReorderItemDto> items, string instructorId, CancellationToken ct = default);

    // Resource management
    Task<CourseResourceDto> UploadCourseResourceAsync(int courseId, int? lessonId, CreateCourseResourceDto dto, Stream? stream, string? fileName, string? contentType, string instructorId, CancellationToken ct = default);
    Task<bool> DeleteResourceAsync(int resourceId, string instructorId, CancellationToken ct = default);
}

