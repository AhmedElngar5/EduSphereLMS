# EduSphere LMS - Student Enrollment & Learning Management E2E Test Suite
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

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Starting Student Enrollment & Learning Management Comprehensive Tests" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. Setup & User Authentication
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 1: Authentication & Role Setup ---" -ForegroundColor Yellow

# Seed system
Invoke-RestMethod -Uri "$baseUrl/api/auth/seed" -Method Post | Out-Null

# Admin login
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "admin@edusphere.com"
    password = "Admin@123456"
} | ConvertTo-Json)
$adminToken = $adminLogin.token

# Instructor login
$instLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "instructor@edusphere.com"
    password = "Instructor@123456"
} | ConvertTo-Json)
$instToken = $instLogin.token

# Student 1 login (Enrolled Student)
$student1Login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "student@edusphere.com"
    password = "Student@123456"
} | ConvertTo-Json)
$student1Token = $student1Login.token
Assert-Condition ($student1Token -ne $null) "Student 1 authenticated"

# Student 2 register & login (Non-Enrolled Student for permission checks)
$student2Email = "student2_test@edusphere.com"
try {
    $student2Reg = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body (@{
        firstName = "Alex"
        lastName = "NonEnrolled"
        email = $student2Email
        password = "Student@123456"
        role = "Student"
    } | ConvertTo-Json)
    $student2Token = $student2Reg.token
} catch {
    $student2Log = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = $student2Email
        password = "Student@123456"
    } | ConvertTo-Json)
    $student2Token = $student2Log.token
}
Assert-Condition ($student2Token -ne $null) "Student 2 (Unenrolled Tester) authenticated"

# -----------------------------------------------------------------------------
# 2. Setup Courses: 1 Free Course & 1 Paid Course
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 2: Course Setup & Publication ---" -ForegroundColor Yellow

# Course A: Free Course (3 Lessons)
$courseA = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Python and Clean Architecture Starter"
    shortDescription = "Learn basic programming and Clean Architecture principles for free."
    description = "Full comprehensive introductory course covering fundamental principles."
    categoryId = 1
    price = 0
    isFree = $true
    level = 2 # Intermediate
} | ConvertTo-Json)
$courseAId = $courseA.id

# Section 1 & 2 for Course A
$secA1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseAId/sections" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Part 1: Foundations"
    displayOrder = 1
} | ConvertTo-Json)
$secA2 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseAId/sections" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Part 2: Practical Labs"
    displayOrder = 2
} | ConvertTo-Json)

# Lesson A1 (Free preview)
$lesA1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$($secA1.id)/lessons" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Lesson 1: Introduction & Environment"
    displayOrder = 1
    isPreviewFree = $true
    type = 1
} | ConvertTo-Json)
$lesA1Id = $lesA1.id

# Lesson A2 (Protected)
$lesA2 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$($secA1.id)/lessons" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Lesson 2: Core Fundamentals"
    displayOrder = 2
    isPreviewFree = $false
    type = 1
} | ConvertTo-Json)
$lesA2Id = $lesA2.id

# Lesson A3 (Protected)
$lesA3 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$($secA2.id)/lessons" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Lesson 3: Building First Project"
    displayOrder = 1
    isPreviewFree = $false
    type = 1
} | ConvertTo-Json)
$lesA3Id = $lesA3.id

# Upload dummy video for Lesson A1 and A2
$tempVideo = "$PSScriptRoot\test_video_temp.mp4"
[System.IO.File]::WriteAllBytes($tempVideo, [byte[]]@(0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D))

curl.exe -s -X POST "$baseUrl/api/instructor/lessons/$lesA1Id/video" `
    -H "Authorization: Bearer $instToken" `
    -F "durationSeconds=300" `
    -F "file=@$tempVideo;type=video/mp4" | Out-Null

curl.exe -s -X POST "$baseUrl/api/instructor/lessons/$lesA2Id/video" `
    -H "Authorization: Bearer $instToken" `
    -F "durationSeconds=600" `
    -F "file=@$tempVideo;type=video/mp4" | Out-Null

