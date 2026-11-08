using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace EduSphere.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;

    private static readonly Dictionary<FileCategory, (string[] Extensions, string[] ContentTypes, long MaxBytes)> AllowedRules = new()
    {
        [FileCategory.Thumbnail] = (
            new[] { ".jpg", ".jpeg", ".png", ".webp" },
            new[] { "image/jpeg", "image/png", "image/webp" },
            5 * 1024 * 1024 // 5 MB
        ),
        [FileCategory.Video] = (
            new[] { ".mp4", ".webm", ".mov", ".mkv" },
            new[] { "video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "application/octet-stream" },
            500 * 1024 * 1024 // 500 MB
        ),
        [FileCategory.Resource] = (
            new[] { ".pdf", ".docx", ".xlsx", ".zip", ".txt", ".pptx" },
            new[] {
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/zip",
                "application/x-zip-compressed",
                "text/plain",
                "application/octet-stream"
            },
            25 * 1024 * 1024 // 25 MB
        ),
        [FileCategory.Document] = (
            new[] { ".pdf", ".txt", ".docx" },
            new[] { "application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            10 * 1024 * 1024 // 10 MB
        )
    };

    public FileStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<FileUploadResult> SaveFileAsync(
        Stream stream,
        string originalFileName,
        string contentType,
        FileCategory category,
        CancellationToken cancellationToken = default)
    {
        if (stream == null || stream.Length == 0)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["File"] = ["The uploaded file is empty."]
            });
        }

        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["File"] = ["File extension is required."]
            });
        }

        if (!AllowedRules.TryGetValue(category, out var rules))
        {
            throw new InvalidOperationException($"No upload rules configured for category: {category}");
        }

        // Validate extension
        if (!rules.Extensions.Contains(ext))
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["File"] = [$"File type '{ext}' is not allowed for {category}. Allowed types: {string.Join(", ", rules.Extensions)}"]
            });
        }

        // Validate size
        if (stream.Length > rules.MaxBytes)
        {
            var maxMb = rules.MaxBytes / (1024 * 1024);
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["File"] = [$"File size ({stream.Length / (1024 * 1024)}MB) exceeds maximum permitted limit of {maxMb}MB."]
            });
        }

        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var folderName = category switch
        {
            FileCategory.Thumbnail => "thumbnails",
            FileCategory.Video => "videos",
            FileCategory.Resource => "resources",
            _ => "documents"
        };

        var targetDir = Path.Combine(webRoot, "uploads", folderName);
        Directory.CreateDirectory(targetDir);

        var safeFileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(targetDir, safeFileName);

        using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            if (stream.CanSeek)
            {
                stream.Seek(0, SeekOrigin.Begin);
            }
            await stream.CopyToAsync(fileStream, cancellationToken);
        }

        var relativeUrl = $"/uploads/{folderName}/{safeFileName}";
        var storageKey = $"uploads/{folderName}/{safeFileName}";

        return new FileUploadResult(
            RelativeUrl: relativeUrl,
            StorageKey: storageKey,
            OriginalFileName: Path.GetFileName(originalFileName),
            FileExtension: ext,
            FileSizeBytes: stream.Length
        );
    }

    public Task DeleteFileAsync(string relativeUrlOrKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(relativeUrlOrKey))
        {
            return Task.CompletedTask;
        }

        try
        {
            var cleanPath = relativeUrlOrKey.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var fullPath = Path.Combine(webRoot, cleanPath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch
        {
            // Suppress errors during file cleanup to prevent failure cascades
        }

        return Task.CompletedTask;
    }

    public Task<(Stream Stream, string ContentType, string FileName)?> GetFileStreamAsync(
        string relativeUrlOrKey,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(relativeUrlOrKey))
        {
            return Task.FromResult<(Stream Stream, string ContentType, string FileName)?>(null);
        }

        var cleanPath = relativeUrlOrKey.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var fullPath = Path.Combine(webRoot, cleanPath);

        if (!File.Exists(fullPath))
        {
            return Task.FromResult<(Stream Stream, string ContentType, string FileName)?>(null);
        }

        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".mov" => "video/quicktime",
            ".mkv" => "video/x-matroska",
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".zip" => "application/zip",
            ".txt" => "text/plain",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<(Stream Stream, string ContentType, string FileName)?>((stream, contentType, Path.GetFileName(fullPath)));
    }
}

