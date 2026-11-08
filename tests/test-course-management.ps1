# EduSphere LMS - Course Management Comprehensive E2E Integration Test Matrix
$baseUrl = "http://localhost:5005"
$ErrorActionPreference = "Stop"

$passed = 0
$failed = 0

function Assert-Condition($condition, $testName) {
    if ($condition) {
        Write-Host " [PASS] $testName" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host " [FAIL] $testName" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Course Management Comprehensive E2E Test Matrix " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. Authentication & JWT Tokens
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 1: Authentication & Token Generation ---" -ForegroundColor Yellow

# Login Admin
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "admin@edusphere.com"
    password = "Admin@123456"
} | ConvertTo-Json)
$adminToken = $adminLogin.token
Assert-Condition ($adminToken -ne $null -and $adminLogin.roles -contains "Admin") "Admin login successful and has Admin role"

# Login Instructor 1
$instLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "instructor@edusphere.com"
    password = "Instructor@123456"
} | ConvertTo-Json)
$inst1Token = $instLogin.token
Assert-Condition ($inst1Token -ne $null -and $instLogin.roles -contains "Instructor") "Instructor 1 login successful and has Instructor role"

# Register & Login Instructor 2 (for authorization isolation tests)
$inst2Email = "instructor2@edusphere.com"
try {
    $inst2Register = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body (@{
        firstName = "Sarah"
        lastName = "Connor"
        email = $inst2Email
        password = "Instructor@123456"
        role = "Instructor"
    } | ConvertTo-Json)
    $inst2Token = $inst2Register.token
} catch {
    $inst2Login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = $inst2Email
        password = "Instructor@123456"
    } | ConvertTo-Json)
    $inst2Token = $inst2Login.token
}
Assert-Condition ($inst2Token -ne $null) "Instructor 2 token acquired"

# Login Student
$studentLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "student@edusphere.com"
    password = "Student@123456"
} | ConvertTo-Json)
$studentToken = $studentLogin.token
Assert-Condition ($studentToken -ne $null -and $studentLogin.roles -contains "Student") "Student login successful and has Student role"

# -----------------------------------------------------------------------------
# 2. Authorization Rules & Boundary Enforcement
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 2: Authorization Rules & Boundary Enforcement ---" -ForegroundColor Yellow

# Rule 1: Anonymous access to Instructor endpoint must return 401
$anonDenied = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Post -ContentType "application/json" -Body "{}"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) { $anonDenied = $true }
}
Assert-Condition $anonDenied "Anonymous access to create course blocked with 401 Unauthorized"

# Rule 2: Student cannot create courses (403 Forbidden)
$studentDenied = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -ContentType "application/json" -Body (@{
        title = "Student Course"
        shortDescription = "Attempting to create course as student"
        description = "Unauthorized course creation description"
        categoryId = 1
        price = 10
    } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) { $studentDenied = $true }
}
Assert-Condition $studentDenied "Student access to create course blocked with 403 Forbidden"

# Rule 3: Student cannot access Admin pending courses (403 Forbidden)
$studentAdminDenied = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/pending" -Method Get -Headers @{ Authorization = "Bearer $studentToken" }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) { $studentAdminDenied = $true }
}
Assert-Condition $studentAdminDenied "Student access to admin courses blocked with 403 Forbidden"

# -----------------------------------------------------------------------------
# 3. Instructor Course CRUD Operations
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 3: Instructor Course Management & CRUD ---" -ForegroundColor Yellow

# Create Course as Instructor 1
$newCourse = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Post -Headers @{ Authorization = "Bearer $inst1Token" } -ContentType "application/json" -Body (@{
    title = "Complete ASP.NET Core 10 & React Web Development"
    shortDescription = "Build Enterprise Full-Stack Web Applications with Clean Architecture"
    description = "Learn how to build real-world, scalable, and secure web applications using .NET 10, Entity Framework Core, SQL Server, and React with TypeScript."
    categoryId = 1
    price = 89.99
    discountPrice = 49.99
    discountExpiresAtUtc = (Get-Date).AddDays(14).ToUniversalTime().ToString("o")
    level = 2 # Intermediate
    language = "English"
    requirements = "Basic knowledge of C# and JavaScript"
    whatYouWillLearn = "Clean Architecture, EF Core, JWT Authentication, React & Vite"
    whoIsThisFor = "Developers wanting to become full-stack software engineers"
} | ConvertTo-Json)