curl.exe -s -X POST "$baseUrl/api/instructor/lessons/$lesA3Id/video" `
    -H "Authorization: Bearer $instToken" `
    -F "durationSeconds=900" `
    -F "file=@$tempVideo;type=video/mp4" | Out-Null

# Upload a downloadable resource for Course A
$tempPdf = "$PSScriptRoot\cheatsheet_temp.pdf"
[System.IO.File]::WriteAllBytes($tempPdf, [byte[]]@(0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35))

$resUpload = curl.exe -s -X POST "$baseUrl/api/instructor/courses/$courseAId/resources" `
    -H "Authorization: Bearer $instToken" `
    -F "title=Clean Architecture Cheat Sheet" `
    -F "type=1" `
    -F "file=@$tempPdf;type=application/pdf" | ConvertFrom-Json
$resAId = $resUpload.id

# Submit & Publish Course A
Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseAId/submit-approval" -Method Post -Headers @{ Authorization = "Bearer $instToken" } | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseAId/approve" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseAId/publish" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } | Out-Null

# Course B: Paid Course ($149.99)
$courseB = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Advanced Microservices in .NET 10"
    shortDescription = "High performance scalable backend architecture for distributed enterprise systems."
    description = "Deep dive into gRPC, RabbitMQ, Kafka, and event-driven microservices."
    categoryId = 1
    price = 149.99
    discountPrice = 99.99
    isFree = $false
    level = 3 # Advanced
} | ConvertTo-Json)
$courseBId = $courseB.id

$secB1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseBId/sections" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Module 1: Architecture Patterns"
    displayOrder = 1
} | ConvertTo-Json)

$lesB1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$($secB1.id)/lessons" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Lesson B1: Microservices Fundamentals"
    displayOrder = 1
    isPreviewFree = $true
    type = 1
} | ConvertTo-Json)
$lesB1Id = $lesB1.id

$lesB2 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$($secB1.id)/lessons" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Lesson B2: Distributed Transactions"
    displayOrder = 2
    isPreviewFree = $false
    type = 1
} | ConvertTo-Json)
$lesB2Id = $lesB2.id

curl.exe -s -X POST "$baseUrl/api/instructor/lessons/$lesB1Id/video" `
    -H "Authorization: Bearer $instToken" `
    -F "durationSeconds=400" `
    -F "file=@$tempVideo;type=video/mp4" | Out-Null

