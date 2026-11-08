# EduSphere LMS - Automated Security & Authorization Test Suite
# Tests all 10 verification criteria requested for the Security Audit

$baseUrl = "http://localhost:5005"
$testTimestamp = Get-Date -Format "yyyyMMddHHmmss"

$passedCount = 0
$failedCount = 0
$results = @()

function Record-TestResult {
    param(
        [string]$TestId,
        [string]$Description,
        [int]$ExpectedStatusCode,
        [int]$ActualStatusCode,
        [bool]$Success,
        [string]$Details = ""
    )

    $status = if ($Success) { "PASS" } else { "FAIL" }
    if ($Success) {
        $global:passedCount++
        Write-Host " [PASS] $TestId - $Description (HTTP $ActualStatusCode)" -ForegroundColor Green
    } else {
        $global:failedCount++
        Write-Host " [FAIL] $TestId - $Description (Expected: $ExpectedStatusCode, Got: $ActualStatusCode) - $Details" -ForegroundColor Red
    }

    $global:results += [PSCustomObject]@{
        Id = $TestId
        Description = $Description
        ExpectedStatus = $ExpectedStatusCode
        ActualStatus = $ActualStatusCode
        Status = $status
        Details = $Details
    }
}

function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null
    )

    $headers = @{}
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $jsonBody = if ($Body) { $Body | ConvertTo-Json -Depth 5 } else { $null }

    try {
        $response = $null
        if ($jsonBody) {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body $jsonBody -ContentType "application/json"
        } else {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers
        }
        return @{
            StatusCode = 200
            Data = $response
            Success = $true
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        $errorBody = ""
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            if ($stream) {
                $reader = New-Object System.IO.StreamReader($stream)
                $errorBody = $reader.ReadToEnd()
            }
        }
        return @{
            StatusCode = $statusCode
            Data = $errorBody
            Success = $false
        }
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  EDUSPHERE LMS: SECURITY & AUTHORIZATION TEST SUITE      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# -------------------------------------------------------------------------
# Test 1: Public Registration Role Boundary
# -------------------------------------------------------------------------
Write-Host "--- TEST GROUP 1: Public Registration & Role Injection ---" -ForegroundColor Yellow

# 1.1 Registering with role: "Admin" must be rejected (400)
$adminRegAttempt = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "Attempted"
    lastName = "Admin"
    email = "tamper_admin_$testTimestamp@edusphere.test"
    password = "SecurePassword@123"
    role = "Admin"
}
$pass = ($adminRegAttempt.StatusCode -eq 400) -and ($adminRegAttempt.Data -match "Admin")
Record-TestResult -TestId "REG-01" -Description "Public registration rejects 'Admin' role injection" -ExpectedStatusCode 400 -ActualStatusCode $adminRegAttempt.StatusCode -Success $pass -Details $adminRegAttempt.Data

# 1.2 Registering with role: "SuperAdmin" must be rejected (400)
$superRegAttempt = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "Attempted"
    lastName = "Super"
    email = "tamper_super_$testTimestamp@edusphere.test"
    password = "SecurePassword@123"
    role = "SuperAdmin"
}
$pass = ($superRegAttempt.StatusCode -eq 400)
Record-TestResult -TestId "REG-02" -Description "Public registration rejects arbitrary unauthorized role ('SuperAdmin')" -ExpectedStatusCode 400 -ActualStatusCode $superRegAttempt.StatusCode -Success $pass -Details $superRegAttempt.Data

# 1.3 Registering valid Student succeeds (200)
$studentEmail = "sec_student_$testTimestamp@edusphere.test"
$studentReg = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "Audit"
    lastName = "Student"
    email = $studentEmail
    password = "StudentP@ssword123"
    role = "Student"
}
$studentToken = if ($studentReg.Data -and $studentReg.Data.token) { $studentReg.Data.token } else { "" }
$pass = ($studentReg.StatusCode -eq 200) -and ($studentReg.Data.roles -contains "Student")
Record-TestResult -TestId "REG-03" -Description "Public registration allows 'Student' role" -ExpectedStatusCode 200 -ActualStatusCode $studentReg.StatusCode -Success $pass

