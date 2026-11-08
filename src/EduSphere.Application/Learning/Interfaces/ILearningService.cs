using EduSphere.Application.Learning.Dtos;

namespace EduSphere.Application.Learning.Interfaces;

public interface ILearningService
{
    Task<StudentLessonDetailDto> GetLessonDetailsAsync(string userId, int courseId, int lessonId, CancellationToken ct = default);
    Task<LessonProgressItemDto> UpdateLessonProgressAsync(string userId, int lessonId, UpdateLessonProgressDto dto, CancellationToken ct = default);
    Task<LessonProgressItemDto> CompleteLessonAsync(string userId, int lessonId, CancellationToken ct = default);
    Task<CourseLearningProgressDto> GetCourseProgressAsync(string userId, int courseId, CancellationToken ct = default);
    Task<ContinueLearningDto> GetContinueLearningAsync(string userId, int courseId, CancellationToken ct = default);
    Task<(Stream Stream, string ContentType, string FileName)> GetVideoStreamAsync(string userId, int lessonId, CancellationToken ct = default);
    Task<(Stream Stream, string ContentType, string FileName)> GetResourceFileAsync(string userId, int resourceId, CancellationToken ct = default);
}

