# Fix Database Connection and Run Backend
Write-Host "🔧 Fixing Database Connection and Starting Backend..." -ForegroundColor Cyan
Write-Host ""

Set-Location backend

# Check .env file
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content .env -Raw
$dbUrlLine = ($envContent -split "`n" | Where-Object { $_ -match "DATABASE_URL" })

if ($dbUrlLine -match "user:password" -or $dbUrlLine -match "postgresql:") {
    Write-Host "⚠️  Database credentials need to be updated!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Current DATABASE_URL:" -ForegroundColor Cyan
    Write-Host $dbUrlLine -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please edit backend/.env and update:" -ForegroundColor Yellow
    Write-Host 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/formbuilder?schema=public"' -ForegroundColor White
    Write-Host ""
    Write-Host "Then run:" -ForegroundColor Cyan
    Write-Host "  npm run prisma:migrate" -ForegroundColor Gray
    Write-Host "  npm run prisma:seed" -ForegroundColor Gray
    Write-Host "  npm run start:dev" -ForegroundColor Gray
    Write-Host ""
    
    $continue = Read-Host "Continue to try running backend anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Try to run migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Cyan
npm run prisma:migrate 2>&1 | Out-String
$migrationSuccess = $LASTEXITCODE -eq 0

if (-not $migrationSuccess) {
    Write-Host "⚠️  Migration failed. This is usually due to:" -ForegroundColor Yellow
    Write-Host "  1. Wrong database credentials" -ForegroundColor Gray
    Write-Host "  2. Database doesn't exist" -ForegroundColor Gray
    Write-Host "  3. PostgreSQL not running" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please fix the issues above and try again." -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "Continue to try starting backend anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "✅ Migrations completed" -ForegroundColor Green
    
    # Try to seed
    Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
    npm run prisma:seed 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded" -ForegroundColor Green
    }
}

# Start backend
Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host "Backend will run at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
npm run start:dev

