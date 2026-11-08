<#
.SYNOPSIS
    Starts EduSphere LMS in Self-Hosted Unified Production Mode.
    Combines the compiled React 19 Frontend and .NET 10 Web API into a single host.
#>

param(
    [int]$Port = 5005,
    [switch]$RebuildFrontend = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    EduSphere LMS - Self-Hosted Production Server         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if ($RebuildFrontend -or -not (Test-Path "src\EduSphere.Api\wwwroot\index.html")) {
    Write-Host "`n[1/3] Building production React client..." -ForegroundColor Yellow
    Push-Location frontend
    npm.cmd run build
    Pop-Location

    Write-Host "`n[2/3] Deploying static bundle to ASP.NET Core wwwroot..." -ForegroundColor Yellow
    Copy-Item -Path "frontend\dist\*" -Destination "src\EduSphere.Api\wwwroot" -Recurse -Force
} else {
    Write-Host "`n[1/2] Production frontend bundle is ready in wwwroot." -ForegroundColor Green
}

# Determine local IP address on LAN
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notmatch "Loopback|vEthernet" -and $_.IPAddress -notmatch "^169\." 
} | Select-Object -First 1).IPAddress

Write-Host "`n[2/2] Launching ASP.NET Core Host on 0.0.0.0:$Port..." -ForegroundColor Yellow
Write-Host ""
Write-Host "----------------------------------------------------------" -ForegroundColor Green
Write-Host " EduSphere LMS is live and accessible at:" -ForegroundColor Green
Write-Host "   Local Machine : http://localhost:$Port" -ForegroundColor Cyan
if ($localIp) {
    Write-Host "   Local Network : http://${localIp}:$Port  (Phone / Tablet / Other PCs)" -ForegroundColor Cyan
}
Write-Host "   Swagger/OpenAPI: http://localhost:$Port/openapi/v1.json" -ForegroundColor Gray
Write-Host "----------------------------------------------------------" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to shut down the server." -ForegroundColor Gray
Write-Host ""

dotnet run --project src/EduSphere.Api --urls "http://0.0.0.0:$Port"
