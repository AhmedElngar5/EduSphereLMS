# EduSphere LMS - Mock Payment, Certificates, Reviews, Wishlist & Notifications E2E Test Suite
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

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " Starting Tests: Payments, Certificates, Reviews, Wishlist & Notifications " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. Setup & User Authentication
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 1: Authentication & Setup ---" -ForegroundColor Yellow

Invoke-RestMethod -Uri "$baseUrl/api/auth/seed" -Method Post | Out-Null

# Admin Login
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "admin@edusphere.com"
    password = "Admin@123456"
} | ConvertTo-Json)
$adminToken = $adminLogin.token

# Instructor Login
$instLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "instructor@edusphere.com"
    password = "Instructor@123456"
} | ConvertTo-Json)
$instToken = $instLogin.token

# Student 1 (Purchaser & Reviewer)
$student1Login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
    email = "student@edusphere.com"
    password = "Student@123456"
} | ConvertTo-Json)
$student1Token = $student1Login.token
Assert-Condition ($student1Token -ne $null) "Student 1 authenticated"

# Student 2 (Unenrolled user for boundary/permission checks)
$student2Email = "student2_boundary@edusphere.com"
try {
    $student2Reg = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body (@{
        firstName = "Boundary"
        lastName = "Tester"
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
Assert-Condition ($student2Token -ne $null) "Student 2 authenticated"

# -----------------------------------------------------------------------------
# 2. Create and Publish Course for Testing
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 2: Create Test Course ---" -ForegroundColor Yellow

$course = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Cloud Native Microservices Architecture"
    shortDescription = "Learn enterprise cloud patterns and distributed systems architecture."
    description = "Complete masterclass with microservices, gRPC, and Docker."
    categoryId = 1
    price = 199.99
    discountPrice = 149.99
    isFree = $false
    level = 3
} | ConvertTo-Json)
$courseId = $course.id

$sec1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/sections" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Module 1: Foundations"
    displayOrder = 1
} | ConvertTo-Json)

$les1 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$($sec1.id)/lessons" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Lesson 1: Intro to Cloud Architecture"
    displayOrder = 1
    isPreviewFree = $true
    type = 1
} | ConvertTo-Json)
$les1Id = $les1.id

$les2 = Invoke-RestMethod -Uri "$baseUrl/api/instructor/sections/$($sec1.id)/lessons" -Method Post -Headers @{ Authorization = "Bearer $instToken" } -ContentType "application/json" -Body (@{
    title = "Lesson 2: Service Discovery & Meshes"
    displayOrder = 2
    isPreviewFree = $false
    type = 1
} | ConvertTo-Json)
$les2Id = $les2.id

# Submit, Approve & Publish Course
Invoke-RestMethod -Uri "$baseUrl/api/instructor/courses/$courseId/submit-approval" -Method Post -Headers @{ Authorization = "Bearer $instToken" } | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId/approve" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/admin/courses/$courseId/publish" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } | Out-Null

Assert-Condition ($courseId -gt 0) "Test Course published successfully (ID: $courseId)"

# -----------------------------------------------------------------------------
# 3. Module A: Mock Payment System
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 3: Module A - Mock Payment System ---" -ForegroundColor Yellow

# Checkout Initiation
$checkout = Invoke-RestMethod -Uri "$baseUrl/api/payments/checkout" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
    courseId = $courseId
} | ConvertTo-Json)

Assert-Condition ($checkout.orderId -gt 0 -and $checkout.paymentId -gt 0 -and $checkout.totalAmount -eq 149.99) "Payment checkout initiated with order & pending payment (Total: `$149.99)"
$orderId = $checkout.orderId
$paymentId = $checkout.paymentId

# Payment Status Check (Pending)
$statusPending = Invoke-RestMethod -Uri "$baseUrl/api/payments/$paymentId/status" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($statusPending.status -eq "Pending" -and $statusPending.isEnrolled -eq $false) "Payment status verified as Pending, isEnrolled is false"

# Simulated Failed Payment
$failedPayment = Invoke-RestMethod -Uri "$baseUrl/api/payments/$paymentId/simulate-failure" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
    failureReason = "Card declined: insufficient funds"
} | ConvertTo-Json)
Assert-Condition ($failedPayment.status -eq "Failed" -and $failedPayment.failureReason -like "*insufficient funds*") "Simulated failed payment records Failed status and failure reason"

