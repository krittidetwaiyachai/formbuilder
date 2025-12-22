# Check if backend is running
Write-Host "🔍 Checking Backend Status..." -ForegroundColor Cyan

$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 -ErrorAction Stop
    $backendRunning = $true
} catch {
    $backendRunning = $false
}

if ($backendRunning) {
    Write-Host "✅ Backend is running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start backend:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Gray
    Write-Host "  npm run start:dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Database is configured in backend/.env" -ForegroundColor Gray
    Write-Host "  2. Migrations are run: npm run prisma:migrate" -ForegroundColor Gray
    Write-Host "  3. Database is seeded: npm run prisma:seed" -ForegroundColor Gray
}

