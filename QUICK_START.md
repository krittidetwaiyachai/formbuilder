# 🚀 Quick Start Guide

## ✅ สิ่งที่ทำเสร็จแล้ว

1. ✅ สร้างไฟล์ `.env` สำหรับ backend และ frontend
2. ✅ ติดตั้ง dependencies ทั้งหมด
3. ✅ Generate Prisma Client
4. ✅ แก้ไข Prisma schema

## 📝 ขั้นตอนต่อไป

### 1. แก้ไข Database Connection

แก้ไขไฟล์ `backend/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/formbuilder?schema=public"
```

**เปลี่ยน:**
- `username` = PostgreSQL username ของคุณ (มักจะเป็น `postgres`)
- `password` = PostgreSQL password ของคุณ
- `formbuilder` = ชื่อ database (หรือสร้างใหม่)

### 2. สร้าง Database

```bash
# ใช้ psql
psql -U postgres
CREATE DATABASE formbuilder;
\q

# หรือใช้ createdb command
createdb -U postgres formbuilder
```

### 3. Run Database Migrations

```bash
cd backend
npm run prisma:migrate
```

เมื่อถามชื่อ migration ให้พิมพ์: `init`

### 4. Seed Database (สร้าง users และ sample data)

```bash
cd backend
npm run prisma:seed
```

### 5. Start Backend

```bash
cd backend
npm run start:dev
```

Backend จะรันที่ `http://localhost:3000`

### 6. Start Frontend (Terminal ใหม่)

```bash
cd frontend
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

## 🔐 Login Credentials

หลังจาก seed database:

- **SuperAdmin**: `superadmin@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **Editor**: `editor@example.com` / `password123`

## 🎯 ทดสอบระบบ

1. เปิด browser ไปที่ `http://localhost:5173`
2. Register หรือ Login
3. สร้าง Form ใหม่
4. เพิ่ม Fields
5. Preview Form
6. Submit Response
7. ดู Responses

## ⚠️ Troubleshooting

### Database Connection Error
- ตรวจสอบ PostgreSQL รันอยู่: `pg_isready`
- ตรวจสอบ DATABASE_URL ใน `.env` ถูกต้อง
- ตรวจสอบ username/password

### Port Already in Use
- Backend: เปลี่ยน PORT ใน `backend/.env`
- Frontend: เปลี่ยน port ใน `frontend/vite.config.ts`

### CORS Error
- ตรวจสอบ CORS_ORIGIN ใน `backend/.env` ตรงกับ frontend URL

## 📚 ไฟล์ที่สำคัญ

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration
- `SETUP.md` - Detailed setup guide
- `setup.ps1` - Windows setup script
- `setup.sh` - Linux/Mac setup script