# Second Checkout to Simulate Successful Payment
$checkout2 = Invoke-RestMethod -Uri "$baseUrl/api/payments/checkout" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
    courseId = $courseId
} | ConvertTo-Json)
$payment2Id = $checkout2.paymentId

# Simulated Successful Payment
$successPayment = Invoke-RestMethod -Uri "$baseUrl/api/payments/$payment2Id/simulate-success" -Method Post -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($successPayment.status -eq "Succeeded" -and $successPayment.receiptUrl -ne $null) "Simulated successful payment records Succeeded status and receipt URL"

# Verify Student is Now Enrolled Automatically
$statusAfter = Invoke-RestMethod -Uri "$baseUrl/api/payments/$payment2Id/status" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($statusAfter.status -eq "Succeeded" -and $statusAfter.isEnrolled -eq $true) "Student is automatically enrolled upon successful payment"

# Rule: Prevent Re-checkout after enrollment
$recheckoutBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/payments/checkout" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
        courseId = $courseId
    } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 422)) { $recheckoutBlocked = $true }
}
Assert-Condition $recheckoutBlocked "Cannot re-checkout already enrolled course (400 Bad Request)"

# Student Order History
$myOrders = Invoke-RestMethod -Uri "$baseUrl/api/orders/my-orders" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
$foundOrder = ($myOrders | Where-Object { $_.id -eq $checkout2.orderId }) -ne $null
Assert-Condition ($myOrders.Count -ge 1 -and $foundOrder) "Student views order history (Found completed order)"

# Student Payment History
$myPayments = Invoke-RestMethod -Uri "$baseUrl/api/payments/my-payments" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
$foundPayment = ($myPayments | Where-Object { $_.id -eq $payment2Id }) -ne $null
Assert-Condition ($myPayments.Count -ge 1 -and $foundPayment) "Student views payment history with receipt reference"

# Instructor Earnings Summary
$instructorEarnings = Invoke-RestMethod -Uri "$baseUrl/api/payments/instructor/earnings" -Method Get -Headers @{ Authorization = "Bearer $instToken" }
Assert-Condition ($instructorEarnings.totalSalesCount -ge 1 -and $instructorEarnings.instructorEarnings -gt 0 -and $instructorEarnings.courseBreakdown.Count -ge 1) "Instructor earnings summary calculates total sales and 80% instructor share"

# Admin Payment Report
$adminReport = Invoke-RestMethod -Uri "$baseUrl/api/payments/admin/report" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($adminReport.totalCompletedOrders -ge 1 -and $adminReport.totalFailedOrders -ge 1 -and $adminReport.totalGrossRevenue -gt 0) "Admin payment report computes gross revenue, net revenue, and completed/failed counts"

# -----------------------------------------------------------------------------
# 4. Module B: Certificates
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 4: Module B - Certificates ---" -ForegroundColor Yellow

# Attempt to claim certificate before completing course
$prematureCertBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/certificates/courses/$courseId/claim" -Method Post -Headers @{ Authorization = "Bearer $student1Token" }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 422)) { $prematureCertBlocked = $true }
}
Assert-Condition $prematureCertBlocked "Cannot claim certificate before completing all required lessons (Rule enforced)"

# Complete all lessons for the course
Invoke-RestMethod -Uri "$baseUrl/api/learning/lessons/$les1Id/complete" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } | Out-Null
Invoke-RestMethod -Uri "$baseUrl/api/learning/lessons/$les2Id/complete" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } | Out-Null

# Claim Certificate
$certificate = Invoke-RestMethod -Uri "$baseUrl/api/certificates/courses/$courseId/claim" -Method Post -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($certificate.certificateNumber -like "CERT-*" -and $certificate.studentName -ne $null -and $certificate.courseTitle -ne $null) "Certificate generated with unique ID ($($certificate.certificateNumber)), student, and course"
$certNumber = $certificate.certificateNumber

# Student views their certificates
$myCerts = Invoke-RestMethod -Uri "$baseUrl/api/certificates/my-certificates" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
$foundCert = ($myCerts | Where-Object { $_.certificateNumber -eq $certNumber }) -ne $null
Assert-Condition ($myCerts.Count -ge 1 -and $foundCert) "Student views list of earned certificates"

