#!/bin/bash

# Form Builder Platform - Setup Script for Linux/Mac

echo "🚀 Form Builder Platform - Setup Script"
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo "✅ PostgreSQL found: $PG_VERSION"
else
    echo "⚠️  PostgreSQL not found. Please make sure PostgreSQL is installed."
    echo "   You can continue, but you'll need to setup database manually."
fi

echo ""
echo "📦 Setting up Backend..."

# Backend Setup
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "⚠️  Please edit backend/.env and update DATABASE_URL"
    else
        echo "⚠️  .env.example not found. Creating default .env..."
        cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/formbuilder?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
EOF
    fi
fi

# Install dependencies
if [ ! -d node_modules ]; then
    echo "📥 Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

echo ""
echo "📦 Setting up Frontend..."

# Frontend Setup
cd ../frontend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
    else
        echo "⚠️  .env.example not found. Creating default .env..."
        echo "VITE_API_URL=http://localhost:3000" > .env
    fi
fi

# Install dependencies
if [ ! -d node_modules ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✅ Setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and update DATABASE_URL with your PostgreSQL credentials"
echo "2. Run database migrations:"
echo "   cd backend"
echo "   npm run prisma:generate"
echo "   npm run prisma:migrate"
echo "   npm run prisma:seed"
echo ""
echo "3. Start backend:"
echo "   cd backend"
echo "   npm run start:dev"
echo ""
echo "4. Start frontend (in new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "📚 See SETUP.md for detailed instructions"

