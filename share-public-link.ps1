<#
.SYNOPSIS
    Exposes EduSphere LMS to the public Internet with an instant HTTPS live link.
#>

param(
    [int]$Port = 5005
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    EduSphere LMS - Public Internet Live Tunnel           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Fetch tunnel password (public IP) for verification
Write-Host "`nConnecting to secure public tunnel..." -ForegroundColor Yellow

$ip = (curl.exe -s https://loca.lt/mytunnelpassword).Trim()

Write-Host ""
Write-Host "----------------------------------------------------------" -ForegroundColor Green
Write-Host " Your Tunnel Password (if prompted on first load): $ip" -ForegroundColor Yellow
Write-Host " Forwarding traffic to: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Green
Write-Host ""

npx.cmd localtunnel --port $Port
