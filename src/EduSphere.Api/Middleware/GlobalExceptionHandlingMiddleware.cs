using System.Net;
using System.Text.Json;
using EduSphere.Application.Common.Exceptions;
using EduSphere.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace EduSphere.Api.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var problemDetails = exception switch
        {
            ValidationException validationEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Validation Error",
                Detail = validationEx.Message,
                Extensions = { ["errors"] = validationEx.Errors }
            },
            NotFoundException notFoundEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.NotFound,
                Title = "Resource Not Found",
                Detail = notFoundEx.Message
            },
            DomainException domainEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Domain Rule Violation",
                Detail = domainEx.Message
            },
            UnauthorizedAccessException unauthorizedEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.Forbidden,
                Title = "Forbidden",
                Detail = unauthorizedEx.Message
            },
            InvalidOperationException invalidOpEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Invalid Operation",
                Detail = invalidOpEx.Message
            },
            ArgumentException argEx => new ProblemDetails
            {
                Status = (int)HttpStatusCode.BadRequest,
                Title = "Invalid Argument",
                Detail = argEx.Message
            },
            _ => new ProblemDetails
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred while processing your request."
            }
        };

        context.Response.StatusCode = problemDetails.Status ?? (int)HttpStatusCode.InternalServerError;
        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}