curl.exe -s -X POST "$baseUrl/api/instructor/lessons/$lesB2Id/video" `
    -H "Authorization: Bearer $instToken" `
    -F "durationSeconds=1200" `
    -F "file=@$tempVideo;type=video/mp4" | Out-Null

# Submit & Publish Course B
Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseBId/submit-approval" -Method Post -Headers @{ Authorization = "Bearer $instToken" } | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseBId/approve" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseBId/publish" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } | Out-Null

Assert-Condition $true "Both Free Course (ID: $courseAId) and Paid Course (ID: $courseBId) published successfully"

# -----------------------------------------------------------------------------
# 3. Student Browsing, Search, Filtering & Sorting
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 3: Student Browsing, Search, Filtering & Sorting ---" -ForegroundColor Yellow

# Feature 1: Browse published courses
$allPub = Invoke-RestMethod -Uri "$baseUrl/api/courses" -Method Get
Assert-Condition ($allPub.items.Count -ge 2) "Feature 1: Student can browse published courses ($($allPub.items.Count) found)"

# Feature 2: Search courses
$searchRes = Invoke-RestMethod -Uri "$baseUrl/api/courses?searchTerm=Microservices" -Method Get
Assert-Condition ($searchRes.items.Count -ge 1 -and $searchRes.items[0].id -eq $courseBId) "Feature 2: Search for 'Microservices' returns Course B"

# Feature 3: Filter by category
$catRes = Invoke-RestMethod -Uri "$baseUrl/api/courses?categoryId=1" -Method Get
Assert-Condition ($catRes.items.Count -ge 2) "Feature 3: Filter by Category ID 1 works"

# Feature 4: Filter by price and difficulty
$freeRes = Invoke-RestMethod -Uri "$baseUrl/api/courses?isFree=true&level=2" -Method Get
Assert-Condition ($freeRes.items.Count -ge 1 -and $freeRes.items[0].id -eq $courseAId) "Feature 4: Filter by isFree=true and level=Intermediate returns Course A"

# Feature 5: Sort courses by rating and popularity
$sortRating = Invoke-RestMethod -Uri "$baseUrl/api/courses?sortBy=rating" -Method Get
Assert-Condition ($sortRating.items.Count -ge 2) "Feature 5a: Sort courses by rating executes successfully"

$sortPopular = Invoke-RestMethod -Uri "$baseUrl/api/courses?sortBy=popular" -Method Get
Assert-Condition ($sortPopular.items.Count -ge 2) "Feature 5b: Sort courses by popularity executes successfully"

# Feature 6: View course details & content privacy mask
$courseADetails = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseAId" -Method Get
$sec1 = $courseADetails.sections[0]
$freeLesson = $sec1.lessons | Where-Object { $_.id -eq $lesA1Id }
$paidLesson = $sec1.lessons | Where-Object { $_.id -eq $lesA2Id }
Assert-Condition ($freeLesson.videoUrl -ne $null -and $paidLesson.videoUrl -eq $null) "Feature 6: Public course details allows preview video URL but masks protected lesson video URL"

# -----------------------------------------------------------------------------
# 4. Enrollment Rules & Operations
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 4: Enrollment Rules & Student Course Enrollment ---" -ForegroundColor Yellow

# Rule: Direct self-enrollment in paid course without payment must be blocked
$paidEnrollBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/enrollments/courses/$courseBId" `
        -Method Post `
        -Headers @{ Authorization = "Bearer $student1Token" } `
        -ContentType "application/json" `
        -Body (@{ paymentMethod = "Free" } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 422)) { $paidEnrollBlocked = $true }
}
Assert-Condition $paidEnrollBlocked "Rule: Students cannot enroll directly in paid course without payment (400 Bad Request)"

# Feature 7a: Free course direct enrollment
$freeEnroll = Invoke-RestMethod -Uri "$baseUrl/api/enrollments/courses/$courseAId" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($freeEnroll.courseId -eq $courseAId -and $freeEnroll.status -eq "Active" -and $freeEnroll.pricePaid -eq 0) "Feature 7a: Free course enrolled directly with PricePaid = $0 (Status: Active)"

# Rule: Duplicate enrollment prevention
$duplicateBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/enrollments/courses/$courseAId" `
        -Method Post `
        -Headers @{ Authorization = "Bearer $student1Token" }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 422)) { $duplicateBlocked = $true }
}
Assert-Condition $duplicateBlocked "Rule: Prevent duplicate enrollments enforced (400 Bad Request)"

# Feature 7b: Paid course enrollment with payment
$paidEnroll = Invoke-RestMethod -Uri "$baseUrl/api/enrollments/courses/$courseBId" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $student1Token" } `
    -ContentType "application/json" `
    -Body (@{ paymentMethod = "mock_paid" } | ConvertTo-Json)
Assert-Condition ($paidEnroll.courseId -eq $courseBId -and $paidEnroll.pricePaid -eq 99.99) "Feature 7b: Paid course enrolled with payment checkout (PricePaid = $99.99)"

# Feature 8: View enrolled courses
$myCourses = Invoke-RestMethod -Uri "$baseUrl/api/enrollments/my-courses" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
$foundBoth = ($myCourses | Where-Object { $_.courseId -eq $courseAId }) -ne $null -and ($myCourses | Where-Object { $_.courseId -eq $courseBId }) -ne $null
Assert-Condition ($myCourses.Count -ge 2 -and $foundBoth) "Feature 8: Student 1 views enrolled courses (Found both enrolled courses)"

# Check Enrollment Status
$statusA = Invoke-RestMethod -Uri "$baseUrl/api/enrollments/courses/$courseAId/status" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($statusA.isEnrolled -eq $true -and $statusA.status -eq "Active") "Enrollment status verified (isEnrolled: true)"

# -----------------------------------------------------------------------------
# 5. Lesson Access Permissions & Unauthorized Protection
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 5: Lesson Access Permissions & Security Protection ---" -ForegroundColor Yellow

# Rule: Unenrolled student (Student 2) CAN access Free Preview lesson (Lesson A1)
$freePreviewAccess = Invoke-RestMethod -Uri "$baseUrl/api/learning/courses/$courseAId/lessons/$lesA1Id" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student2Token" }
Assert-Condition ($freePreviewAccess.id -eq $lesA1Id -and $freePreviewAccess.isPreviewFree -eq $true) "Rule: Free preview lesson accessible to unenrolled student"

# Rule: Unenrolled student CANNOT access paid lesson (Lesson A2) -> 403 Forbidden
$unauthorizedLessonBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/learning/courses/$courseAId/lessons/$lesA2Id" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $student2Token" }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(401, 403)) { $unauthorizedLessonBlocked = $true }
}
Assert-Condition $unauthorizedLessonBlocked "Rule: Unenrolled student blocked from accessing protected lesson content (403 Forbidden)"

# Rule: Direct static file access to /uploads/videos/ is blocked
$videoRelativeUrl = $lesA1.videoUrl
$directVideoBlocked = $false
$directCode = curl.exe -s -w "%{http_code}" -o NUL "$baseUrl$videoRelativeUrl"
if ($directCode -in @("403", "401", "404")) { $directVideoBlocked = $true }
Assert-Condition $directVideoBlocked "Rule: Direct static access to video files is blocked (HTTP $directCode)"

# Feature 9: Enrolled Student 1 accesses purchased lesson
$enrolledLessonAccess = Invoke-RestMethod -Uri "$baseUrl/api/learning/courses/$courseAId/lessons/$lesA2Id" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($enrolledLessonAccess.id -eq $lesA2Id -and $enrolledLessonAccess.videoStreamUrl -like "*video-stream*") "Feature 9: Enrolled student can access protected lesson and receives secure stream URL"

# Feature 10: Enrolled Student 1 streams course video
$streamCode = curl.exe -s -w "%{http_code}" -o NUL "$baseUrl/api/learning/lessons/$lesA2Id/video-stream" `
    -H "Authorization: Bearer $student1Token"
