# 🎯 เริ่มต้นใช้งาน

## สิ่งที่ต้องทำก่อนเริ่ม

### 1. แก้ไข Database Connection

เปิดไฟล์ `backend/.env` และแก้ไข:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/formbuilder?schema=public"
```

**สำคัญ:** เปลี่ยน `your_password` เป็น password ของ PostgreSQL ของคุณ

### 2. สร้าง Database

```bash
# วิธีที่ 1: ใช้ psql
psql -U postgres
CREATE DATABASE formbuilder;
\q

# วิธีที่ 2: ใช้ createdb
createdb -U postgres formbuilder
```

### 3. Run Migrations และ Seed

```bash
cd backend

# Run migrations
npm run prisma:migrate
# เมื่อถามชื่อ migration: พิมพ์ "init" แล้วกด Enter

# Seed database
npm run prisma:seed
```

### 4. เริ่มต้นใช้งาน

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. เปิด Browser

ไปที่: `http://localhost:5173`

Login ด้วย:
- Email: `admin@example.com`
- Password: `password123`

## ✅ Checklist

- [ ] แก้ไข `backend/.env` แล้ว
- [ ] สร้าง database `formbuilder` แล้ว
- [ ] Run migrations แล้ว
- [ ] Seed database แล้ว
- [ ] Backend รันอยู่ที่ port 3000
- [ ] Frontend รันอยู่ที่ port 5173

## 🎉 พร้อมใช้งาน!

ตอนนี้คุณสามารถ:
- สร้าง Form ใหม่
- เพิ่ม Fields ต่างๆ
- Preview Form
- Submit Responses
- ดู Analytics

