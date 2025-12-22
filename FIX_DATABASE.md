# 🔧 แก้ไข Database Connection

## ⚠️ ปัญหา

Database connection ล้มเหลวเพราะ credentials ใน `.env` ไม่ถูกต้อง

## ✅ วิธีแก้ไข

### 1. ตรวจสอบ PostgreSQL

ตรวจสอบว่า PostgreSQL รันอยู่:

```bash
# Windows
pg_isready

# หรือตรวจสอบ service
Get-Service postgresql*
```

### 2. แก้ไขไฟล์ `backend/.env`

เปิดไฟล์ `backend/.env` และแก้ไข `DATABASE_URL`:

```env
# เปลี่ยนจาก
DATABASE_URL="postgresql://user:password@localhost:5432/formbuilder?schema=public"

# เป็น (ตัวอย่าง)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/formbuilder?schema=public"
```

**สำคัญ:** เปลี่ยน `your_password` เป็น password จริงของ PostgreSQL

### 3. สร้าง Database (ถ้ายังไม่มี)

```bash
# วิธีที่ 1: ใช้ psql
psql -U postgres
CREATE DATABASE formbuilder;
\q

# วิธีที่ 2: ใช้ createdb
createdb -U postgres formbuilder
```

### 4. Run Migrations

```bash
cd backend
npm run prisma:migrate
# เมื่อถามชื่อ migration: พิมพ์ "init"
```

### 5. Seed Database

```bash
cd backend
npm run prisma:seed
```

## 🔍 ตรวจสอบ Connection

ทดสอบ connection:

```bash
cd backend
npx prisma db pull
```

ถ้าสำเร็จ = connection ถูกต้อง
ถ้า error = ตรวจสอบ credentials อีกครั้ง

## 📝 ตัวอย่าง DATABASE_URL

```env
# PostgreSQL default (username: postgres)
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/formbuilder?schema=public"

# PostgreSQL custom user
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/formbuilder?schema=public"

# PostgreSQL with different port
DATABASE_URL="postgresql://postgres:mypassword@localhost:5433/formbuilder?schema=public"
```

## ⚡ Quick Fix

ถ้าไม่รู้ password ของ PostgreSQL:

1. เปิด pgAdmin หรือ psql
2. เปลี่ยน password:
```sql
ALTER USER postgres WITH PASSWORD 'new_password';
```
3. อัปเดต `.env` ด้วย password ใหม่