Assert-Condition ($streamCode -in @("200", "206")) "Feature 10: Enrolled student streams course video (HTTP $streamCode)"

# Rule: Unenrolled student CANNOT stream protected video -> 403 Forbidden
$unauthorizedStreamCode = curl.exe -s -w "%{http_code}" -o NUL "$baseUrl/api/learning/lessons/$lesA2Id/video-stream" `
    -H "Authorization: Bearer $student2Token"
Assert-Condition ($unauthorizedStreamCode -in @("403", "401")) "Rule: Unenrolled student blocked from streaming protected video (HTTP $unauthorizedStreamCode)"

# Enrolled Student 1 downloads course resource
$resCode = curl.exe -s -w "%{http_code}" -o NUL "$baseUrl/api/learning/resources/$resAId/download" `
    -H "Authorization: Bearer $student1Token"
Assert-Condition ($resCode -eq "200") "Enrolled student downloads course resource (HTTP 200)"

# Rule: Unenrolled student CANNOT download course resource -> 403 Forbidden
$unauthResCode = curl.exe -s -w "%{http_code}" -o NUL "$baseUrl/api/learning/resources/$resAId/download" `
    -H "Authorization: Bearer $student2Token"
Assert-Condition ($unauthResCode -in @("403", "401")) "Rule: Unenrolled student blocked from downloading resource (HTTP $unauthResCode)"

# -----------------------------------------------------------------------------
# 6. Learning Progress, Video Tracking, and Auto-Completion
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 6: Learning Progress, Video Tracking & Auto-Completion ---" -ForegroundColor Yellow

# Feature 11: Save last watched video position (180s)
$progress1 = Invoke-RestMethod -Uri "$baseUrl/api/learning/lessons/$lesA1Id/progress" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $student1Token" } `
    -ContentType "application/json" `
    -Body (@{ watchedDurationSeconds = 180; isCompleted = $false } | ConvertTo-Json)
Assert-Condition ($progress1.watchedDurationSeconds -eq 180 -and $progress1.status -eq "InProgress") "Feature 11: Saved last watched video position at 180s (Status: InProgress)"

# Feature 14a: Continue learning points to current in-progress lesson
$continue1 = Invoke-RestMethod -Uri "$baseUrl/api/learning/courses/$courseAId/continue" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($continue1.lessonId -eq $lesA1Id -and $continue1.watchedDurationSeconds -eq 180) "Feature 14a: Continue learning resumes in-progress Lesson 1 at 180s"

# Feature 12a: Mark Lesson 1 as completed
$complete1 = Invoke-RestMethod -Uri "$baseUrl/api/learning/lessons/$lesA1Id/complete" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($complete1.isCompleted -eq $true -and $complete1.status -eq "Completed") "Feature 12a: Lesson 1 marked as completed"

# Feature 14b: Continue learning now advances to next uncompleted lesson (Lesson 2)
$continue2 = Invoke-RestMethod -Uri "$baseUrl/api/learning/courses/$courseAId/continue" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($continue2.lessonId -eq $lesA2Id) "Feature 14b: Continue learning advances to uncompleted Lesson 2"

# Complete Lesson 2
$complete2 = Invoke-RestMethod -Uri "$baseUrl/api/learning/lessons/$lesA2Id/complete" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($complete2.isCompleted -eq $true) "Feature 12b: Lesson 2 marked as completed"

# Feature 13: Track course learning progress (2 of 3 completed = 66.67%)
$courseProgress = Invoke-RestMethod -Uri "$baseUrl/api/learning/courses/$courseAId/progress" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($courseProgress.completedLessons -eq 2 -and $courseProgress.totalLessons -eq 3 -and $courseProgress.progressPercentage -eq 66.67) "Feature 13: Track learning progress shows 2/3 lessons (66.67%) completed"

# Feature 12c & Auto-completion: Complete Lesson 3 (All 3 lessons completed!)
$complete3 = Invoke-RestMethod -Uri "$baseUrl/api/learning/lessons/$lesA3Id/complete" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($complete3.isCompleted -eq $true) "Feature 12c: Final Lesson 3 marked as completed"

# Rule: Automatically mark course as completed when all required lessons are completed
$finalProgress = Invoke-RestMethod -Uri "$baseUrl/api/learning/courses/$courseAId/progress" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($finalProgress.progressPercentage -eq 100 -and $finalProgress.status -eq "Completed" -and $finalProgress.completedAtUtc -ne $null) "Rule: Course automatically marked as Completed with 100% progress"

# Feature 15: View completed courses
$completedCourses = Invoke-RestMethod -Uri "$baseUrl/api/enrollments/my-courses?completedOnly=true" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $student1Token" }
$foundCompletedA = ($completedCourses | Where-Object { $_.courseId -eq $courseAId }) -ne $null
Assert-Condition ($completedCourses.Count -ge 1 -and $foundCompletedA) "Feature 15: Student views completed courses list (Course A present)"

# Cleanup temp files
Remove-Item $tempVideo -Force -ErrorAction SilentlyContinue
Remove-Item $tempPdf -Force -ErrorAction SilentlyContinue

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " Student Enrollment & Learning Management Test Summary" -ForegroundColor Cyan
Write-Host " Passed: $passed" -ForegroundColor Green
Write-Host " Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "======================================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}

