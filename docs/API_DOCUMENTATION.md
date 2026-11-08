# EduSphere LMS – REST API Endpoints Reference

All endpoints are hosted at `/api` and return standardized JSON payloads adhering to standard HTTP status codes.

---

## 1. Authentication & Identity (`/api/auth`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Anonymous | Register a new Student or Instructor account (Admin prohibited) |
| `POST` | `/api/auth/login` | Anonymous | Authenticate and obtain JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role claims |
| `POST` | `/api/auth/seed` | Anonymous | Development seed data generator |

---

## 2. Public Courses & Categories (`/api/courses`, `/api/categories`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Anonymous | Browse paginated published courses with filters |
| `GET` | `/api/courses/{slug}` | Anonymous | Get public course details, curriculum, and reviews |
| `GET` | `/api/categories` | Anonymous | List all course categories with subcategory trees |
| `GET` | `/api/categories/{id}` | Anonymous | Get single category details |

---

## 3. Student Enrollment & Learning (`/api/enrollments`, `/api/learning`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/enrollments/courses/{courseId}` | Authenticated | Enroll in a free course or attach completed order |
| `GET` | `/api/enrollments/my-courses` | Authenticated | List all courses the authenticated student is enrolled in |
| `GET` | `/api/enrollments/courses/{courseId}/status` | Authenticated | Check enrollment and progress status for a course |
| `GET` | `/api/learning/courses/{courseId}/lessons/{lessonId}` | Enrolled Student | Access protected lesson content and video metadata |
| `POST` | `/api/learning/lessons/{lessonId}/progress` | Enrolled Student | Save video playback position and progress |
| `POST` | `/api/learning/lessons/{lessonId}/complete` | Enrolled Student | Mark lesson as completed and calculate course progress |
| `GET` | `/api/learning/courses/{courseId}/progress` | Enrolled Student | Get full section-by-section completion progress |
| `GET` | `/api/learning/courses/{courseId}/continue` | Enrolled Student | Retrieve the next lesson to resume |
| `GET` | `/api/learning/lessons/{lessonId}/video-stream` | Enrolled Student | Secure video stream with HTTP 206 Partial Content |
| `GET` | `/api/learning/resources/{resourceId}/download` | Enrolled Student | Securely download attached lesson resource file |

---

## 4. Mock Payments & Orders (`/api/payments`, `/api/orders`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/checkout` | Authenticated | Initiate course checkout; creates `Order` and `Payment` |
| `POST` | `/api/payments/{paymentId}/simulate-success` | Authenticated | Simulate gateway approval & auto-enroll student |
| `POST` | `/api/payments/{paymentId}/simulate-failure` | Authenticated | Simulate card decline or gateway failure |
| `GET` | `/api/payments/{paymentId}/status` | Authenticated | Poll payment processing status |
| `GET` | `/api/orders/my-orders` | Authenticated | Student checkout order history |
| `GET` | `/api/payments/my-payments` | Authenticated | Student payment transaction records |
| `GET` | `/api/payments/instructor/earnings` | Instructor / Admin | Instructor gross sales and 80% net payout summary |
| `GET` | `/api/payments/admin/report` | Admin | Administrative platform-wide financial report |

---

## 5. Certificates (`/api/certificates`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/certificates/courses/{courseId}/claim` | Enrolled Student | Claim certificate after completing 100% of lessons |
| `GET` | `/api/certificates/courses/{courseId}` | Enrolled Student | Retrieve earned course certificate |
| `GET` | `/api/certificates/my-certificates` | Authenticated | View all certificates earned by the authenticated user |
| `GET` | `/api/certificates/verify/{certificateNumber}`| Anonymous | Public certificate verification endpoint |
| `GET` | `/api/certificates/{certificateNumber}/download`| Anonymous | Download officially generated PDF certificate |

---

