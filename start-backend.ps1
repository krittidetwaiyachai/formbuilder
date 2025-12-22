# Start Backend Server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan

Set-Location backend

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env file first" -ForegroundColor Yellow
    exit 1
}

# Check database connection
Write-Host "🔍 Checking database connection..." -ForegroundColor Cyan
$envContent = Get-Content .env | Where-Object { $_ -match "DATABASE_URL" }
if ($envContent -match "user:password") {
    Write-Host "⚠️  WARNING: Database credentials are still default!" -ForegroundColor Yellow
    Write-Host "Please edit backend/.env and update DATABASE_URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/formbuilder?schema=public"' -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "📦 Starting NestJS server..." -ForegroundColor Cyan
npm run start:dev