# 1.4 Registering valid Instructor succeeds (200)
$instructorEmail = "sec_instructor_$testTimestamp@edusphere.test"
$instructorReg = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "Audit"
    lastName = "Instructor"
    email = $instructorEmail
    password = "InstructorP@ssword123"
    role = "Instructor"
}
$newInstructorToken = if ($instructorReg.Data -and $instructorReg.Data.token) { $instructorReg.Data.token } else { "" }
$pass = ($instructorReg.StatusCode -eq 200) -and ($instructorReg.Data.roles -contains "Instructor")
Record-TestResult -TestId "REG-04" -Description "Public registration allows 'Instructor' role" -ExpectedStatusCode 200 -ActualStatusCode $instructorReg.StatusCode -Success $pass

# 1.5 Duplicate email registration rejected (400)
$duplicateReg = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "Duplicate"
    lastName = "User"
    email = $studentEmail
    password = "StudentP@ssword123"
    role = "Student"
}
$pass = ($duplicateReg.StatusCode -eq 400) -and ($duplicateReg.Data -match "already exists")
Record-TestResult -TestId "REG-05" -Description "Duplicate email registration rejected with safe error message" -ExpectedStatusCode 400 -ActualStatusCode $duplicateReg.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Test 2: Password Complexity & Policy Consistency
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 2: Password Complexity & Identity Policy ---" -ForegroundColor Yellow

# 2.1 Short password (< 8 chars) rejected (400)
$shortPass = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "Short"
    lastName = "Pass"
    email = "shortpass_$testTimestamp@edusphere.test"
    password = "P@1a"
    role = "Student"
}
$pass = ($shortPass.StatusCode -eq 400)
Record-TestResult -TestId "PWD-01" -Description "Password shorter than 8 characters rejected" -ExpectedStatusCode 400 -ActualStatusCode $shortPass.StatusCode -Success $pass

# 2.2 Password without special character rejected (400)
$noSpecial = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "No"
    lastName = "Special"
    email = "nospecial_$testTimestamp@edusphere.test"
    password = "Password12345"
    role = "Student"
}
$pass = ($noSpecial.StatusCode -eq 400)
Record-TestResult -TestId "PWD-02" -Description "Password without non-alphanumeric character rejected" -ExpectedStatusCode 400 -ActualStatusCode $noSpecial.StatusCode -Success $pass

# 2.3 Password without digit rejected (400)
$noDigit = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/register" -Body @{
    firstName = "No"
    lastName = "Digit"
    email = "nodigit_$testTimestamp@edusphere.test"
    password = "Password@Secret"
    role = "Student"
}
$pass = ($noDigit.StatusCode -eq 400)
Record-TestResult -TestId "PWD-03" -Description "Password without digit rejected" -ExpectedStatusCode 400 -ActualStatusCode $noDigit.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Obtain Standard Role Tokens (Student, Instructor, Admin)
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 3: Authentication & Token Issuance ---" -ForegroundColor Yellow

$adminLogin = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/login" -Body @{
    email = "admin@edusphere.com"
    password = "Admin@123456"
}
$adminToken = if ($adminLogin.Data -and $adminLogin.Data.token) { $adminLogin.Data.token } else { "" }
$pass = ($adminLogin.StatusCode -eq 200) -and ($adminLogin.Data.roles -contains "Admin")
Record-TestResult -TestId "AUTH-01" -Description "Admin login issues valid JWT with 'Admin' role claim" -ExpectedStatusCode 200 -ActualStatusCode $adminLogin.StatusCode -Success $pass

$instructorLogin = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/login" -Body @{
    email = "instructor@edusphere.com"
    password = "Instructor@123456"
}
$instructorToken = if ($instructorLogin.Data -and $instructorLogin.Data.token) { $instructorLogin.Data.token } else { "" }
$pass = ($instructorLogin.StatusCode -eq 200) -and ($instructorLogin.Data.roles -contains "Instructor")
Record-TestResult -TestId "AUTH-02" -Description "Instructor login issues valid JWT with 'Instructor' role claim" -ExpectedStatusCode 200 -ActualStatusCode $instructorLogin.StatusCode -Success $pass

$seededStudentLogin = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/login" -Body @{
    email = "student@edusphere.com"
    password = "Student@123456"
}
$seededStudentToken = if ($seededStudentLogin.Data -and $seededStudentLogin.Data.token) { $seededStudentLogin.Data.token } else { "" }
$pass = ($seededStudentLogin.StatusCode -eq 200) -and ($seededStudentLogin.Data.roles -contains "Student")
Record-TestResult -TestId "AUTH-03" -Description "Student login issues valid JWT with 'Student' role claim" -ExpectedStatusCode 200 -ActualStatusCode $seededStudentLogin.StatusCode -Success $pass

