# Form Builder Platform - Setup Script for Windows PowerShell

Write-Host "🚀 Form Builder Platform - Setup Script" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is installed
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not found in PATH. Please make sure PostgreSQL is installed." -ForegroundColor Yellow
    Write-Host "   You can continue, but you'll need to setup database manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Cyan

# Backend Setup
Set-Location backend

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit backend/.env and update DATABASE_URL" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  .env.example not found. Creating default .env..." -ForegroundColor Yellow
        @"
DATABASE_URL="postgresql://user:password@localhost:5432/formbuilder?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
"@ | Out-File -FilePath .env -Encoding utf8
    }
}

# Install dependencies
if (-not (Test-Path node_modules)) {
    Write-Host "📥 Installing backend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Cyan

# Frontend Setup
Set-Location ../frontend

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.example not found. Creating default .env..." -ForegroundColor Yellow
        "VITE_API_URL=http://localhost:3000" | Out-File -FilePath .env -Encoding utf8
    }
}

# Install dependencies
if (-not (Test-Path node_modules)) {
    Write-Host "📥 Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "✅ Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env and update DATABASE_URL with your PostgreSQL credentials" -ForegroundColor White
Write-Host "2. Run database migrations:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run prisma:generate" -ForegroundColor Gray
Write-Host "   npm run prisma:migrate" -ForegroundColor Gray
Write-Host "   npm run prisma:seed" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run start:dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start frontend (in new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 See SETUP.md for detailed instructions" -ForegroundColor Cyan

