# Custom Form & Quiz Builder Platform

Production-ready full-stack application for building custom forms and quizzes with role-based access control.

## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Prisma** - Next-generation ORM
- **JWT** - Authentication
- **Class Validator** - DTO validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zustand** - State management
- **React Router** - Routing
- **@dnd-kit** - Drag & drop

## 📋 Features

### ✅ Implemented

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (SuperAdmin, Admin, Editor, Viewer)
   - Protected routes

2. **Forms Management**
   - Create, read, update, delete forms
   - Form templates and cloning
   - Draft/Published/Archived status
   - Field types: text, textarea, number, email, phone, dropdown, checkbox, radio, date, time

3. **Quiz Mode**
   - Enable/disable quiz mode per form
   - Define correct answers and scores
   - Quiz settings (showScore, showAnswer, showDetail)
   - Automatic score calculation

4. **Presets/Field Groups**
   - Create reusable field groups
   - PII and sensitivity level tracking
   - Versioning system (doesn't break old forms)
   - SuperAdmin-only management

5. **Form Responses**
   - Public form submission
   - Response storage
   - Quiz score tracking
   - CSV/Excel export

6. **Conditional Logic**
   - Show/hide fields based on conditions
   - Support for various operators

### 🚧 To Complete

1. **Form Builder UI**
   - Full drag & drop implementation
   - Field properties panel
   - Conditional logic builder UI
   - Quiz mode settings UI

2. **Form Preview & Submission**
   - Complete form rendering
   - Public submission handling
   - Quiz result display

3. **Admin Dashboard**
   - Enhanced response management
   - Analytics and charts
   - Filtering and search

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with API URL

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📊 Database Schema

See `backend/prisma/schema.prisma` for complete schema.

Key models:
- `User` - Users with roles
- `Role` - Role definitions with permissions
- `Form` - Forms with quiz settings
- `Field` - Form fields with validation
- `FieldCondition` - Conditional logic
- `Preset` - Reusable field groups
- `FormResponse` - Form submissions
- `ResponseAnswer` - Individual answers
- `QuizScore` - Quiz scoring data

## 🔐 Default Users

After seeding:
- **SuperAdmin**: `superadmin@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **Editor**: `editor@example.com` / `password123`

## 📚 API Documentation

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Forms
- `GET /forms` - Get all forms
- `POST /forms` - Create form
- `GET /forms/:id` - Get form
- `PATCH /forms/:id` - Update form
- `DELETE /forms/:id` - Delete form
- `POST /forms/:id/clone` - Clone form

### Presets
- `GET /presets` - Get all presets
- `POST /presets` - Create preset (SuperAdmin)
- `GET /presets/:id` - Get preset
- `POST /presets/:id/apply/:formId` - Apply preset to form
- `PATCH /presets/:id` - Update preset (SuperAdmin)
- `DELETE /presets/:id` - Deactivate preset (SuperAdmin)

### Responses
- `POST /responses` - Submit response (public)
- `GET /responses/form/:formId` - Get responses
- `GET /responses/:id` - Get response
- `GET /responses/form/:formId/export/csv` - Export CSV

## 🎯 Roles & Permissions

- **SUPER_ADMIN**: Full access, manages presets
- **ADMIN**: Creates/manages forms, views responses
- **EDITOR**: Edits own forms
- **VIEWER**: Views published forms and responses only

## 📝 Development

### Backend
```bash
npm run start:dev    # Development
npm run build        # Build
npm run start:prod   # Production
npm run test         # Tests
npm run prisma:studio # Database GUI
```

### Frontend
```bash
npm run dev      # Development
npm run build    # Build
npm run preview  # Preview build
npm run lint     # Lint
```

## 📦 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/          # Users module
│   │   ├── forms/          # Forms module
│   │   ├── presets/        # Presets module
│   │   ├── responses/      # Responses module
│   │   ├── prisma/         # Prisma service
│   │   └── main.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utilities
│   │   └── types/          # TypeScript types
│   └── package.json
└── README.md
```

## 🚀 Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run prisma:migrate`
4. Seed database: `npm run prisma:seed`
5. Build backend: `npm run build`
6. Build frontend: `npm run build`
7. Deploy according to your hosting provider

## 📄 License

MIT

## 👥 Contributing

This is a production-ready starter template. Feel free to extend and customize for your needs.