# Invalid credentials login rejected (401)
$invalidLogin = Invoke-ApiTest -Method "Post" -Endpoint "/api/auth/login" -Body @{
    email = "admin@edusphere.com"
    password = "WrongPassword999!"
}
$pass = ($invalidLogin.StatusCode -eq 401)
Record-TestResult -TestId "AUTH-04" -Description "Invalid login credentials returns 401 Unauthorized" -ExpectedStatusCode 401 -ActualStatusCode $invalidLogin.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Test 4: Anonymous Access Restrictions (401 Unauthorized)
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 4: Unauthenticated Access Control (401) ---" -ForegroundColor Yellow

$anonEndpoints = @(
    @{ Endpoint = "/api/admin/dashboard"; Name = "Admin Dashboard" },
    @{ Endpoint = "/api/admin/courses"; Name = "Admin Courses" },
    @{ Endpoint = "/api/admin/Users"; Name = "Admin User Management" },
    @{ Endpoint = "/api/instructor/dashboard"; Name = "Instructor Dashboard" },
    @{ Endpoint = "/api/instructor/courses"; Name = "Instructor Courses" },
    @{ Endpoint = "/api/enrollments/my-courses"; Name = "Enrolled Courses" },
    @{ Endpoint = "/api/auth/me"; Name = "Current User Profile" },
    @{ Endpoint = "/api/orders/my-orders"; Name = "My Orders" },
    @{ Endpoint = "/api/payments/my-payments"; Name = "My Payments" }
)

$i = 1
foreach ($ep in $anonEndpoints) {
    $res = Invoke-ApiTest -Method "Get" -Endpoint $ep.Endpoint
    $pass = ($res.StatusCode -eq 401)
    Record-TestResult -TestId "ANON-$($i.ToString('D2'))" -Description "Anonymous request to $($ep.Name) blocked (401)" -ExpectedStatusCode 401 -ActualStatusCode $res.StatusCode -Success $pass
    $i++
}

# -------------------------------------------------------------------------
# Test 5: Tampered JWT Token Handling (401 Unauthorized)
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 5: Tampered / Forged Token Security ---" -ForegroundColor Yellow

$parts = $adminToken.Split('.')
if ($parts.Length -eq 3) {
    # Tamper with the signature portion
    $tamperedToken = "$($parts[0]).$($parts[1]).TAMPERED_SIGNATURE_XXXX"
    $res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/dashboard" -Token $tamperedToken
    $pass = ($res.StatusCode -eq 401)
    Record-TestResult -TestId "TAMP-01" -Description "Tampered JWT signature rejected with 401 Unauthorized" -ExpectedStatusCode 401 -ActualStatusCode $res.StatusCode -Success $pass
}

# -------------------------------------------------------------------------
# Test 6: Role-Based Authorization - Student Restrictions (403 Forbidden)
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 6: Student Role Boundaries (403 Forbidden) ---" -ForegroundColor Yellow

# 6.1 Student cannot access Admin Dashboard
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/dashboard" -Token $studentToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-STU-01" -Description "Student blocked from Admin Dashboard (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 6.2 Student cannot access Admin Courses
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/courses" -Token $studentToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-STU-02" -Description "Student blocked from Admin Courses management (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 6.3 Student cannot access Admin Users
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/Users" -Token $studentToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-STU-03" -Description "Student blocked from Admin User Management (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 6.4 Student cannot access Admin Payment Report
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/payments/admin/report" -Token $studentToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-STU-04" -Description "Student blocked from Admin Financial Reports (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 6.5 Student cannot access Instructor Dashboard
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/instructor/dashboard" -Token $studentToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-STU-05" -Description "Student blocked from Instructor Dashboard (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 6.6 Student cannot access Instructor Courses
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/instructor/courses" -Token $studentToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-STU-06" -Description "Student blocked from Instructor Course Creation/Editing (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 6.7 Student can access own Student endpoints
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/enrollments/my-courses" -Token $studentToken
$pass = ($res.StatusCode -eq 200)
Record-TestResult -TestId "RBAC-STU-07" -Description "Student permitted to access own Enrolled Courses (200)" -ExpectedStatusCode 200 -ActualStatusCode $res.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Test 7: Role-Based Authorization - Instructor Restrictions (403 Forbidden)
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 7: Instructor Role Boundaries ---" -ForegroundColor Yellow

