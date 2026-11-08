using Microsoft.Extensions.DependencyInjection;

namespace EduSphere.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Application layer service registrations (e.g., MediatR, FluentValidation, Mappings)
        return services;
    }
}

