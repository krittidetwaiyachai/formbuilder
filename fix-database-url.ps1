# Fix Database URL
Write-Host "🔧 Fixing Database URL..." -ForegroundColor Cyan
Write-Host ""

Set-Location backend

if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

$envFile = Get-Content .env
$newEnvFile = @()

foreach ($line in $envFile) {
    if ($line -match '^DATABASE_URL=') {
        # Fix common issues
        $fixed = $line -replace 'postgresql://postgresql:', 'postgresql://postgres:'
        $fixed = $fixed -replace 'postgresql://user:', 'postgresql://postgres:'
        
        if ($fixed -ne $line) {
            Write-Host "✅ Fixed DATABASE_URL" -ForegroundColor Green
            Write-Host "  Before: $line" -ForegroundColor Gray
            Write-Host "  After:  $fixed" -ForegroundColor Gray
            $newEnvFile += $fixed
        } else {
            $newEnvFile += $line
        }
    } else {
        $newEnvFile += $line
    }
}

# Write back to file
$newEnvFile | Set-Content .env -Encoding utf8

Write-Host ""
Write-Host "✅ Database URL fixed!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Please verify the password in backend/.env is correct" -ForegroundColor Yellow
Write-Host "   Current format: postgresql://postgres:YOUR_PASSWORD@localhost:5432/formbuilder" -ForegroundColor Gray