# 7.1 Instructor cannot access Admin Dashboard
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/dashboard" -Token $instructorToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-INS-01" -Description "Instructor blocked from Admin Dashboard (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 7.2 Instructor cannot access Admin Courses
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/courses" -Token $instructorToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-INS-02" -Description "Instructor blocked from Admin Course Operations (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 7.3 Instructor cannot access Admin Users
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/Users" -Token $instructorToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-INS-03" -Description "Instructor blocked from Admin User Management (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 7.4 Instructor cannot access Admin Financial Report
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/payments/admin/report" -Token $instructorToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RBAC-INS-04" -Description "Instructor blocked from Platform-wide Admin Financial Reports (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# 7.5 Instructor can access Instructor Dashboard
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/instructor/dashboard" -Token $instructorToken
$pass = ($res.StatusCode -eq 200)
Record-TestResult -TestId "RBAC-INS-05" -Description "Instructor permitted to access Instructor Dashboard (200)" -ExpectedStatusCode 200 -ActualStatusCode $res.StatusCode -Success $pass

# 7.6 Instructor can access Instructor Courses
$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/instructor/courses" -Token $instructorToken
$pass = ($res.StatusCode -eq 200)
Record-TestResult -TestId "RBAC-INS-06" -Description "Instructor permitted to access own Instructor Courses (200)" -ExpectedStatusCode 200 -ActualStatusCode $res.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Test 8: Admin Privileges & System Governance
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 8: Admin Privileges & System Governance ---" -ForegroundColor Yellow

$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/dashboard" -Token $adminToken
$pass = ($res.StatusCode -eq 200)
Record-TestResult -TestId "RBAC-ADM-01" -Description "Admin accesses Admin Dashboard (200)" -ExpectedStatusCode 200 -ActualStatusCode $res.StatusCode -Success $pass

$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/courses" -Token $adminToken
$pass = ($res.StatusCode -eq 200)
Record-TestResult -TestId "RBAC-ADM-02" -Description "Admin accesses Admin Courses management (200)" -ExpectedStatusCode 200 -ActualStatusCode $res.StatusCode -Success $pass

$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/admin/Users" -Token $adminToken
$pass = ($res.StatusCode -eq 200)
Record-TestResult -TestId "RBAC-ADM-03" -Description "Admin accesses Admin User Management (200)" -ExpectedStatusCode 200 -ActualStatusCode $res.StatusCode -Success $pass

$res = Invoke-ApiTest -Method "Get" -Endpoint "/api/payments/admin/report" -Token $adminToken
$pass = ($res.StatusCode -eq 200)
Record-TestResult -TestId "RBAC-ADM-04" -Description "Admin accesses Platform Revenue Report (200)" -ExpectedStatusCode 200 -ActualStatusCode $res.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Test 9: Server-Side Course Approval Enforcement
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 9: Server-Side Workflow Enforcement ---" -ForegroundColor Yellow

# Non-admin instructor attempting to call admin approve endpoint (403)
$res = Invoke-ApiTest -Method "Post" -Endpoint "/api/admin/courses/1/approve" -Token $instructorToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "FLOW-01" -Description "Instructor cannot approve courses directly via Admin API (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# Non-admin instructor attempting to publish directly via Admin API (403)
$res = Invoke-ApiTest -Method "Post" -Endpoint "/api/admin/courses/1/publish" -Token $instructorToken
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "FLOW-02" -Description "Instructor cannot publish courses directly via Admin API (403)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Test 10: Resource Protection & Static Files
# -------------------------------------------------------------------------
Write-Host "`n--- TEST GROUP 10: Resource Protection & Media Access Control ---" -ForegroundColor Yellow

# Static video route blocked without authorization (403)
$res = Invoke-ApiTest -Method "Get" -Endpoint "/uploads/videos/sample.mp4"
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RES-01" -Description "Direct static access to /uploads/videos/ blocked (403 Forbidden)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# Static resources route blocked without authorization (403)
$res = Invoke-ApiTest -Method "Get" -Endpoint "/uploads/resources/sample.pdf"
$pass = ($res.StatusCode -eq 403)
Record-TestResult -TestId "RES-02" -Description "Direct static access to /uploads/resources/ blocked (403 Forbidden)" -ExpectedStatusCode 403 -ActualStatusCode $res.StatusCode -Success $pass

# -------------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Total Tests Run: $($results.Count)"
Write-Host " Passed: $passedCount" -ForegroundColor Green
Write-Host " Failed: $failedCount" -ForegroundColor $(if ($failedCount -eq 0) { "Green" } else { "Red" })
Write-Host "==========================================================" -ForegroundColor Cyan

if ($failedCount -gt 0) {
    exit 1
} else {
    exit 0
}
