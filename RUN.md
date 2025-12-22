# 🚀 วิธีรัน Application

## ⚠️ สิ่งที่ต้องทำก่อน

**แก้ไข `backend/.env` ก่อนรัน!**

เปิดไฟล์ `backend/.env` และแก้ไข:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/formbuilder?schema=public"
```

เปลี่ยน `YOUR_PASSWORD` เป็น password ของ PostgreSQL

## 🎯 วิธีรัน

### Option 1: รันแยก Terminal (แนะนำ)

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

### Option 2: ใช้ Script

**Windows PowerShell:**
```powershell
# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"

# Frontend  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## ✅ ตรวจสอบว่า Server รันอยู่

- **Backend**: เปิด `http://localhost:3000` (ควรเห็น error หรือ response)
- **Frontend**: เปิด `http://localhost:5173` (ควรเห็น login page)

## 🔐 Login

หลังจาก seed database:

- Email: `admin@example.com`
- Password: `password123`

## 🐛 ถ้า Backend ไม่รัน

1. ตรวจสอบ database connection ใน `backend/.env`
2. ตรวจสอบว่า PostgreSQL รันอยู่
3. Run migrations: `cd backend && npm run prisma:migrate`
4. Seed database: `cd backend && npm run prisma:seed`

## 🐛 ถ้า Frontend ไม่รัน

1. ตรวจสอบว่า backend รันอยู่ที่ port 3000
2. ตรวจสอบ `frontend/.env` มี `VITE_API_URL=http://localhost:3000`
3. Clear cache และ hard refresh browser

