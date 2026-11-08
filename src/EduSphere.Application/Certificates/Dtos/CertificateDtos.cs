namespace EduSphere.Application.Certificates.Dtos;

public class CertificateDto
{
    public int Id { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public DateTime IssuedAtUtc { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
    public string VerificationUrl { get; set; } = string.Empty;
}

public class CertificateVerificationDto
{
    public bool IsValid { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public DateTime IssuedAtUtc { get; set; }
    public string VerificationMessage { get; set; } = string.Empty;
}