$courseId = $newCourse.id
Assert-Condition ($courseId -gt 0 -and $newCourse.status -eq "Draft") "Instructor 1 successfully created course in Draft status (ID: $courseId)"

# Edit Course
$updatedCourse = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId" -Method Put -Headers @{ Authorization = "Bearer $inst1Token" } -ContentType "application/json" -Body (@{
    title = "Complete ASP.NET Core 10 & React Masterclass"
    shortDescription = "Master Enterprise Clean Architecture with .NET 10 and React"
    description = "Updated description with enhanced curriculum details."
    categoryId = 1
    price = 99.99
    discountPrice = 59.99
    discountExpiresAtUtc = (Get-Date).AddDays(30).ToUniversalTime().ToString("o")
    level = 3 # Advanced
    language = "English"
    requirements = "Solid C# fundamentals"
    whatYouWillLearn = "Complete microservices-ready Clean Architecture"
    whoIsThisFor = "Aspiring Senior Software Engineers"
    isFree = $false
} | ConvertTo-Json)

Assert-Condition ($updatedCourse.title -eq "Complete ASP.NET Core 10 & React Masterclass" -and $updatedCourse.price -eq 99.99) "Instructor 1 successfully updated course title and price"

# Cross-Instructor Rule: Instructor 2 cannot edit Instructor 1's course
$crossEditBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId" -Method Put -Headers @{ Authorization = "Bearer $inst2Token" } -ContentType "application/json" -Body (@{
        title = "Hacked Title"
        shortDescription = "Hacked short description by instructor 2"
        description = "Unauthorized edit"
        categoryId = 1
        price = 10
    } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(401, 403, 400)) { $crossEditBlocked = $true }
}
Assert-Condition $crossEditBlocked "Cross-instructor modification blocked (Instructor 2 cannot modify Instructor 1's course)"

# Upload Course Thumbnail using curl.exe
$tempThumbPath = "$PSScriptRoot\test_thumbnail.png"
[System.IO.File]::WriteAllBytes($tempThumbPath, [byte[]]@(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52))

$curlThumbOutput = curl.exe -s -X POST "$baseUrl/api/instructor/courses/$courseId/thumbnail" `
    -H "Authorization: Bearer $inst1Token" `
    -F "file=@$tempThumbPath;type=image/png"

$thumbResponse = $curlThumbOutput | ConvertFrom-Json
Assert-Condition ($thumbResponse.thumbnailUrl -like "*thumbnails*") "Course thumbnail uploaded successfully ($($thumbResponse.thumbnailUrl))"

# Invalid file type test: Attempt to upload an executable thumbnail (.exe)
$tempExePath = "$PSScriptRoot\malicious.exe"
[System.IO.File]::WriteAllText($tempExePath, "MZFakeExeBinaryContent")

$curlInvalidThumb = curl.exe -s -w "%{http_code}" -o NUL -X POST "$baseUrl/api/instructor/courses/$courseId/thumbnail" `
    -H "Authorization: Bearer $inst1Token" `
    -F "file=@$tempExePath;type=application/octet-stream"

Assert-Condition ($curlInvalidThumb -in @("400", "422")) "Malicious thumbnail extension (.exe) rejected with HTTP $curlInvalidThumb"

# -----------------------------------------------------------------------------
# 4. Curriculum: Sections, Lessons, Videos, Downloadable Resources
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 4: Sections, Lessons, Videos & Resources ---" -ForegroundColor Yellow

# Add Section 1
$sec1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/sections" -Method Post -Headers @{ Authorization = "Bearer $inst1Token" } -ContentType "application/json" -Body (@{
    title = "Section 1: Architecture Overview"
    description = "Understanding Clean Architecture in .NET 10"
    displayOrder = 1
} | ConvertTo-Json)
$sec1Id = $sec1.id
Assert-Condition ($sec1Id -gt 0 -and $sec1.title -like "*Architecture Overview*") "Section 1 created (ID: $sec1Id)"