## 6. Reviews & Wishlist (`/api/reviews`, `/api/wishlist`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses/{courseId}/reviews` | Anonymous | Get all verified reviews for a course |
| `GET` | `/api/courses/{courseId}/reviews/my-review` | Enrolled Student | Get authenticated student's review for a course |
| `POST` | `/api/courses/{courseId}/reviews` | Enrolled Student | Submit 1–5 star rating and review |
| `PUT` | `/api/reviews/{reviewId}` | Review Author | Update existing review |
| `DELETE`| `/api/reviews/{reviewId}` | Review Author | Remove review |
| `GET` | `/api/wishlist` | Authenticated | Get current student's saved wishlist |
| `POST` | `/api/wishlist/courses/{courseId}` | Authenticated | Save course to wishlist |
| `DELETE`| `/api/wishlist/courses/{courseId}` | Authenticated | Remove course from wishlist |
| `GET` | `/api/wishlist/courses/{courseId}/status` | Authenticated | Check if course is in user's wishlist |

---

## 7. Notifications (`/api/notifications`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Authenticated | List user notifications (with unread filter) |
| `GET` | `/api/notifications/unread-count` | Authenticated | Get count of unread notifications |
| `POST` | `/api/notifications/{id}/read` | Authenticated | Mark a single notification as read |
| `POST` | `/api/notifications/mark-all-read` | Authenticated | Mark all notifications as read |

---

## 8. Instructor Studio (`/api/instructor`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/instructor/dashboard` | Instructor / Admin | Instructor KPIs, earnings, trend charts, and enrollments |
| `GET` | `/api/instructor/courses` | Instructor / Admin | List courses authored by authenticated instructor |
| `GET` | `/api/instructor/courses/{id}` | Instructor / Admin | Get full course details including sections & lessons |
| `POST` | `/api/instructor/courses` | Instructor / Admin | Create a new course in `Draft` status |
| `PUT` | `/api/instructor/courses/{id}` | Course Author | Update course metadata, pricing, and requirements |
| `DELETE`| `/api/instructor/courses/{id}` | Course Author | Delete course (drafts only) |
| `POST` | `/api/instructor/courses/{id}/thumbnail` | Course Author | Upload course cover thumbnail image |
| `POST` | `/api/instructor/courses/{id}/submit-approval`| Course Author | Submit drafted course for admin review |
| `GET` | `/api/instructor/courses/{id}/approval-status`| Course Author | View approval status and rejection feedback |
| `POST` | `/api/instructor/courses/{id}/sections` | Course Author | Create a new curriculum section |
| `PUT` | `/api/instructor/sections/{id}` | Course Author | Update section title and display order |
| `DELETE`| `/api/instructor/sections/{id}` | Course Author | Delete section and attached lessons |
| `POST` | `/api/instructor/sections/{id}/lessons` | Course Author | Create a new video/article lesson |
| `PUT` | `/api/instructor/lessons/{id}` | Course Author | Update lesson metadata and free-preview flag |
| `DELETE`| `/api/instructor/lessons/{id}` | Course Author | Delete lesson |
| `POST` | `/api/instructor/lessons/{id}/video` | Course Author | Upload MP4 video file for lesson |
| `POST` | `/api/instructor/lessons/{id}/resources`| Course Author | Attach downloadable PDF/source code resource |

---

## 9. Administrator Control Center (`/api/admin`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Administrator | System telemetry, revenue share, users, and enrollments |
| `GET` | `/api/admin/courses` | Administrator | Paginated list of all platform courses |
| `GET` | `/api/admin/courses/pending` | Administrator | Review queue of courses awaiting approval |
| `POST` | `/api/admin/courses/{id}/approve` | Administrator | Approve submitted course |
| `POST` | `/api/admin/courses/{id}/reject` | Administrator | Reject course with written reason |
| `POST` | `/api/admin/courses/{id}/publish` | Administrator | Make approved course public on storefront |
| `POST` | `/api/admin/courses/{id}/unpublish` | Administrator | Withdraw course from public storefront |
| `DELETE`| `/api/admin/courses/{id}` | Administrator | Remove inappropriate course permanently |
| `GET` | `/api/admin/users` | Administrator | List all registered user accounts with roles |
| `PUT` | `/api/admin/users/{id}/toggle-status` | Administrator | Suspend or reactivate user account |
| `POST` | `/api/categories` | Administrator | Create a new top-level or sub-category |

