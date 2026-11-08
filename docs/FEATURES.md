# EduSphere LMS – Platform Feature Catalog

EduSphere provides comprehensive feature suites tailored to four distinct personas: Public Visitors, Students, Instructors, and Administrators.

---

## 1. Public Visitor Features
- **Modern Landing Page**: Value proposition hero banner, trending categories, top-rated masterclasses, value metrics, and student testimonial cards.
- **Course Catalog & Filtering**:
  - Full-text keyword search across course titles, descriptions, and learning objectives.
  - Multi-criteria filtering by Category, Course Level (Beginner, Intermediate, Advanced, All Levels), and Price Type (Free vs. Paid).
  - Sorting by Highest Rated, Most Popular, Newest, and Price.
  - Server-side pagination.
- **Detailed Course Overview**:
  - Curriculum explorer with expandable section and lesson lists.
  - Free preview video player for introductory lessons.
  - Learning objectives, prerequisites, target audience breakdown, and instructor bio.
  - Verified student reviews and star rating distribution.
- **Instructor Public Profiles**: Instructor biographical summary, headline, social links, and catalog of taught courses.
- **Public Certificate Verification**: Instant authenticity verification tool (`/verify-certificate/{certificateNumber}`) allowing employers and academic institutions to validate student certificates without signing in.

---

## 2. Student Learning Portal
- **Interactive Student Dashboard**:
  - Learning telemetry cards: Enrolled courses, In-Progress count, Completed courses, and Credentials earned.
  - "Continue Learning" spotlight card resuming the student's most recently accessed lesson.
  - Aggregate learning progress bar tracking overall completed lessons across all courses.
  - Curated course recommendations.
- **Course Enrollment & Checkout**:
  - One-click instant enrollment in free courses.
  - Mock payment checkout flow for paid courses with subtotal, discounts, and order receipt generation.
  - Duplicate enrollment protection.
- **Immersive Classroom Player**:
  - Distraction-free theatre mode player.
  - HTML5 video playback with HTTP 206 Partial Content Range streaming.
  - Periodic video playback position persistence (resume video right where left off).
  - Collapsible curriculum drawer with real-time lesson progress checkmarks.
  - Downloadable lesson resources (source code, exercise sheets, PDF guides).
  - Interactive "Mark Lesson as Completed" control with auto-progression to next lesson.
  - Course completion celebration modal triggering instant certificate issuance.
- **Verified Certificates**:
  - View all earned certificates with unique credentials.
  - Download officially styled PDF certificate with valid PDF headers.
- **Course Reviews & Ratings**:
  - Enrolled student review submissions (1 to 5 stars + written feedback).
  - One review per enrolled course rule.
- **Wishlist**: Save favorite courses for later enrollment with real-time badge count.
- **Notifications**: System alerts for course enrollments, completion milestones, certificate issuance, and payment receipts.

---

## 3. Instructor Studio
- **Instructor Dashboard**:
  - Creator KPIs: Net Earnings (80% creator payout share), Gross Sales, Total Learners, and Average Course Rating.
  - Monthly student enrollment trends visualized via Recharts Area Chart.
  - Best-performing courses table with sales count, ratings, and revenue breakdown.
  - Recent student enrollment feed with learner names and progress percentages.
- **Course Creation & Management**:
  - Multi-step course creation wizard (Title, Category, Difficulty, Pricing, Objectives, Requirements).
  - Course thumbnail uploader with image preview.
  - Course status lifecycle: Draft, Pending Approval, Approved, Published, Rejected.
- **Curriculum Editor**:
  - Interactive Section creation and reordering.
  - Lesson authoring supporting Video lessons and Article content.
  - Lesson video uploader with automatic duration tracking.
  - Downloadable resource attachment uploader.
  - Free preview toggling for introductory lessons.
- **Submission & Approval Workflow**:
  - Submit drafted curriculum to admin for review.
  - View administrative review notes and rejection feedback.
- **Student Roster & Analytics**: View all learners enrolled across taught courses with enrollment dates and progress completion stats.

---

## 4. Administrator Control Center
- **Executive Control Center (Dashboard)**:
  - Financial telemetry: Total Gross Sales, Net Platform Revenue (20% platform margin), Total Completed Checkouts.
  - Platform account counts: Total Users, Student accounts, Instructor accounts.
  - Course inventory status: Total courses, Published storefront courses, Pending review queue.
  - Historical monthly platform enrollment area chart.
  - Top 10 performing courses across all categories.
  - Recent user registrations table with role tags and account status flags.
  - Real-time transaction feed detailing recent buyer checkouts.
- **Course Review & Approval Queue**:
  - Dedicated queue of courses pending publication.
  - Deep curriculum inspection before publishing.
  - One-click course approval.
  - Rejection workflow requiring written administrative feedback.
  - Immediate course publishing and unpublishing controls.
- **Category & Taxonomy Management**: Create and manage root categories and hierarchical sub-categories with slugs and display ordering.
- **User Account Governance**:
  - View all registered student and instructor accounts.
  - Suspend or reinstate user accounts with immediate effect (`toggle-status`).
- **Financial & Order Reports**: Comprehensive transaction report with platform revenue, instructor payouts, and payment status filtering.

