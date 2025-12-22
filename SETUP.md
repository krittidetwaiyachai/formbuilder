# 🚀 Setup Guide - Form Builder Platform

## ขั้นตอนการ Setup

### 1. Setup Database (PostgreSQL)

ก่อนอื่นต้องมี PostgreSQL ติดตั้งอยู่แล้ว

```bash
# สร้าง database
createdb formbuilder

# หรือใช้ psql
psql -U postgres
CREATE DATABASE formbuilder;
\q
```

### 2. Setup Backend

```bash
cd backend

# สร้างไฟล์ .env จาก .env.example
# Windows PowerShell:
Copy-Item .env.example .env

# หรือ Linux/Mac:
cp .env.example .env
```

**แก้ไขไฟล์ `.env`**:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/formbuilder?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

```bash
# Install dependencies (ถ้ายังไม่ได้ install)
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (สร้าง users และ sample data)
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend จะรันที่ `http://localhost:3000`

### 3. Setup Frontend

```bash
cd frontend

# สร้างไฟล์ .env จาก .env.example
# Windows PowerShell:
Copy-Item .env.example .env

# หรือ Linux/Mac:
cp .env.example .env
```

**แก้ไขไฟล์ `.env`** (ถ้าจำเป็น):
```env
VITE_API_URL=http://localhost:3000
```

```bash
# Install dependencies (ถ้ายังไม่ได้ install)
npm install

# Start development server
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

## 🔐 Default Login Credentials

หลังจาก seed database:

- **SuperAdmin**: `superadmin@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **Editor**: `editor@example.com` / `password123`

## 📝 Quick Start Scripts

### Windows PowerShell

```powershell
# Setup Backend
cd backend
Copy-Item .env.example .env
# แก้ไข .env file
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Setup Frontend (terminal ใหม่)
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

### Linux/Mac

```bash
# Setup Backend
cd backend
cp .env.example .env
# แก้ไข .env file
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Setup Frontend (terminal ใหม่)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## ✅ Checklist

- [ ] PostgreSQL ติดตั้งและรันอยู่
- [ ] สร้าง database `formbuilder`
- [ ] Backend `.env` ถูกสร้างและแก้ไขแล้ว
- [ ] Backend dependencies ติดตั้งแล้ว
- [ ] Prisma migrations รันแล้ว
- [ ] Database seeded แล้ว
- [ ] Backend รันที่ port 3000
- [ ] Frontend `.env` ถูกสร้างแล้ว
- [ ] Frontend dependencies ติดตั้งแล้ว
- [ ] Frontend รันที่ port 5173

## 🐛 Troubleshooting

### Database Connection Error
- ตรวจสอบว่า PostgreSQL รันอยู่
- ตรวจสอบ DATABASE_URL ใน `.env` ถูกต้อง
- ตรวจสอบ username/password ถูกต้อง

### Port Already in Use
- เปลี่ยน PORT ใน backend `.env`
- เปลี่ยน port ใน frontend `vite.config.ts`

### CORS Error
- ตรวจสอบ CORS_ORIGIN ใน backend `.env` ตรงกับ frontend URL

## 📚 Next Steps

1. เปิด browser ไปที่ `http://localhost:5173`
2. Register หรือ Login ด้วย credentials ด้านบน
3. สร้าง form ใหม่
4. เพิ่ม fields
5. Preview และ submit form
6. ดู responses