# Add Section 2
$sec2 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/sections" -Method Post -Headers @{ Authorization = "Bearer $inst1Token" } -ContentType "application/json" -Body (@{
    title = "Section 2: API & Security Implementation"
    description = "JWT Authentication and Role-Based Authorization"
    displayOrder = 2
} | ConvertTo-Json)
$sec2Id = $sec2.id
Assert-Condition ($sec2Id -gt 0) "Section 2 created (ID: $sec2Id)"

# Add Lesson 1 to Section 1
$les1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$sec1Id/lessons" -Method Post -Headers @{ Authorization = "Bearer $inst1Token" } -ContentType "application/json" -Body (@{
    title = "1. Introduction to Domain-Driven Design"
    description = "Entities, Value Objects, and Domain Events"
    displayOrder = 1
    isPreviewFree = $true
    type = 1 # Video
} | ConvertTo-Json)
$les1Id = $les1.id
Assert-Condition ($les1Id -gt 0 -and $les1.isPreviewFree -eq $true) "Lesson 1 created with free preview enabled (ID: $les1Id)"

# Add Lesson 2 to Section 1
$les2 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$sec1Id/lessons" -Method Post -Headers @{ Authorization = "Bearer $inst1Token" } -ContentType "application/json" -Body (@{
    title = "2. Setting up the .NET 10 Solution"
    description = "Creating Clean Architecture projects"
    displayOrder = 2
    isPreviewFree = $false
    type = 1 # Video
} | ConvertTo-Json)
$les2Id = $les2.id
Assert-Condition ($les2Id -gt 0) "Lesson 2 created (ID: $les2Id)"

# Upload Lesson Video for Lesson 1 using curl.exe
$tempVideoPath = "$PSScriptRoot\test_video.mp4"
[System.IO.File]::WriteAllBytes($tempVideoPath, [byte[]]@(0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D))

