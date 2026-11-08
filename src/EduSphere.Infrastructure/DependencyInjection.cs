using EduSphere.Application.Certificates.Interfaces;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Courses.Interfaces;
using EduSphere.Application.Enrollments.Interfaces;
using EduSphere.Application.Learning.Interfaces;
using EduSphere.Application.Notifications.Interfaces;
using EduSphere.Application.Payments.Interfaces;
using EduSphere.Application.Reviews.Interfaces;
using EduSphere.Application.Wishlist.Interfaces;
using EduSphere.Infrastructure.Identity;
using EduSphere.Infrastructure.Persistence;
using EduSphere.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EduSphere.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(connectionString, b =>
                b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            options.ConfigureWarnings(w =>
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // ASP.NET Core Identity configuration
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            // Password policy
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 8;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;

            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User settings
            options.User.RequireUniqueEmail = true;

            // Sign-in settings
            options.SignIn.RequireConfirmedEmail = false; // Set true in production
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        // Application service registrations
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<ISectionLessonService, SectionLessonService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IEnrollmentService, EnrollmentService>();
        services.AddScoped<ILearningService, LearningService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IPaymentGateway, MockPaymentGateway>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<ICertificateService, CertificateService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<IWishlistService, WishlistService>();

        return services;
    }
}
