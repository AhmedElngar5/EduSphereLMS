namespace EduSphere.Application.Common.Interfaces;

public enum FileCategory
{
    Thumbnail,
    Video,
    Resource,
    Document
}

public record FileUploadResult(
    string RelativeUrl,
    string StorageKey,
    string OriginalFileName,
    string FileExtension,
    long FileSizeBytes
);

public interface IFileStorageService
{
    Task<FileUploadResult> SaveFileAsync(
        Stream stream,
        string originalFileName,
        string contentType,
        FileCategory category,
        CancellationToken cancellationToken = default);

    Task DeleteFileAsync(string relativeUrlOrKey, CancellationToken cancellationToken = default);

    Task<(Stream Stream, string ContentType, string FileName)?> GetFileStreamAsync(
        string relativeUrlOrKey,
        CancellationToken cancellationToken = default);
}

