using EduSphere.Application.Certificates.Dtos;
using EduSphere.Application.Certificates.Interfaces;
using EduSphere.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificateService;
    private readonly ICurrentUserService _currentUserService;

    public CertificatesController(
        ICertificateService certificateService,
        ICurrentUserService currentUserService)
    {
        _certificateService = certificateService;
        _currentUserService = currentUserService;
    }

    private string CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    /// <summary>
    /// Student claims certificate after completing course
    /// </summary>
    [HttpPost("courses/{courseId:int}/claim")]
    [Authorize]
    public async Task<ActionResult<CertificateDto>> ClaimCertificate(int courseId, CancellationToken ct)
    {
        var cert = await _certificateService.GenerateCertificateAsync(CurrentUserId, courseId, ct);
        return Ok(cert);
    }

    /// <summary>
    /// Get certificate for a specific course for the authenticated student
    /// </summary>
    [HttpGet("courses/{courseId:int}")]
    [Authorize]
    public async Task<ActionResult<CertificateDto>> GetCourseCertificate(int courseId, CancellationToken ct)
    {
        var cert = await _certificateService.GetCertificateAsync(CurrentUserId, courseId, ct);
        if (cert == null) return NotFound(new { message = "Certificate not found or not yet earned." });
        return Ok(cert);
    }

    /// <summary>
    /// View all certificates earned by the authenticated student
    /// </summary>
    [HttpGet("my-certificates")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<CertificateDto>>> GetMyCertificates(CancellationToken ct)
    {
        var certs = await _certificateService.GetUserCertificatesAsync(CurrentUserId, ct);
        return Ok(certs);
    }

    /// <summary>
    /// Public verification endpoint: verify authenticity of any certificate by its unique ID
    /// </summary>
    [HttpGet("verify/{certificateNumber}")]
    [AllowAnonymous]
    public async Task<ActionResult<CertificateVerificationDto>> Verify(string certificateNumber, CancellationToken ct)
    {
        var result = await _certificateService.VerifyCertificateAsync(certificateNumber, ct);
        if (result == null || !result.IsValid)
        {
            return NotFound(new { isValid = false, message = "Certificate number not found or invalid." });
        }

        return Ok(result);
    }

    /// <summary>
    /// Download officially verified PDF certificate
    /// </summary>
    [HttpGet("{certificateNumber}/download")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadPdf(string certificateNumber, CancellationToken ct)
    {
        var (pdfBytes, fileName) = await _certificateService.GeneratePdfCertificateAsync(certificateNumber, ct);
        return File(pdfBytes, "application/pdf", fileName);
    }
}

