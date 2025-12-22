# Start Both Backend and Frontend
Write-Host "🚀 Starting Form Builder Platform..." -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "📦 Starting Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run start:dev"

# Wait a bit
Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "📦 Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"

Write-Host ""
Write-Host "✅ Servers starting in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: Make sure database is configured in backend/.env" -ForegroundColor Yellow

