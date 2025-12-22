# Start Frontend Server
Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Cyan

Set-Location frontend

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating default..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:3000" | Out-File -FilePath .env -Encoding utf8
}

Write-Host "📦 Starting Vite dev server..." -ForegroundColor Cyan
npm run dev

