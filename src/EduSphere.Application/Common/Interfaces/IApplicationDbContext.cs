using EduSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace EduSphere.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DatabaseFacade Database { get; }

    DbSet<Category> Categories { get; }
    DbSet<Course> Courses { get; }
    DbSet<Section> Sections { get; }
    DbSet<Lesson> Lessons { get; }
    DbSet<Enrollment> Enrollments { get; }
    DbSet<LessonProgress> LessonProgresses { get; }
    DbSet<Review> Reviews { get; }
    DbSet<EduSphere.Domain.Entities.Wishlist> Wishlists { get; }
    DbSet<Order> Orders { get; }
    DbSet<Payment> Payments { get; }
    DbSet<Certificate> Certificates { get; }
    DbSet<CourseResource> CourseResources { get; }
    DbSet<Notification> Notifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
