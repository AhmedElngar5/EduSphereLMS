# EduSphere LMS – Database Entity Relationship Diagram (ERD)

This document details the relational data model for **EduSphere LMS**, implemented using **Entity Framework Core 10** with Fluent API configurations targeting **Microsoft SQL Server**.

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    APPLICATION_USER ||--o{ COURSE : "teaches (InstructorId)"
    APPLICATION_USER ||--o{ ENROLLMENT : "enrolls (UserId)"
    APPLICATION_USER ||--o{ ORDER : "places (UserId)"
    APPLICATION_USER ||--o{ REVIEW : "writes (UserId)"
    APPLICATION_USER ||--o{ WISHLIST : "saves (UserId)"
    APPLICATION_USER ||--o{ CERTIFICATE : "earns (UserId)"
    APPLICATION_USER ||--o{ NOTIFICATION : "receives (UserId)"
    APPLICATION_USER ||--o{ LESSON_PROGRESS : "tracks (UserId)"

    CATEGORY ||--o{ COURSE : "categorizes (CategoryId)"
    CATEGORY ||--o{ CATEGORY : "sub-categorizes (ParentCategoryId)"

    COURSE ||--|{ SECTION : "contains (CourseId)"
    COURSE ||--o{ ENROLLMENT : "enrolled_in (CourseId)"
    COURSE ||--o{ ORDER : "purchased_in (CourseId)"
    COURSE ||--o{ REVIEW : "rated_by (CourseId)"
    COURSE ||--o{ WISHLIST : "wishlisted_in (CourseId)"
    COURSE ||--o{ CERTIFICATE : "certifies (CourseId)"
    COURSE ||--o{ COURSE_RESOURCE : "attaches (CourseId)"

    SECTION ||--|{ LESSON : "groups (SectionId)"

    LESSON ||--o{ LESSON_PROGRESS : "records (LessonId)"
    LESSON ||--o{ COURSE_RESOURCE : "includes (LessonId)"

    ORDER ||--o| PAYMENT : "settled_by (OrderId)"
    ORDER ||--o| ENROLLMENT : "originates (OrderId)"

    APPLICATION_USER {
        string Id PK
        string Email
        string FirstName
        string LastName
        string Headline
        string ProfilePictureUrl
        string Bio
        bool IsActive
        datetime CreatedAtUtc
    }

    CATEGORY {
        int Id PK
        string Name
        string Slug
        string Description
        int DisplayOrder
        int ParentCategoryId FK
    }

    COURSE {
        int Id PK
        string Title
        string Slug
        string ShortDescription
        string Description
        string InstructorId FK
        int CategoryId FK
        int Level "AllLevels|Beginner|Intermediate|Advanced"
        int Status "Draft|PendingApproval|Approved|Published|Rejected|Archived"
        decimal Price
        decimal DiscountPrice
        bool IsFree
        int TotalDurationSeconds
        int TotalLessons
        int EnrolledCount
        float AverageRating
        int TotalReviews
        datetime CreatedAtUtc
    }

    SECTION {
        int Id PK
        int CourseId FK
        string Title
        string Description
        int DisplayOrder
    }

    LESSON {
        int Id PK
        int SectionId FK
        string Title
        string Description
        int Type "Video|Article|Quiz|Assignment"
        int DisplayOrder
        bool IsPreviewFree
        int DurationSeconds
        string VideoStoragePath
        string VideoStreamUrl
        string ContentHtml
    }

    ENROLLMENT {
        int Id PK
        string UserId FK
        int CourseId FK
        int OrderId FK
        int Status "Active|Completed|Dropped|Expired"
        decimal PricePaid
        float ProgressPercentage
        datetime EnrolledAtUtc
        datetime CompletedAtUtc
    }

    LESSON_PROGRESS {
        int Id PK
        string UserId FK
        int LessonId FK
        int Status "NotStarted|InProgress|Completed"
        int WatchedDurationSeconds
        bool IsCompleted
        datetime CompletedAtUtc
    }

    ORDER {
        int Id PK
        string UserId FK
        int CourseId FK
        int Status "Pending|Completed|Cancelled|Refunded"
        decimal SubTotal
        decimal DiscountAmount
        decimal TaxAmount
        decimal TotalAmount
        string CouponCode
        datetime CreatedAtUtc
    }

    PAYMENT {
        int Id PK
        int OrderId FK
        int Status "Pending|Succeeded|Failed|Refunded"
        decimal Amount
        string Currency
        string PaymentGateway
        string GatewayTransactionId
        string ReceiptUrl
        string FailureReason
        datetime PaidAtUtc
        datetime CreatedAtUtc
    }

    CERTIFICATE {
        int Id PK
        string CertificateNumber UK
        string UserId FK
        int CourseId FK
        string StudentName
        string CourseTitle
        string InstructorName
        datetime IssuedAtUtc
        string PdfStoragePath
    }

    REVIEW {
        int Id PK
        string UserId FK
        int CourseId FK
        int Rating "1 to 5"
        string Comment
        datetime CreatedAtUtc
    }

    WISHLIST {
        int Id PK
        string UserId FK
        int CourseId FK
        datetime CreatedAtUtc
    }

    COURSE_RESOURCE {
        int Id PK
        int CourseId FK
        int LessonId FK
        string Title
        int Type "Document|SourceCode|Exercise|ExternalLink"
        string FileStoragePath
        string ExternalUrl
        long FileSizeBytes
    }

    NOTIFICATION {
        int Id PK
        string UserId FK
        string Title
        string Message
        int Type
        bool IsRead
        datetime CreatedAtUtc
    }
```

---

## 2. Key Database Constraints & Rules

1. **Unique Index on Enrollments**: `(UserId, CourseId)` prevents duplicate student registrations in the same course.
2. **Unique Index on Reviews**: `(UserId, CourseId)` ensures a student can review a course at most once.
3. **Unique Index on Wishlists**: `(UserId, CourseId)` prevents duplicate course entries in a wishlist.
4. **Unique Index on Certificate**: `CertificateNumber` guarantees verifiable, collision-free certificates.
5. **Precision on Currency Values**: All monetary amounts (`Price`, `TotalAmount`, `SubTotal`, `Amount`) use `decimal(18,2)`.
6. **Safe Storage**: Video files, PDF certificates, and downloadable attachments store file metadata and local/cloud storage URIs, keeping binary BLOBs out of SQL Server engine memory.

