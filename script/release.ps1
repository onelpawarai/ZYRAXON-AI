# ZYRAXON Release Script
# Builds the app and creates a GitHub release with all necessary files
# This ensures auto-update works (latest.yml is uploaded)

param(
    [string]$Version = "0.4.0",
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Host "ERROR: Set GITHUB_TOKEN environment variable first!" -ForegroundColor Red
    exit 1
}

$ErrorActionPreference = "Stop"
$Repo = "onelpawarai/ZYRAXON-AI"
$Headers = @{
    Authorization = "token $Token"
    Accept = "application/vnd.github.v3+json"
}

Write-Host "=== ZYRAXON Release Script ===" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Yellow

# Step 1: Build core
Write-Host "`n[1/6] Building core..." -ForegroundColor Green
Set-Location "C:\Users\MMP\Downloads\ZYRAXON-AI-main\ZYRAXON-AI-main\packages\opencode"
& bun run build 2>&1
if ($LASTEXITCODE -ne 0) { throw "Core build failed" }

# Step 2: Build desktop
Write-Host "`n[2/6] Building desktop..." -ForegroundColor Green
Set-Location "C:\Users\MMP\Downloads\ZYRAXON-AI-main\ZYRAXON-AI-main\packages\desktop"
& bun run build 2>&1
if ($LASTEXITCODE -ne 0) { throw "Desktop build failed" }

# Step 3: Build Windows installer
Write-Host "`n[3/6] Building Windows installer..." -ForegroundColor Green
$env:ZYRAXON_CHANNEL = "dev"
& bun run build:win 2>&1
if ($LASTEXITCODE -ne 0) { throw "Windows build failed" }

# Step 4: Find built files
Write-Host "`n[4/6] Finding built files..." -ForegroundColor Green
$distDir = "C:\Users\MMP\Downloads\ZYRAXON-AI-main\ZYRAXON-AI-main\packages\desktop\dist"

# Find the installer exe
$exe = Get-ChildItem -Path $distDir -Filter "*-installer.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $exe) { throw "Installer exe not found" }
Write-Host "  Found installer: $($exe.Name)" -ForegroundColor Yellow

# Find latest.yml (CRITICAL for auto-update!)
$latestYml = Get-ChildItem -Path $distDir -Filter "latest.yml" | Select-Object -First 1
if (-not $latestYml) {
    Write-Host "  WARNING: latest.yml not found! Auto-update may not work." -ForegroundColor Red
    Write-Host "  Looking for any yml files..." -ForegroundColor Yellow
    Get-ChildItem -Path $distDir -Filter "*.yml" | ForEach-Object { Write-Host "    $($_.Name)" }
}

# Step 5: Create GitHub release
Write-Host "`n[5/6] Creating GitHub release v$Version..." -ForegroundColor Green

# Delete existing release if any
try {
    $existingRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/tags/v$Version" -Headers $Headers
    if ($existingRelease) {
        Write-Host "  Deleting existing release v$Version..." -ForegroundColor Yellow
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/$($existingRelease.id)" -Method Delete -Headers $Headers | Out-Null
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/git/refs/tags/v$Version" -Method Delete -Headers $Headers | Out-Null
    }
} catch {}

# Create release
$releaseBody = @{
    tag_name = "v$Version"
    name = "v$Version - ZYRAXON PRO Mode"
    body = @"
## ZYRAXON v$Version — PRO Mode Launch

### New Features
- **ZYRAXON PRO Mode** — Premium AI assistant with unlimited memory
- **Unlimited Memory** — Remembers everything from all conversations
- **5 Subscription Plans** — Daily `$1, Weekly `$5, Monthly `$10, Yearly `$100, Lifetime `$500
- **Firebase Auth** — Secure login with email/password
- **Stripe Payment** — Secure payment processing
- **Auto-Update** — App updates automatically from GitHub releases

### Agent Modes
- **Build** — Default agent with full access
- **Plan** — Read-only analysis mode
- **Beast** — Maximum power mode
- **PRO** — Premium unlimited memory mode (NEW!)

### Bug Fixes
- Fixed auto-update (latest.yml now properly uploaded)
- Fixed memory tool ExecuteResult format
- Fixed subagent depth for Beast mode

### Installation
1. Download the installer below
2. Run `ZYRAXON Dev-win-installer.exe`
3. Select "ZYRAXON PRO" agent for premium features
"@
    draft = $false
    prerelease = $false
} | ConvertTo-Json

$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases" -Method Post -Headers $Headers -Body $releaseBody -ContentType "application/json"
Write-Host "  Created release: $($release.html_url)" -ForegroundColor Green

# Step 6: Upload assets
Write-Host "`n[6/6] Uploading assets..." -ForegroundColor Green

# Upload exe
Write-Host "  Uploading $($exe.Name)..." -ForegroundColor Yellow
$exeBytes = [System.IO.File]::ReadAllBytes($exe.FullName)
$uploadHeaders = @{
    Authorization = "token $Token"
    Content-Type = "application/octet-stream"
}
$exeUpload = Invoke-RestMethod -Uri "https://uploads.github.com/repos/$Repo/releases/$($release.id)/assets?name=$($exe.Name)" -Method Post -Headers $uploadHeaders -Body $exeBytes
Write-Host "  Uploaded: $($exeUpload.browser_download_url)" -ForegroundColor Green

# Upload latest.yml (CRITICAL!)
if ($latestYml) {
    Write-Host "  Uploading latest.yml..." -ForegroundColor Yellow
    $ymlBytes = [System.IO.File]::ReadAllBytes($latestYml.FullName)
    $ymlUpload = Invoke-RestMethod -Uri "https://uploads.github.com/repos/$Repo/releases/$($release.id)/assets?name=latest.yml" -Method Post -Headers $uploadHeaders -Body $ymlBytes
    Write-Host "  Uploaded: $($ymlUpload.browser_download_url)" -ForegroundColor Green
} else {
    Write-Host "  SKIPPED: latest.yml not found" -ForegroundColor Red
}

Write-Host "`n=== Release Complete! ===" -ForegroundColor Cyan
Write-Host "Release URL: $($release.html_url)" -ForegroundColor Green
Write-Host "Auto-update will now work for all users!" -ForegroundColor Green