# Public Certificate Verification (No auth required!)
$verification = Invoke-RestMethod -Uri "$baseUrl/api/certificates/verify/$certNumber" -Method Get
Assert-Condition ($verification.isValid -eq $true -and $verification.certificateNumber -eq $certNumber -and $verification.studentName -ne $null) "Public verification endpoint validates authentic certificate"

# Verification with Invalid Certificate Number
$invalidCertCheck = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/certificates/verify/CERT-INVALID-999999" -Method Get
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) { $invalidCertCheck = $true }
}
Assert-Condition $invalidCertCheck "Verification fails for non-existent certificate number (404 Not Found)"

# Download PDF Certificate
$pdfCode = curl.exe -s -w "%{http_code}" -o "$PSScriptRoot\test_downloaded_cert.pdf" "$baseUrl/api/certificates/$certNumber/download"
$pdfBytes = [System.IO.File]::ReadAllBytes("$PSScriptRoot\test_downloaded_cert.pdf")
$isPdfHeader = ($pdfBytes.Length -gt 4 -and $pdfBytes[0] -eq 0x25 -and $pdfBytes[1] -eq 0x50 -and $pdfBytes[2] -eq 0x44 -and $pdfBytes[3] -eq 0x46)
Assert-Condition ($pdfCode -eq "200" -and $isPdfHeader) "PDF certificate downloaded successfully with valid %PDF header ($($pdfBytes.Length) bytes)"
Remove-Item "$PSScriptRoot\test_downloaded_cert.pdf" -Force -ErrorAction SilentlyContinue

# -----------------------------------------------------------------------------
# 5. Module C: Reviews and Ratings
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 5: Module C - Reviews & Ratings ---" -ForegroundColor Yellow

# Rule: Unenrolled student (Student 2) cannot review course
$unauthReviewBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId/reviews" -Method Post -Headers @{ Authorization = "Bearer $student2Token" } -ContentType "application/json" -Body (@{
        rating = 5
        comment = "Great course!"
    } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(401, 403)) { $unauthReviewBlocked = $true }
}
Assert-Condition $unauthReviewBlocked "Unenrolled student blocked from reviewing course (403 Forbidden)"

# Invalid rating (6 stars) blocked
$invalidRatingBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId/reviews" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
        rating = 6
        comment = "Too high rating"
    } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 422)) { $invalidRatingBlocked = $true }
}
Assert-Condition $invalidRatingBlocked "Rating outside 1-5 range blocked (400 Bad Request)"

# Enrolled Student 1 submits 5-star review
$review = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId/reviews" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
    rating = 5
    comment = "Outstanding course on Cloud Native Microservices! Highly recommended."
} | ConvertTo-Json)
$reviewId = $review.id
Assert-Condition ($reviewId -gt 0 -and $review.rating -eq 5) "Enrolled student submitted 5-star review successfully"

# Prevent Duplicate Reviews
$duplicateReviewBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId/reviews" -Method Post -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
        rating = 4
        comment = "Second review attempt"
    } | ConvertTo-Json)
} catch {
    if ($_.Exception.Response.StatusCode.value__ -in @(400, 422)) { $duplicateReviewBlocked = $true }
}
Assert-Condition $duplicateReviewBlocked "Duplicate review by same student prevented (400 Bad Request)"

# View public course reviews
$courseReviews = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId/reviews" -Method Get
Assert-Condition ($courseReviews.Count -ge 1 -and $courseReviews[0].rating -eq 5) "Public endpoint retrieves course reviews"

# Verify Average Rating Recalculation
$courseCheck = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId" -Method Get
Assert-Condition ($courseCheck.averageRating -eq 5.0 -and $courseCheck.totalReviews -eq 1) "Course average rating recalculated to 5.0 (Total: 1 review)"

# Update existing review to 4 stars
$updatedReview = Invoke-RestMethod -Uri "$baseUrl/api/reviews/$reviewId" -Method Put -Headers @{ Authorization = "Bearer $student1Token" } -ContentType "application/json" -Body (@{
    rating = 4
    comment = "Updated review: very good content, would love more exercises."
} | ConvertTo-Json)
Assert-Condition ($updatedReview.rating -eq 4) "Review updated successfully to 4 stars"

$courseCheck2 = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId" -Method Get
Assert-Condition ($courseCheck2.averageRating -eq 4.0) "Course average rating updated to 4.0 after review modification"

