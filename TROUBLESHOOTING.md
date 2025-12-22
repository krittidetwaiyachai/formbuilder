# 🔧 Troubleshooting Guide

## ❌ ปัญหาที่พบบ่อย

### 1. Database Connection Error

**Error:** `P1000: Authentication failed`

**วิธีแก้:**
1. ตรวจสอบ PostgreSQL รันอยู่:
   ```bash
   pg_isready
   # หรือ
   Get-Service postgresql*
   ```

2. แก้ไข `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/formbuilder?schema=public"
   ```
   เปลี่ยน `YOUR_PASSWORD` เป็น password จริง

3. สร้าง database (ถ้ายังไม่มี):
   ```bash
   psql -U postgres
   CREATE DATABASE formbuilder;
   \q
   ```

### 2. Backend Connection Refused

**Error:** `ERR_CONNECTION_REFUSED` หรือ `net::ERR_CONNECTION_REFUSED`

**วิธีแก้:**
1. ตรวจสอบ backend รันอยู่:
   ```powershell
   .\check-backend.ps1
   ```

2. Start backend:
   ```bash
   cd backend
   npm run start:dev
   ```

3. ตรวจสอบ port 3000 ไม่ถูกใช้:
   ```bash
   netstat -ano | findstr ":3000"
   ```

### 3. React Router Warnings

**Warning:** `React Router Future Flag Warning`

**แก้ไขแล้ว:** เพิ่ม future flags ใน `App.tsx` แล้ว

### 4. Service Worker Errors

**Error:** `Failed to fetch` จาก service-worker.js

**แก้ไขแล้ว:** เพิ่ม unregister script ใน `index.html` และ `main.tsx` แล้ว

**วิธีแก้ manual:**
1. เปิด Browser DevTools (F12)
2. ไปที่ Application > Service Workers
3. คลิก Unregister
4. Hard refresh: `Ctrl + Shift + R`

### 5. Frontend ไม่เชื่อมต่อกับ Backend

**ตรวจสอบ:**
1. Backend รันอยู่ที่ port 3000
2. `frontend/.env` มี `VITE_API_URL=http://localhost:3000`
3. CORS ถูกตั้งค่าใน backend

### 6. Cannot Login

**ตรวจสอบ:**
1. Backend รันอยู่
2. Database seeded แล้ว (มี users)
3. ใช้ credentials ที่ถูกต้อง:
   - `admin@example.com` / `password123`

## 🔍 ตรวจสอบสถานะ

### ตรวจสอบ Backend
```powershell
.\check-backend.ps1
```

### ตรวจสอบ Ports
```bash
# Backend (port 3000)
netstat -ano | findstr ":3000"

# Frontend (port 5173)
netstat -ano | findstr ":5173"
```

### ตรวจสอบ Database
```bash
cd backend
npx prisma db pull
```

## 🚀 Quick Fix Scripts

### Fix and Run Backend
```powershell
.\fix-and-run.ps1
```

### Start All
```powershell
.\start-all.ps1
```

## 📝 Step-by-Step Fix

1. **แก้ไข Database Connection**
   - เปิด `backend/.env`
   - แก้ไข `DATABASE_URL`

2. **สร้าง Database**
   ```bash
   psql -U postgres
   CREATE DATABASE formbuilder;
   \q
   ```

3. **Run Migrations**
   ```bash
   cd backend
   npm run prisma:migrate
   ```

4. **Seed Database**
   ```bash
   npm run prisma:seed
   ```

5. **Start Backend**
   ```bash
   npm run start:dev
   ```

6. **Start Frontend** (Terminal ใหม่)
   ```bash
   cd frontend
   npm run dev
   ```

## 💡 Tips

- ใช้ `.\check-backend.ps1` เพื่อตรวจสอบ backend
- ใช้ `.\fix-and-run.ps1` เพื่อแก้ไขและรัน backend อัตโนมัติ
- Hard refresh browser (`Ctrl + Shift + R`) เมื่อมีปัญหา
- Clear browser cache ถ้ายังมีปัญหา