$curlVideoOutput = curl.exe -s -X POST "$baseUrl/api/instructor/lessons/$les1Id/video" `
    -H "Authorization: Bearer $inst1Token" `
    -F "durationSeconds=950" `
    -F "file=@$tempVideoPath;type=video/mp4"

$videoResponse = $curlVideoOutput | ConvertFrom-Json
Assert-Condition ($videoResponse.videoUrl -like "*videos*" -and $videoResponse.durationSeconds -eq 950) "Lesson video uploaded successfully with duration 950s"

# Upload Downloadable Course Resource using curl.exe
$tempResPath = "$PSScriptRoot\clean_architecture_cheatsheet.pdf"
[System.IO.File]::WriteAllBytes($tempResPath, [byte[]]@(0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35))

$curlResOutput = curl.exe -s -X POST "$baseUrl/api/instructor/courses/$courseId/resources" `
    -H "Authorization: Bearer $inst1Token" `
    -F "title=Clean Architecture Guide PDF" `
    -F "type=1" `
    -F "file=@$tempResPath;type=application/pdf"

$resourceResponse = $curlResOutput | ConvertFrom-Json
Assert-Condition ($resourceResponse.fileUrl -like "*resources*") "Downloadable PDF course resource uploaded successfully"

# Reorder Sections
$reorderSec = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/sections/reorder" `
    -Method Put `
    -Headers @{ Authorization = "Bearer $inst1Token" } `
    -ContentType "application/json" `
    -Body (@(
        @{ id = $sec2Id; displayOrder = 1 },
        @{ id = $sec1Id; displayOrder = 2 }
    ) | ConvertTo-Json)
Assert-Condition $true "Sections reordered successfully"

# Cross-Instructor Rule on Sections: Instructor 2 cannot add lesson to Instructor 1's section
$crossLessonBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$sec1Id/lessons" `
        -Method Post `
        -Headers @{ Authorization = "Bearer $inst2Token" } `
        -ContentType "application/json" `
        -Body (@{ title = "Hacked Lesson"; displayOrder = 99 } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(401, 403, 400)) { $crossLessonBlocked = $true }
}
Assert-Condition $crossLessonBlocked "Instructor 2 blocked from adding lessons to Instructor 1's section"

# -----------------------------------------------------------------------------
# 5. Course Submission & Admin Approval Lifecycle
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 5: Approval Workflow & Rejection Handling ---" -ForegroundColor Yellow

# Submit for approval
$submitResponse = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/submit-approval" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $inst1Token" }
Assert-Condition ($submitResponse.status -eq "PendingApproval") "Course submitted for approval (Status: PendingApproval)"

# Check approval status
$statusCheck = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/approval-status" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $inst1Token" }
Assert-Condition ($statusCheck.status -eq "PendingApproval") "Instructor successfully verified approval status"

# Rule: Cannot delete course while PendingApproval
$deletePendingBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId" `
        -Method Delete `
        -Headers @{ Authorization = "Bearer $inst1Token" }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 422)) { $deletePendingBlocked = $true }
}
Assert-Condition $deletePendingBlocked "Cannot delete course when in PendingApproval state (Validation rule enforced)"

# Admin views pending courses
$pendingCourses = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/pending" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $adminToken" }
$foundInPending = ($pendingCourses.items | Where-Object { $_.id -eq $courseId }) -ne $null
Assert-Condition $foundInPending "Admin retrieved pending course list and found the submitted course"

# Admin reviews course details
$adminCourseReview = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($adminCourseReview.id -eq $courseId -and $adminCourseReview.sections.Count -eq 2) "Admin reviewed full course details, sections, and curriculum"

# Admin rejects course with reason
$rejectReason = "Please add practical coding exercises to Section 2 before resubmission."
$rejected = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId/reject" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $adminToken" } `
    -ContentType "application/json" `
    -Body (@{ reason = $rejectReason } | ConvertTo-Json)
Assert-Condition ($rejected.status -eq "Rejected") "Admin rejected course with reason"

# Instructor views rejection status and reason
$rejectedStatus = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/approval-status" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $inst1Token" }
Assert-Condition ($rejectedStatus.status -eq "Rejected" -and $rejectedStatus.rejectionReason -eq $rejectReason) "Instructor views rejection status and specific reason"

# Instructor updates course (should reset status from Rejected to Draft)
$resubmitDraft = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId" `
    -Method Put `
    -Headers @{ Authorization = "Bearer $inst1Token" } `
    -ContentType "application/json" `
    -Body (@{
        title = "Complete ASP.NET Core 10 & React Masterclass"
        shortDescription = "Master Enterprise Clean Architecture with .NET 10 and React with hands-on labs"
        description = "Updated with comprehensive practical hands-on exercises in Section 2."
        categoryId = 1
        price = 99.99
        level = 3
    } | ConvertTo-Json)
Assert-Condition ($resubmitDraft.status -eq "Draft") "Editing rejected course resets status to Draft"

# Resubmit for approval
$resubmitResponse = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/submit-approval" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $inst1Token" }
Assert-Condition ($resubmitResponse.status -eq "PendingApproval") "Course resubmitted for approval"

# Admin approves course
$approved = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId/approve" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($approved.status -eq "Approved") "Admin approved course (Status: Approved)"

# Public visibility rule: Approved but unpublished course must NOT be visible publicly
$publicBeforePublish = Invoke-RestMethod -Uri "$baseUrl/api/courses" -Method Get
$visibleBeforePublish = ($publicBeforePublish.items | Where-Object { $_.id -eq $courseId }) -ne $null
Assert-Condition (-not $visibleBeforePublish) "Approved but unpublished course is NOT visible to the public"

# Admin publishes approved course
$published = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId/publish" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($published.status -eq "Published") "Admin published course (Status: Published)"

# -----------------------------------------------------------------------------
# 6. Public Features, Pagination, Search & Filtering
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 6: Public Features, Search, Filtering & Pagination ---" -ForegroundColor Yellow

# Public listing contains published course
$publicCourses = Invoke-RestMethod -Uri "$baseUrl/api/courses" -Method Get
$foundInPublic = ($publicCourses.items | Where-Object { $_.id -eq $courseId }) -ne $null
Assert-Condition $foundInPublic "Public listing contains the newly published course"

# Filter by category
$catFiltered = Invoke-RestMethod -Uri "$baseUrl/api/courses?categoryId=1" -Method Get
Assert-Condition ($catFiltered.items.Count -ge 1 -and $catFiltered.items[0].categoryId -eq 1) "Filter by Category ID=1 works"

# Filter by difficulty level
$levelFiltered = Invoke-RestMethod -Uri "$baseUrl/api/courses?level=3" -Method Get
Assert-Condition ($levelFiltered.items.Count -ge 1 -and $levelFiltered.items[0].level -eq "Advanced") "Filter by Level (Advanced) works"

# Search by keyword
$searchResult = Invoke-RestMethod -Uri "$baseUrl/api/courses?search=Masterclass" -Method Get
Assert-Condition ($searchResult.items.Count -ge 1 -and $searchResult.items[0].title -like "*Masterclass*") "Search query for 'Masterclass' returns matching course"

# Price filter
$priceFiltered = Invoke-RestMethod -Uri "$baseUrl/api/courses?minPrice=50&maxPrice=100" -Method Get
Assert-Condition ($priceFiltered.items.Count -ge 1) "Price range filter works"

# Public Course Details by ID or Slug
$publicDetail = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId" -Method Get
Assert-Condition ($publicDetail.id -eq $courseId -and $publicDetail.instructorName -ne $null -and $publicDetail.sections.Count -eq 2) "Public detail endpoint returns course, instructor info, and full curriculum"

# -----------------------------------------------------------------------------
# 7. Unpublish, Draft Deletion & Admin Delete Operations
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 7: Unpublish & Deletion Operations ---" -ForegroundColor Yellow

# Admin unpublishes course
$unpublished = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId/unpublish" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($unpublished.status -eq "Approved") "Admin successfully unpublished course (Status returned to Approved)"

# Verify course is no longer visible in public listing
$publicAfterUnpublish = Invoke-RestMethod -Uri "$baseUrl/api/courses" -Method Get
$stillVisible = ($publicAfterUnpublish.items | Where-Object { $_.id -eq $courseId }) -ne $null
Assert-Condition (-not $stillVisible) "Unpublished course is no longer visible in public listing"

# Instructor creates a separate draft course and deletes it
$dummyCourse = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Post -Headers @{ Authorization = "Bearer $inst1Token" } -ContentType "application/json" -Body (@{
    title = "Temporary Draft Course To Delete"
    shortDescription = "Temporary draft course for testing deletion rule"
    description = "This course will be deleted immediately to test draft deletion"
    categoryId = 2
    price = 19.99
} | ConvertTo-Json)
$dummyId = $dummyCourse.id

Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$dummyId" -Method Delete -Headers @{ Authorization = "Bearer $inst1Token" }
$dummyCheck = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Get -Headers @{ Authorization = "Bearer $inst1Token" }
$dummyDeleted = ($dummyCheck | Where-Object { $_.id -eq $dummyId }) -eq $null
Assert-Condition $dummyDeleted "Instructor can delete own Draft course successfully"

# Admin deletes inappropriate course
Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId" -Method Delete -Headers @{ Authorization = "Bearer $adminToken" }
$adminAllCourses = Invoke-RestMethod -Uri "$baseUrl/api/admin/courses" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
$adminCourseDeleted = ($adminAllCourses.items | Where-Object { $_.id -eq $courseId }) -eq $null
Assert-Condition $adminCourseDeleted "Admin successfully deleted course"

# Cleanup test files
Remove-Item $tempThumbPath -Force -ErrorAction SilentlyContinue
Remove-Item $tempExePath -Force -ErrorAction SilentlyContinue
Remove-Item $tempVideoPath -Force -ErrorAction SilentlyContinue
Remove-Item $tempResPath -Force -ErrorAction SilentlyContinue

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Course Management Test Matrix Summary" -ForegroundColor Cyan
Write-Host " Passed: $passed" -ForegroundColor Green
Write-Host " Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}
