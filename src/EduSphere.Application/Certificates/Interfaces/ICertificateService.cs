using EduSphere.Application.Certificates.Dtos;

namespace EduSphere.Application.Certificates.Interfaces;

public interface ICertificateService
{
    Task<CertificateDto> GenerateCertificateAsync(string userId, int courseId, CancellationToken ct = default);
    Task<CertificateDto?> GetCertificateAsync(string userId, int courseId, CancellationToken ct = default);
    Task<IReadOnlyList<CertificateDto>> GetUserCertificatesAsync(string userId, CancellationToken ct = default);
    Task<CertificateVerificationDto?> VerifyCertificateAsync(string certificateNumber, CancellationToken ct = default);
    Task<(byte[] PdfBytes, string FileName)> GeneratePdfCertificateAsync(string certificateNumber, CancellationToken ct = default);
}