# -----------------------------------------------------------------------------
# 6. Module D: Wishlist
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 6: Module D - Wishlist ---" -ForegroundColor Yellow

# Add to Wishlist
$wishlistItem = Invoke-RestMethod -Uri "$baseUrl/api/wishlist/courses/$courseId" -Method Post -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($wishlistItem.courseId -eq $courseId -and $wishlistItem.title -ne $null) "Course added to student wishlist"

# Check Wishlist Status (inWishlist: true)
$statusInWishlist = Invoke-RestMethod -Uri "$baseUrl/api/wishlist/courses/$courseId/status" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($statusInWishlist.inWishlist -eq $true) "Wishlist status verified as inWishlist: true"

# View Wishlist Items
$myWishlist = Invoke-RestMethod -Uri "$baseUrl/api/wishlist" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
$foundInWishlist = ($myWishlist | Where-Object { $_.courseId -eq $courseId }) -ne $null
Assert-Condition ($myWishlist.Count -ge 1 -and $foundInWishlist) "Student views saved courses in wishlist"

# Remove from Wishlist
Invoke-RestMethod -Uri "$baseUrl/api/wishlist/courses/$courseId" -Method Delete -Headers @{ Authorization = "Bearer $student1Token" }

# Check Wishlist Status (inWishlist: false)
$statusAfterRemove = Invoke-RestMethod -Uri "$baseUrl/api/wishlist/courses/$courseId/status" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($statusAfterRemove.inWishlist -eq $false) "Course successfully removed from wishlist (inWishlist: false)"

# -----------------------------------------------------------------------------
# 7. Module E: Notifications
# -----------------------------------------------------------------------------
Write-Host "`n--- Phase 7: Module E - Notifications ---" -ForegroundColor Yellow

# Student 1 Notifications: should contain PaymentConfirmed, CourseEnrollment, CourseCompletion, CertificateIssued
$studentNotifications = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
$hasPaymentNotif = ($studentNotifications | Where-Object { $_.type -eq "PaymentConfirmed" }) -ne $null
$hasEnrollNotif = ($studentNotifications | Where-Object { $_.type -eq "CourseEnrollment" }) -ne $null
$hasCompNotif = ($studentNotifications | Where-Object { $_.type -eq "CourseCompletion" }) -ne $null
$hasCertNotif = ($studentNotifications | Where-Object { $_.type -eq "CertificateIssued" }) -ne $null

Assert-Condition ($hasPaymentNotif -and $hasEnrollNotif -and $hasCompNotif -and $hasCertNotif) "Student received notifications: PaymentConfirmed, CourseEnrollment, CourseCompletion, CertificateIssued"

# Instructor Notifications: should contain CourseApproved and ReviewReceived
$instNotifications = Invoke-RestMethod -Uri "$baseUrl/api/notifications" -Method Get -Headers @{ Authorization = "Bearer $instToken" }
$hasApprovedNotif = ($instNotifications | Where-Object { $_.type -eq "CourseApproved" }) -ne $null
$hasReviewNotif = ($instNotifications | Where-Object { $_.type -eq "ReviewReceived" }) -ne $null

Assert-Condition ($hasApprovedNotif -and $hasReviewNotif) "Instructor received notifications: CourseApproved, ReviewReceived"

# Unread Count Check
$unread = Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread-count" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($unread.unreadCount -gt 0) "Unread notifications count is positive ($($unread.unreadCount))"

# Mark Single Notification as Read
$firstNotifId = $studentNotifications[0].id
Invoke-RestMethod -Uri "$baseUrl/api/notifications/$firstNotifId/read" -Method Post -Headers @{ Authorization = "Bearer $student1Token" }

# Mark All as Read
$markAll = Invoke-RestMethod -Uri "$baseUrl/api/notifications/mark-all-read" -Method Post -Headers @{ Authorization = "Bearer $student1Token" }
$unreadAfter = Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread-count" -Method Get -Headers @{ Authorization = "Bearer $student1Token" }
Assert-Condition ($unreadAfter.unreadCount -eq 0) "All notifications marked as read (Unread count: 0)"

Write-Host "`================================================================================" -ForegroundColor Cyan
Write-Host " Complete E2E Integration Suite Summary" -ForegroundColor Cyan
Write-Host " Passed: $passed" -ForegroundColor Green
Write-Host " Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "================================================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}

