using EduSphere.Application.Certificates.Interfaces;
using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Courses.Dtos;
using EduSphere.Application.Learning.Dtos;
using EduSphere.Application.Learning.Interfaces;
using EduSphere.Application.Notifications.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class LearningService : ILearningService
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUserService;
    private readonly INotificationService _notificationService;
    private readonly ICertificateService _certificateService;

    public LearningService(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUserService,
        INotificationService notificationService,
        ICertificateService certificateService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _currentUserService = currentUserService;
        _notificationService = notificationService;
        _certificateService = certificateService;
    }

    private async Task ValidateLessonAccessAsync(Lesson lesson, string userId, CancellationToken ct)
    {
        // 1. Free preview lessons are accessible to all authenticated users
        if (lesson.IsPreviewFree)
        {
            return;
        }

        // 2. Admin has global access
        if (_currentUserService.IsInRole("Admin"))
        {
            return;
        }

        // 3. Determine course ID
        int courseId;
        if (lesson.Section != null)
        {
            courseId = lesson.Section.CourseId;
        }
        else
        {
            var section = await _context.Sections.AsNoTracking().FirstOrDefaultAsync(s => s.Id == lesson.SectionId, ct);
            courseId = section?.CourseId ?? 0;
        }

        // Course Instructor has full access to own course
        var course = lesson.Section?.Course ?? await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == courseId, ct);

        if (course != null && course.InstructorId == userId)
        {
            return;
        }

        // 4. Student must have an active or completed enrollment
        var isEnrolled = await _context.Enrollments.AnyAsync(e =>
            e.UserId == userId &&
            e.CourseId == courseId &&
            (e.Status == EnrollmentStatus.Active || e.Status == EnrollmentStatus.Completed), ct);

        if (!isEnrolled)
        {
            throw new UnauthorizedAccessException("You do not have access to this lesson. An active enrollment is required.");
        }
    }

    public async Task<StudentLessonDetailDto> GetLessonDetailsAsync(
        string userId,
        int courseId,
        int lessonId,
        CancellationToken ct = default)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Section)
                .ThenInclude(s => s.Course)
            .Include(l => l.Resources.OrderBy(r => r.DisplayOrder))
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.Section.CourseId == courseId, ct)
            ?? throw new NotFoundException(nameof(Lesson), lessonId);

        await ValidateLessonAccessAsync(lesson, userId, ct);

        // Fetch or create progress entry
        var progress = await _context.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.UserId == userId && lp.LessonId == lessonId, ct);

        if (progress == null)
        {
            progress = new LessonProgress
            {
                UserId = userId,
                LessonId = lessonId,
                Status = LessonProgressStatus.InProgress,
                WatchedDurationSeconds = 0,
                StartedAtUtc = DateTime.UtcNow,
                CreatedAtUtc = DateTime.UtcNow
            };
            _context.LessonProgresses.Add(progress);
        }

        // Update enrollment last accessed timestamp
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);
        if (enrollment != null)
        {
            enrollment.LastAccessedAtUtc = DateTime.UtcNow;
            enrollment.LastModifiedAtUtc = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(ct);

        // Determine previous and next lessons
        var courseLessons = await _context.Lessons
            .AsNoTracking()
            .Where(l => l.Section.CourseId == courseId)
            .OrderBy(l => l.Section.DisplayOrder)
            .ThenBy(l => l.DisplayOrder)
            .Select(l => l.Id)
            .ToListAsync(ct);

        var currentIndex = courseLessons.IndexOf(lessonId);
        int? previousLessonId = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
        int? nextLessonId = (currentIndex >= 0 && currentIndex < courseLessons.Count - 1) ? courseLessons[currentIndex + 1] : null;

        string? videoStreamUrl = !string.IsNullOrEmpty(lesson.VideoUrl)
            ? $"/api/learning/lessons/{lesson.Id}/video-stream"
            : null;

        return new StudentLessonDetailDto
        {
            Id = lesson.Id,
            SectionId = lesson.SectionId,
            SectionTitle = lesson.Section.Title,
            CourseId = courseId,
            CourseTitle = lesson.Section.Course.Title,
            Title = lesson.Title,
            Description = lesson.Description,
            Type = lesson.Type,
            DisplayOrder = lesson.DisplayOrder,
            IsPreviewFree = lesson.IsPreviewFree,
            DurationSeconds = lesson.DurationSeconds,
            VideoStreamUrl = videoStreamUrl,
            VideoThumbnailUrl = lesson.VideoThumbnailUrl,
            ContentHtml = lesson.ContentHtml,
            WatchedDurationSeconds = progress.WatchedDurationSeconds,
            ProgressStatus = progress.Status,
            IsCompleted = progress.Status == LessonProgressStatus.Completed,
            CompletedAtUtc = progress.CompletedAtUtc,
            PreviousLessonId = previousLessonId,
            NextLessonId = nextLessonId,
            Resources = lesson.Resources.Select(r => new CourseResourceDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                LessonId = r.LessonId,
                Title = r.Title,
                Type = r.Type,
                FileUrl = $"/api/learning/resources/{r.Id}/download",
                ExternalUrl = r.ExternalUrl,
                FileExtension = r.FileExtension,
                FileSizeBytes = r.FileSizeBytes,
                DisplayOrder = r.DisplayOrder
            }).ToList()
        };
    }

    public async Task<LessonProgressItemDto> UpdateLessonProgressAsync(
        string userId,
        int lessonId,
        UpdateLessonProgressDto dto,
        CancellationToken ct = default)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Section)
                .ThenInclude(s => s.Course)
            .FirstOrDefaultAsync(l => l.Id == lessonId, ct)
            ?? throw new NotFoundException(nameof(Lesson), lessonId);

        await ValidateLessonAccessAsync(lesson, userId, ct);

        var progress = await _context.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.UserId == userId && lp.LessonId == lessonId, ct);

        if (progress == null)
        {
            progress = new LessonProgress
            {
                UserId = userId,
                LessonId = lessonId,
                Status = dto.IsCompleted ? LessonProgressStatus.Completed : LessonProgressStatus.InProgress,
                WatchedDurationSeconds = Math.Max(0, dto.WatchedDurationSeconds),
                StartedAtUtc = DateTime.UtcNow,
                CompletedAtUtc = dto.IsCompleted ? DateTime.UtcNow : null,
                CreatedAtUtc = DateTime.UtcNow
            };
            _context.LessonProgresses.Add(progress);
        }
        else
        {
            progress.WatchedDurationSeconds = Math.Max(progress.WatchedDurationSeconds, dto.WatchedDurationSeconds);
            if (dto.IsCompleted)
            {
                progress.Status = LessonProgressStatus.Completed;
                progress.CompletedAtUtc ??= DateTime.UtcNow;
            }
            else if (progress.Status == LessonProgressStatus.NotStarted)
            {
                progress.Status = LessonProgressStatus.InProgress;
                progress.StartedAtUtc ??= DateTime.UtcNow;
            }
            progress.LastModifiedAtUtc = DateTime.UtcNow;
        }

        // Recalculate Course Completion
        var courseId = lesson.Section.CourseId;
        var allCourseLessonIds = await _context.Lessons
            .Where(l => l.Section.CourseId == courseId)
            .Select(l => l.Id)
            .ToListAsync(ct);

        var totalLessons = allCourseLessonIds.Count;

        // Find existing completed lesson count excluding current lesson
        var otherCompletedCount = await _context.LessonProgresses
            .Where(lp => lp.UserId == userId && lp.LessonId != lessonId && allCourseLessonIds.Contains(lp.LessonId) && lp.Status == LessonProgressStatus.Completed)
            .CountAsync(ct);

        var isCurrentCompleted = progress.Status == LessonProgressStatus.Completed;
        var completedLessons = otherCompletedCount + (isCurrentCompleted ? 1 : 0);

        var percentage = totalLessons > 0
            ? Math.Round((double)completedLessons / totalLessons * 100.0, 2)
            : 100.0;

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);

        if (enrollment != null)
        {
            enrollment.ProgressPercentage = percentage;
            enrollment.LastAccessedAtUtc = DateTime.UtcNow;
            enrollment.LastModifiedAtUtc = DateTime.UtcNow;

            // Automatically mark course as completed when all lessons are completed
            if (percentage >= 100.0 && totalLessons > 0)
            {
                var wasAlreadyCompleted = enrollment.Status == EnrollmentStatus.Completed;
                enrollment.Status = EnrollmentStatus.Completed;
                enrollment.CompletedAtUtc ??= DateTime.UtcNow;

                if (!wasAlreadyCompleted)
                {
                    await _notificationService.CreateNotificationAsync(
                        userId,
                        NotificationType.CourseCompletion,
                        "Course Completed!",
                        $"Congratulations! You have completed all lessons in '{lesson.Section.Course.Title}'.",
                        actionUrl: $"/courses/{lesson.Section.Course.Slug}",
                        ct: ct);

                    try
                    {
                        await _certificateService.GenerateCertificateAsync(userId, courseId, ct);
                    }
                    catch
                    {
                        // Certificate may already exist
                    }
                }
            }
        }

        await _context.SaveChangesAsync(ct);

        return new LessonProgressItemDto
        {
            Id = lesson.Id,
            SectionId = lesson.SectionId,
            Title = lesson.Title,
            DisplayOrder = lesson.DisplayOrder,
            Type = lesson.Type,
            DurationSeconds = lesson.DurationSeconds,
            IsPreviewFree = lesson.IsPreviewFree,
            Status = progress.Status,
            WatchedDurationSeconds = progress.WatchedDurationSeconds,
            IsCompleted = progress.Status == LessonProgressStatus.Completed,
            CompletedAtUtc = progress.CompletedAtUtc
        };
    }

    public async Task<LessonProgressItemDto> CompleteLessonAsync(string userId, int lessonId, CancellationToken ct = default)
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.Id == lessonId, ct)
            ?? throw new NotFoundException(nameof(Lesson), lessonId);

        return await UpdateLessonProgressAsync(userId, lessonId, new UpdateLessonProgressDto
        {
            IsCompleted = true,
            WatchedDurationSeconds = lesson.DurationSeconds ?? 0
        }, ct);
    }

    public async Task<CourseLearningProgressDto> GetCourseProgressAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Sections.OrderBy(s => s.DisplayOrder))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.DisplayOrder))
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        var enrollment = await _context.Enrollments
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);

        var isAdmin = _currentUserService.IsInRole("Admin");
        var isInstructor = course.InstructorId == userId;

        if (enrollment == null && !isAdmin && !isInstructor)
        {
            throw new UnauthorizedAccessException("You must be enrolled in this course to view learning progress.");
        }

        var lessonIds = course.Sections.SelectMany(s => s.Lessons).Select(l => l.Id).ToList();
        var progresses = await _context.LessonProgresses
            .AsNoTracking()
            .Where(lp => lp.UserId == userId && lessonIds.Contains(lp.LessonId))
            .ToDictionaryAsync(lp => lp.LessonId, ct);

        var sectionsProgress = course.Sections.Select(s => new SectionProgressDto
        {
            Id = s.Id,
            Title = s.Title,
            DisplayOrder = s.DisplayOrder,
            Lessons = s.Lessons.Select(l =>
            {
                progresses.TryGetValue(l.Id, out var p);
                return new LessonProgressItemDto
                {
                    Id = l.Id,
                    SectionId = l.SectionId,
                    Title = l.Title,
                    DisplayOrder = l.DisplayOrder,
                    Type = l.Type,
                    DurationSeconds = l.DurationSeconds,
                    IsPreviewFree = l.IsPreviewFree,
                    Status = p?.Status ?? LessonProgressStatus.NotStarted,
                    WatchedDurationSeconds = p?.WatchedDurationSeconds ?? 0,
                    IsCompleted = p?.Status == LessonProgressStatus.Completed,
                    CompletedAtUtc = p?.CompletedAtUtc
                };
            }).ToList()
        }).ToList();

        var totalLessons = lessonIds.Count;
        var completedLessons = progresses.Values.Count(p => p.Status == LessonProgressStatus.Completed);
        var progressPercentage = totalLessons > 0 ? Math.Round((double)completedLessons / totalLessons * 100.0, 2) : 100.0;

        var isCourseCompleted = enrollment?.Status == EnrollmentStatus.Completed || (progressPercentage >= 100.0 && totalLessons > 0);

        return new CourseLearningProgressDto
        {
            CourseId = course.Id,
            CourseTitle = course.Title,
            Status = isCourseCompleted ? EnrollmentStatus.Completed : (enrollment?.Status ?? EnrollmentStatus.Active),
            ProgressPercentage = progressPercentage,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessons,
            EnrolledAtUtc = enrollment?.EnrolledAtUtc ?? DateTime.UtcNow,
            LastAccessedAtUtc = enrollment?.LastAccessedAtUtc,
            CompletedAtUtc = enrollment?.CompletedAtUtc ?? (isCourseCompleted ? DateTime.UtcNow : null),
            Sections = sectionsProgress
        };
    }

    public async Task<ContinueLearningDto> GetContinueLearningAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .Include(c => c.Sections.OrderBy(s => s.DisplayOrder))
                .ThenInclude(s => s.Lessons.OrderBy(l => l.DisplayOrder))
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        var enrollment = await _context.Enrollments
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);

        if (enrollment == null && !_currentUserService.IsInRole("Admin") && course.InstructorId != userId)
        {
            throw new UnauthorizedAccessException("You must be enrolled in this course to continue learning.");
        }

        var allLessons = course.Sections
            .SelectMany(s => s.Lessons.Select(l => new { Lesson = l, Section = s }))
            .ToList();

        if (!allLessons.Any())
        {
            throw new InvalidOperationException("This course does not have any lessons yet.");
        }

        var lessonIds = allLessons.Select(x => x.Lesson.Id).ToList();
        var progresses = await _context.LessonProgresses
            .AsNoTracking()
            .Where(lp => lp.UserId == userId && lessonIds.Contains(lp.LessonId))
            .ToDictionaryAsync(lp => lp.LessonId, ct);

        // Find candidate lesson to continue:
        // Priority 1: An in-progress lesson (partially watched)
        var inProgressItem = allLessons.FirstOrDefault(x =>
            progresses.TryGetValue(x.Lesson.Id, out var p) && p.Status == LessonProgressStatus.InProgress);

        // Priority 2: First uncompleted lesson
        var uncompletedItem = allLessons.FirstOrDefault(x =>
            !progresses.TryGetValue(x.Lesson.Id, out var p) || p.Status != LessonProgressStatus.Completed);

        var target = inProgressItem ?? uncompletedItem ?? allLessons.Last();
        progresses.TryGetValue(target.Lesson.Id, out var targetProgress);

        return new ContinueLearningDto
        {
            CourseId = course.Id,
            CourseTitle = course.Title,
            LessonId = target.Lesson.Id,
            LessonTitle = target.Lesson.Title,
            SectionId = target.Section.Id,
            SectionTitle = target.Section.Title,
            WatchedDurationSeconds = targetProgress?.WatchedDurationSeconds ?? 0,
            DurationSeconds = target.Lesson.DurationSeconds,
            CourseProgressPercentage = enrollment?.ProgressPercentage ?? 0
        };
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> GetVideoStreamAsync(
        string userId,
        int lessonId,
        CancellationToken ct = default)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Section)
                .ThenInclude(s => s.Course)
            .FirstOrDefaultAsync(l => l.Id == lessonId, ct)
            ?? throw new NotFoundException(nameof(Lesson), lessonId);

        await ValidateLessonAccessAsync(lesson, userId, ct);

        if (string.IsNullOrEmpty(lesson.VideoUrl))
        {
            throw new NotFoundException("Video stream for lesson", lessonId);
        }

        var fileResult = await _fileStorageService.GetFileStreamAsync(lesson.VideoUrl, ct)
            ?? throw new NotFoundException("Physical video file", lessonId);

        return fileResult;
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> GetResourceFileAsync(
        string userId,
        int resourceId,
        CancellationToken ct = default)
    {
        var resource = await _context.CourseResources
            .Include(r => r.Course)
            .FirstOrDefaultAsync(r => r.Id == resourceId, ct)
            ?? throw new NotFoundException(nameof(CourseResource), resourceId);

        // Permission check
        var isEnrolled = await _context.Enrollments.AnyAsync(e =>
            e.UserId == userId &&
            e.CourseId == resource.CourseId &&
            (e.Status == EnrollmentStatus.Active || e.Status == EnrollmentStatus.Completed), ct);

        var isInstructor = resource.Course.InstructorId == userId;
        var isAdmin = _currentUserService.IsInRole("Admin");

        if (!isEnrolled && !isInstructor && !isAdmin)
        {
            throw new UnauthorizedAccessException("You do not have access to this downloadable resource. An active enrollment is required.");
        }

        if (string.IsNullOrEmpty(resource.FileUrl))
        {
            throw new NotFoundException("Downloadable resource file", resourceId);
        }

        var fileResult = await _fileStorageService.GetFileStreamAsync(resource.FileUrl, ct)
            ?? throw new NotFoundException("Physical resource file", resourceId);

        return fileResult;
    }
}
