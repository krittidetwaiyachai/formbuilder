# 📊 สถานะ Application

## ✅ สิ่งที่รันอยู่แล้ว

- ✅ **Frontend**: รันอยู่ที่ `http://localhost:5173`
- ⚠️ **Backend**: ยังไม่รัน (ต้องแก้ไข database connection ก่อน)

## 🔧 สิ่งที่ต้องทำ

### 1. แก้ไข Database Connection

เปิดไฟล์ `backend/.env` และแก้ไข:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/formbuilder?schema=public"
```

**เปลี่ยน `YOUR_PASSWORD` เป็น password ของ PostgreSQL**

### 2. สร้าง Database (ถ้ายังไม่มี)

```bash
psql -U postgres
CREATE DATABASE formbuilder;
\q
```

### 3. Run Migrations และ Seed

```bash
cd backend
npm run prisma:migrate
# พิมพ์ "init" เมื่อถามชื่อ migration

npm run prisma:seed
```

### 4. Start Backend

```bash
cd backend
npm run start:dev
```

หรือใช้ script:
```powershell
.\start-backend.ps1
```

## 🚀 วิธีรันทั้งหมด

ใช้ script:
```powershell
.\start-all.ps1
```

หรือรันแยก:
```powershell
# Terminal 1
.\start-backend.ps1

# Terminal 2  
.\start-frontend.ps1
```

## 📍 URLs

- **Frontend**: http://localhost:5173 (รันอยู่แล้ว)
- **Backend**: http://localhost:3000 (ต้องแก้ database ก่อน)

## 🔐 Login Credentials

หลังจาก seed database:
- Email: `admin@example.com`
- Password: `password123`

