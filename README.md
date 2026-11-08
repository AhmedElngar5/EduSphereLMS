# 🎓 EduSphere LMS – Enterprise Learning Management System

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-LocalDB-CC292B?logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Onion-success)](#-software-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, full-stack Learning Management System (LMS) built with **.NET 10**, **ASP.NET Core Web API**, **Entity Framework Core 10**, **SQL Server**, and **React 19 with TypeScript and Vite**. 

EduSphere delivers a high-performance educational experience inspired by modern platforms like Coursera and Udemy, featuring role-based dashboards, HTTP 206 video streaming, automated PDF certification, and an extensible mock payment system.

---

## 📸 Visual Previews

### 1. Storefront Landing Page
![EduSphere Storefront](docs/screenshots/01_home_storefront.svg)

### 2. Distraction-Free Video Classroom
![Interactive Video Classroom](docs/screenshots/02_video_classroom.svg)

### 3. Administrator Control Center & Telemetry
![Administrator Control Center](docs/screenshots/03_admin_dashboard.svg)

### 4. Instructor Studio & Performance Analytics
![Instructor Studio](docs/screenshots/04_instructor_dashboard.svg)

---

## 🏛 Software Architecture

EduSphere is engineered using **Clean Architecture** (Onion / Hexagonal Architecture) to ensure strict separation of concerns, testability, framework independence, and enterprise maintainability:

```
+-------------------------------------------------------+
|                    Presentation                       |
|           EduSphere.Api  &  React Frontend (Vite)     |
+-------------------------------------------------------+
                           │
                           ▼
+-------------------------------------------------------+
|                   Infrastructure                      |
|  EduSphere.Infrastructure (EF Core, SQL Server, Ext.) |
+-------------------------------------------------------+
                           │
                           ▼
+-------------------------------------------------------+
|                     Application                       |
|      EduSphere.Application (Interfaces, DTOs, Logic)  |
+-------------------------------------------------------+
                           │
                           ▼
+-------------------------------------------------------+
|                       Domain                          |
|   EduSphere.Domain (Entities, Enums, Value Objects)   |
+-------------------------------------------------------+
```

### Layer Responsibilities
- **Domain (`src/EduSphere.Domain`)**: Framework-free enterprise domain models (`Course`, `Section`, `Lesson`, `Enrollment`, `Order`, `Payment`, `Certificate`, `Review`, `Wishlist`, etc.) and domain enums.
- **Application (`src/EduSphere.Application`)**: Core business abstractions, service interfaces (`ICourseService`, `IPaymentService`, `ILearningService`), DTO contracts, and exception definitions.
- **Infrastructure (`src/EduSphere.Infrastructure`)**: EF Core `ApplicationDbContext` with Fluent API mappings, SQL Server persistence, ASP.NET Core Identity (`ApplicationUser`), HMAC-SHA256 JWT service, file storage with MIME validation, and extensible Mock Payment Gateway.
- **API (`src/EduSphere.Api`)**: High-throughput ASP.NET Core Web API controllers with RFC 7807 global exception handling, OpenAPI definitions, and CORS middleware.
- **Frontend (`frontend/`)**: React 19 Single Page Application with TanStack React Query v5, Tailwind CSS v4, Lucide icons, and Recharts analytics.

---

## 🛠 Technology Stack

### Backend
- **Framework**: .NET 10 (`net10.0`)
- **API Runtime**: ASP.NET Core Web API (C# 13)
- **Database**: Microsoft SQL Server LocalDB
- **ORM**: Entity Framework Core 10 (`Microsoft.EntityFrameworkCore.SqlServer` 10.0.14)
- **Identity & Auth**: ASP.NET Core Identity & JWT Bearer Authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- **API Documentation**: Microsoft OpenAPI 10.0.14
- **Testing**: xUnit, Microsoft.NET.Test.Sdk

### Frontend
- **Framework**: React 19 (`react`, `react-dom` 19.3.1)
- **Language**: TypeScript 7.0+
- **Bundler & Tooling**: Vite 8 (`vite` 8.3.6)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` 4.3.4)
- **Routing**: React Router v7 (`react-router-dom` 7.18.5)
- **Server State**: TanStack React Query v5 (`@tanstack/react-query` 5.106.1)
- **HTTP Client**: Axios 1.21.0 with request/response interceptors
- **Visualizations**: Recharts 3.10.1 (Responsive Area Charts)
- **Icons**: Lucide React 1.70.0

---

## ✨ Feature Highlights

| Module | Capabilities |
| :--- | :--- |
| **Authentication & RBAC** | Identity password hashing, JWT claims, role-based protection for Students, Instructors, and Admins. In-memory token management with session synchronization (never `localStorage`). |
| **Course Lifecycle** | Course drafting, thumbnail uploading, multi-section curriculum authoring, video lessons, downloadable resources, and administrative review & approval. |
| **Video Classroom** | Distraction-free player supporting **HTTP 206 Partial Content (Range)** streaming, playback position sync, curriculum sidebar, and auto-completion. |
| **Mock Payment System** | Order generation, checkout flow, simulated success/failure, platform fee calculation (20% platform / 80% instructor payout share), and order history. |
| **Verified Certificates** | Automated certificate minting upon 100% course completion with unique serial numbers, downloadable PDF certificate, and public verification endpoint. |
| **Reviews & Ratings** | 1–5 star reviews restricted to verified enrolled learners; duplicate review prevention; automatic average rating updates. |
| **Wishlist & Notifications**| Course bookmarking with real-time badges; event notifications for approvals, completions, certificates, and checkouts. |
| **Analytical Dashboards** | Responsive Recharts telemetry for Admins (gross sales, platform margin, users, top courses), Instructors (net earnings, sales volume, trends), and Students (learning progress). |

---

## 🔐 Demo Credentials

The platform includes seed data ready for local demonstration:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@edusphere.com` | `Admin@123456` | Full system control, course approvals, revenue reports, user governance |
| **Instructor** | `instructor@edusphere.com` | `Instructor@123456` | Course creation, curriculum editor, student roster, earnings reports |
| **Student** | `student@edusphere.com` | `Student@123456` | Course browsing, checkout, video player, certificates, reviews |

---

## 🚀 Local Installation & Quick Start

### Prerequisites
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) & npm
- [SQL Server LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb) (comes standard with Visual Studio or SQL Server Express)

---

### Step 1: Clone Repository & Configure Environment

```powershell
git clone https://github.com/AhmedElngar5/EduSphereLMS.git
cd EduSphereLMS
```

Copy the environment template files:
```powershell
# Root configuration template
copy .env.example .env

# Frontend configuration template
copy frontend\.env.example frontend\.env
```

---

### Step 2: Database Setup & Migrations

The connection string defaults to SQL Server LocalDB:
`Server=(localdb)\mssqllocaldb;Database=EduSphereDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True`

Apply database migrations:
```powershell
dotnet ef database update --project src/EduSphere.Infrastructure --startup-project src/EduSphere.Api
```

> **Note**: On initial startup, the backend automatically seeds the default administrator, instructors, students, categories, sample courses, and curriculum if the database is empty.

---

### Step 3: Run the Application

#### Terminal 1 – Start the Backend Web API:
```powershell
dotnet run --project src/EduSphere.Api --urls "http://localhost:5005"
```
The API is now live at `http://localhost:5005`. OpenAPI specifications are served at `http://localhost:5005/openapi/v1.json`.

#### Terminal 2 – Start the Frontend Client:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Open your browser at `http://localhost:5173`. The Vite development server automatically proxies `/api` requests to `http://localhost:5005`.

---

## 🧪 Testing & Quality Assurance

EduSphere includes a test suite combining unit tests and end-to-end PowerShell integration scripts:

```powershell
# 1. Run .NET Unit Tests (43 unit tests covering Domain, Application, and Auth Security)
dotnet test

# 2. Build Frontend Client (Type-check and Vite bundle)
cd frontend
npm.cmd run build

# 3. Run E2E Integration Test Matrix (Against live API on port 5005)
cd ..
powershell -ExecutionPolicy Bypass -File tests/test-security-authorization.ps1
powershell -ExecutionPolicy Bypass -File tests/test-all-modules.ps1
powershell -ExecutionPolicy Bypass -File tests/test-enrollment-learning.ps1
powershell -ExecutionPolicy Bypass -File tests/test-course-management.ps1
```

For the comprehensive QA review, see [`QA_REPORT.md`](QA_REPORT.md).

---

## 📚 Documentation Reference

- **[Architecture & Design](docs/ARCHITECTURE.md)**: Clean Architecture structure, request flow, and token security model.
- **[Database ERD](docs/DATABASE_ERD.md)**: Entity-relationship diagram, table schemas, foreign keys, and constraints.
- **[Feature Catalog](docs/FEATURES.md)**: Detailed feature breakdown across Public, Student, Instructor, and Admin portals.
- **[API Reference](docs/API_DOCUMENTATION.md)**: Comprehensive REST API endpoints and payload specifications.
- **[Portfolio Case Study](docs/PORTFOLIO_DESCRIPTION.md)**: In-depth engineering write-up for portfolio presentation.
- **[QA Audit Report](QA_REPORT.md)**: 14-point audit results and integration test matrix.

---

## 🛡 Security & Development Scope Disclosure

- **Development Mock Payment Gateway**: This platform implements a simulated development payment provider (`MockPaymentGateway`) to demonstrate complete order lifecycle and revenue distribution. Real credit card details are never collected or stored.
- **Local Storage Strategy**: Media files (lesson videos and PDF attachments) are safely persisted to disk storage (`wwwroot/uploads`) with strict MIME and extension verification.
- **Token Security**: In adherence to strict security practices, JWT access tokens are never persisted to unencrypted `localStorage`.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
