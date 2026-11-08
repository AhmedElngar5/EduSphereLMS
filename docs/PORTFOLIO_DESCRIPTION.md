# EduSphere LMS – Engineering Portfolio Case Study

> **A full-stack, enterprise-grade Learning Management System engineered with .NET 10, Entity Framework Core 10, SQL Server, and React 19 with TypeScript.**

---

## 🌟 Project Overview

**EduSphere LMS** is a full-featured educational platform designed to deliver high-quality online learning experiences inspired by modern platforms like Coursera and Udemy. The application provides an end-to-end learning lifecycle, connecting learners with domain experts while delivering robust administrative oversight, real-time analytics, automated certification, and secure media delivery.

Developed as a demonstration of modern software engineering principles, the system showcases **Clean Architecture**, strict **Role-Based Access Control (RBAC)**, HTTP 206 video streaming, automated PDF credential generation, and responsive data visualizations.

---

## 💡 Key Engineering Highlights

### 1. Clean Architecture & Domain-Driven Principles
- Strict separation into four layers: **Domain**, **Application**, **Infrastructure**, and **Presentation (API + Frontend)**.
- Domain entities and business logic remain completely framework-agnostic.
- Infrastructure concerns (EF Core, SQL Server, ASP.NET Core Identity, JWT, local storage, mock payment gateway) implement abstractions defined by the Application layer.
- Comprehensive testability demonstrated by isolated xUnit unit tests and end-to-end PowerShell integration suites.

### 2. High-Performance Media Streaming
- Built custom video delivery infrastructure supporting **HTTP 206 (Partial Content)** with `enableRangeProcessing: true`.
- Allows learners to seek through high-definition course videos without downloading entire files.
- Persists exact video playback positions every 10 seconds, enabling students to seamlessly resume lessons across sessions.

### 3. Production-Mindset Security & JWT Handling
- Mitigates persistent cross-site scripting (XSS) token theft by **strictly avoiding `localStorage`** for access tokens.
- Tokens are held securely in-memory in closure and synchronized with browser `sessionStorage` for single-session resilience.
- Dual-layer RBAC: ASP.NET Core policies enforce security at the controller boundary, mirrored by React Router route guards.
- Comprehensive input sanitization, file extension whitelisting, and MIME header validation prevent malicious uploads.

### 4. Interactive Data Telemetry & Analytics
- Implemented real-time analytical dashboards using **Recharts**:
  - **Admin**: Gross platform volume, net revenue margin (20%), account statistics, top courses, and historical monthly enrollment area charts.
  - **Instructor**: Gross sales, 80% creator payout share, course ratings breakdown, and recent student enrollments.
  - **Student**: Progress metrics, continue learning resume card, and personalized course recommendations.

### 5. Automated PDF Certificate Engine
- Engineered an automated certificate generator that validates 100% course completion before minting a unique, cryptographic certificate ID.
- Generates downloadable, standards-compliant PDF documents with custom headers and verification signatures.
- Includes a public verification endpoint (`/verify-certificate/{certificateNumber}`) allowing third-party employers to validate credentials without an account.

---

## 📊 Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Framework** | .NET 10 (C# 13), ASP.NET Core Web API |
| **Data Access & DB** | Entity Framework Core 10, Microsoft SQL Server LocalDB |
| **Authentication** | ASP.NET Core Identity, JWT Bearer (HMAC-SHA256) |
| **Frontend Framework** | React 19, TypeScript 7.0+, Vite 8 |
| **Styling & Design** | Tailwind CSS v4, Lucide React Icons |
| **State & Networking** | TanStack React Query v5, Axios |
| **Data Visualization** | Recharts (Responsive Area & Bar Charts) |
| **Automated Testing** | xUnit, .NET Test Runner, PowerShell Integration Suites |

---

## 📈 Quality Assurance & Test Verification

- **Backend Solution Build**: `dotnet build EduSphere.sln` $\rightarrow$ **0 Errors, 0 Warnings**
- **Unit Test Coverage**: `dotnet test tests/EduSphere.UnitTests` $\rightarrow$ **18 / 18 Tests Passed**
- **Frontend Build**: `npm run build` $\rightarrow$ **2,606 modules transformed, 70+ code-split chunks, built in < 800ms**
- **Automated Integration Matrix**: **110 / 110 Passed (100% pass rate)** covering courses, payments, certificates, reviews, wishlist, and notifications.
- **RBAC Matrix**: 100% verified across Anonymous, Student, Instructor, and Admin roles.

---

## 🧑‍💻 Technical Competencies Demonstrated

- Clean Architecture / Hexagonal Design
- RESTful API Design & OpenAPI / Swagger
- Relational Database Modeling with Fluent API
- Role-Based Access Control (RBAC) & Token Security
- HTTP 206 Partial Content Video Streaming
- Dynamic PDF Generation & Public Cryptographic Verification
- Modern Component-Driven React with TypeScript
- Responsive UI/UX Design with Tailwind CSS
- Automated Integration Testing & Quality Assurance

