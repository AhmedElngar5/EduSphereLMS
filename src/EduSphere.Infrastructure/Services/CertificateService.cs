using System.Text;
using EduSphere.Application.Certificates.Dtos;
using EduSphere.Application.Certificates.Interfaces;
using EduSphere.Application.Common.Exceptions;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Notifications.Interfaces;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Infrastructure.Services;

public class CertificateService : ICertificateService
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public CertificateService(
        IApplicationDbContext context,
        INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<CertificateDto> GenerateCertificateAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var course = await _context.Courses
            .Include(c => c.Sections)
                .ThenInclude(s => s.Lessons)
            .FirstOrDefaultAsync(c => c.Id == courseId, ct)
            ?? throw new NotFoundException(nameof(Course), courseId);

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId, ct);

        if (enrollment == null)
        {
            throw new UnauthorizedAccessException("You must be enrolled in this course to claim a certificate.");
        }

        // Verify all required lessons are completed
        var allLessonIds = course.Sections.SelectMany(s => s.Lessons).Select(l => l.Id).ToList();
        var completedLessonsCount = await _context.LessonProgresses
            .Where(lp => lp.UserId == userId && allLessonIds.Contains(lp.LessonId) && lp.Status == LessonProgressStatus.Completed)
            .CountAsync(ct);

        var isFullyCompleted = allLessonIds.Count > 0 && completedLessonsCount >= allLessonIds.Count;

        if (!isFullyCompleted && enrollment.ProgressPercentage < 100.0 && enrollment.Status != EnrollmentStatus.Completed)
        {
            throw new InvalidOperationException($"Cannot generate certificate. You have completed {completedLessonsCount} of {allLessonIds.Count} lessons.");
        }

        // Check if certificate already exists (prevent duplicates)
        var existingCert = await _context.Certificates
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == courseId, ct);

        if (existingCert != null)
        {
            return await MapToCertificateDtoAsync(existingCert, ct);
        }

        var certNumber = $"CERT-{DateTime.UtcNow:yyyyMM}-{Guid.NewGuid():N}"[..22].ToUpperInvariant();

        var cert = new Certificate
        {
            UserId = userId,
            CourseId = courseId,
            CertificateNumber = certNumber,
            IssuedAtUtc = DateTime.UtcNow,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Certificates.Add(cert);

        // Ensure enrollment is marked completed
        enrollment.Status = EnrollmentStatus.Completed;
        enrollment.ProgressPercentage = 100.0;
        enrollment.CompletedAtUtc ??= DateTime.UtcNow;

        await _notificationService.CreateNotificationAsync(
            userId,
            NotificationType.CertificateIssued,
            "Certificate Earned!",
            $"Congratulations! Your official certificate of completion for '{course.Title}' is now available.",
            actionUrl: $"/certificates/{certNumber}",
            ct: ct);

        await _context.SaveChangesAsync(ct);

        return await MapToCertificateDtoAsync(cert, ct);
    }

    public async Task<CertificateDto?> GetCertificateAsync(string userId, int courseId, CancellationToken ct = default)
    {
        var cert = await _context.Certificates
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.UserId == userId && c.CourseId == courseId, ct);

        if (cert == null) return null;
        return await MapToCertificateDtoAsync(cert, ct);
    }

    public async Task<IReadOnlyList<CertificateDto>> GetUserCertificatesAsync(string userId, CancellationToken ct = default)
    {
        var certs = await _context.Certificates
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.IssuedAtUtc)
            .ToListAsync(ct);

        var result = new List<CertificateDto>();
        foreach (var c in certs)
        {
            result.Add(await MapToCertificateDtoAsync(c, ct));
        }

        return result;
    }

    public async Task<CertificateVerificationDto?> VerifyCertificateAsync(string certificateNumber, CancellationToken ct = default)
    {
        var cert = await _context.Certificates
            .AsNoTracking()
            .Include(c => c.Course)
            .FirstOrDefaultAsync(c => c.CertificateNumber == certificateNumber.Trim(), ct);

        if (cert == null)
        {
            return new CertificateVerificationDto
            {
                IsValid = false,
                CertificateNumber = certificateNumber,
                VerificationMessage = "Certificate number not found or invalid."
            };
        }

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [cert.Course.InstructorId, cert.UserId], ct);

        var student = instructors.GetValueOrDefault(cert.UserId);
        var instructor = instructors.GetValueOrDefault(cert.Course.InstructorId);

        return new CertificateVerificationDto
        {
            IsValid = true,
            CertificateNumber = cert.CertificateNumber,
            StudentName = student?.FullName ?? "Student",
            CourseTitle = cert.Course.Title,
            InstructorName = instructor?.FullName ?? "Instructor",
            IssuedAtUtc = cert.IssuedAtUtc,
            VerificationMessage = "Authentic EduSphere Verified Credential."
        };
    }

    public async Task<(byte[] PdfBytes, string FileName)> GeneratePdfCertificateAsync(string certificateNumber, CancellationToken ct = default)
    {
        var cert = await _context.Certificates
            .AsNoTracking()
            .Include(c => c.Course)
            .FirstOrDefaultAsync(c => c.CertificateNumber == certificateNumber.Trim(), ct)
            ?? throw new NotFoundException(nameof(Certificate), certificateNumber);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [cert.Course.InstructorId, cert.UserId], ct);

        var studentName = instructors.GetValueOrDefault(cert.UserId)?.FullName ?? "Student";
        var instructorName = instructors.GetValueOrDefault(cert.Course.InstructorId)?.FullName ?? "Lead Instructor";

        var pdfBytes = BuildPdfCertificate(cert.CertificateNumber, studentName, cert.Course.Title, instructorName, cert.IssuedAtUtc);
        return (pdfBytes, $"{cert.CertificateNumber}.pdf");
    }

    private async Task<CertificateDto> MapToCertificateDtoAsync(Certificate cert, CancellationToken ct)
    {
        var course = cert.Course ?? await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == cert.CourseId, ct);

        var instructors = await _context.Database.GetDbConnection()
            .QueryInstructorsAsync(_context, [course?.InstructorId ?? string.Empty, cert.UserId], ct);

        var studentName = instructors.GetValueOrDefault(cert.UserId)?.FullName ?? "Student";
        var instructorName = instructors.GetValueOrDefault(course?.InstructorId ?? string.Empty)?.FullName ?? "Instructor";

        return new CertificateDto
        {
            Id = cert.Id,
            CertificateNumber = cert.CertificateNumber,
            CourseId = cert.CourseId,
            CourseTitle = course?.Title ?? string.Empty,
            StudentName = studentName,
            InstructorName = instructorName,
            IssuedAtUtc = cert.IssuedAtUtc,
            DownloadUrl = $"/api/certificates/{cert.CertificateNumber}/download",
            VerificationUrl = $"/api/certificates/verify/{cert.CertificateNumber}"
        };
    }

    private static byte[] BuildPdfCertificate(
        string certificateNumber,
        string studentName,
        string courseTitle,
        string instructorName,
        DateTime issuedAtUtc)
    {
        var cleanStudent = SanitizePdf(studentName);
        var cleanCourse = SanitizePdf(courseTitle);
        var cleanInstructor = SanitizePdf(instructorName);
        var dateStr = issuedAtUtc.ToString("MMMM dd, yyyy");

        // Construct a standard, clean PDF 1.4 document
        var streamContent = $@"BT
/F1 28 Tf
100 520 Td
(CERTIFICATE OF COMPLETION) Tj
ET
BT
/F2 14 Tf
100 470 Td
(This is proudly presented to:) Tj
ET
BT
/F1 24 Tf
100 430 Td
({cleanStudent}) Tj
ET
BT
/F2 14 Tf
100 380 Td
(For successfully completing all requirements for the course:) Tj
ET
BT
/F1 18 Tf
100 340 Td
({cleanCourse}) Tj
ET
BT
/F2 12 Tf
100 270 Td
(Lead Instructor: {cleanInstructor}) Tj
ET
BT
/F2 12 Tf
100 240 Td
(Issued on: {dateStr}) Tj
ET
BT
/F2 11 Tf
100 200 Td
(Certificate ID: {certificateNumber}) Tj
ET
BT
/F2 10 Tf
100 160 Td
(Verified by EduSphere LMS - Learning Management System) Tj
ET";

        var streamBytes = Encoding.ASCII.GetBytes(streamContent);
        var streamLen = streamBytes.Length;

        var sb = new StringBuilder();
        sb.Append("%PDF-1.4\n");
        sb.Append("%\xE2\xE3\xCF\xD3\n");

        var offsets = new List<long>();

        // Obj 1: Catalog
        offsets.Add(Encoding.ASCII.GetByteCount(sb.ToString()));
        sb.Append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

        // Obj 2: Pages
        offsets.Add(Encoding.ASCII.GetByteCount(sb.ToString()));
        sb.Append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

        // Obj 3: Page (Landscape 792x612 Standard Letter)
        offsets.Add(Encoding.ASCII.GetByteCount(sb.ToString()));
        sb.Append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 792 612] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n");

        // Obj 4: Content Stream
        offsets.Add(Encoding.ASCII.GetByteCount(sb.ToString()));
        sb.Append($"4 0 obj\n<< /Length {streamLen} >>\nstream\n");
        sb.Append(streamContent);
        sb.Append("\nendstream\nendobj\n");

        // Obj 5: Font F1 (Helvetica-Bold)
        offsets.Add(Encoding.ASCII.GetByteCount(sb.ToString()));
        sb.Append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n");

        // Obj 6: Font F2 (Helvetica)
        offsets.Add(Encoding.ASCII.GetByteCount(sb.ToString()));
        sb.Append("6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

        // XRef Table
        var xrefStart = Encoding.ASCII.GetByteCount(sb.ToString());
        sb.Append("xref\n0 7\n");
        sb.Append("0000000000 65535 f \n");
        foreach (var offset in offsets)
        {
            sb.Append($"{offset:D10} 00000 n \n");
        }

        // Trailer
        sb.Append("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n");
        sb.Append(xrefStart);
        sb.Append("\n%%EOF\n");

        return Encoding.ASCII.GetBytes(sb.ToString());
    }

    private static string SanitizePdf(string text)
    {
        return text.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
    }
}

