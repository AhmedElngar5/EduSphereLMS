# EduSphere LMS – Software Architecture & Design

EduSphere is engineered using **Clean Architecture** (also known as Onion / Hexagonal Architecture) to achieve strict separation of concerns, testability, framework independence, and maintainability.

---

## 1. Clean Architecture Layers

```mermaid
flowchart TD
    subgraph Presentation["Presentation Layer"]
        API["ASP.NET Core Web API 10<br/>(Controllers, Middleware, OpenAPI)"]
        UI["React 19 + TypeScript + Vite 8<br/>(Tailwind CSS, TanStack Query)"]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        EF["Entity Framework Core 10<br/>(ApplicationDbContext, Fluent API)"]
        SQL[("SQL Server LocalDB")]
        Identity["ASP.NET Core Identity<br/>(ApplicationUser, Password Hashing)"]
        JWT["JWT Token Service<br/>(HMAC-SHA256 Bearer Tokens)"]
        Storage["Local File Storage Service<br/>(Safe Paths, MIME Validation)"]
        MockGateway["Mock Payment Gateway<br/>(Extensible IPaymentGateway)"]
    end

    subgraph Application["Application Layer"]
        Interfaces["Service Interfaces<br/>(ICourseService, IPaymentService, etc.)"]
        DTOs["Data Transfer Objects (DTOs)<br/>(CourseDetailDto, PaymentDto, etc.)"]
        Exceptions["Domain Exceptions<br/>(NotFoundException, ValidationException)"]
        Common["Common Models<br/>(PaginatedResult, Result, ApiResponse)"]
    end

    subgraph Domain["Domain Layer (Core)"]
        Entities["Domain Entities<br/>(Course, Lesson, Enrollment, Order, etc.)"]
        Enums["Domain Enums<br/>(CourseStatus, PaymentStatus, etc.)"]
        Rules["Enterprise Business Rules<br/>(Validation, Precision, Constraints)"]
    end

    UI -->|REST JSON / Bearer JWT| API
    API -->|Depends On| Application
    API -->|Depends On| Infrastructure
    Infrastructure -->|Implements Interfaces| Application
    Infrastructure -->|Persists| SQL
    Infrastructure -->|Depends On| Domain
    Application -->|Operates On| Domain
```

---

## 2. Request & Execution Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client (Axios)
    participant Auth as JWT Middleware & RBAC Guard
    participant Controller as API Controller
    participant Service as Application Service
    participant Context as ApplicationDbContext
    participant Database as SQL Server

    Client->>Auth: HTTP Request with Bearer Token
    alt Invalid / Expired Token
        Auth-->>Client: 401 Unauthorized
    else Valid Token, Forbidden Role
        Auth-->>Client: 403 Forbidden
    else Authorized
        Auth->>Controller: Forward to Action
        Controller->>Service: Call Service Method with User Context
        Service->>Context: Execute Business Query / Mutate Entity
        Context->>Database: EF Core SQL Command
        Database-->>Context: Result Set / Rows Affected
        Context-->>Service: Updated Entities
        Service-->>Controller: Return Strongly Typed DTO
        Controller-->>Client: 200 OK / 201 Created (JSON)
    end
```

---

## 3. Security & Data Protection Architecture

1. **In-Memory JWT Storage**:
   - Access tokens are never written to unencrypted `localStorage`.
   - Maintained in module closure in `services/api.ts`, synced strictly with browser `sessionStorage` to allow graceful single-tab refresh while mitigating persistent XSS token theft.
2. **Role-Based Access Control (RBAC)**:
   - Enforced both at API controller boundaries (`[Authorize(Roles = "...")]`) and React Router guard layers (`<ProtectedRoute allowedRoles={[...]} />`).
3. **MIME & Extension Security**:
   - Uploaded media undergo double validation: file extension whitelisting and MIME type header verification.
   - File uploads are assigned cryptographically random GUID file names before saving to disk.
4. **Range-Processing Video Streaming**:
   - Video lessons are delivered using ASP.NET Core `enableRangeProcessing: true`.
   - Allows clients to seek through videos seamlessly via HTTP 206 (Partial Content) without downloading the entire binary file upfront.

