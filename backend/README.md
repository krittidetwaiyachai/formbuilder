# Form Builder Backend

Production-ready NestJS backend for Custom Form & Quiz Builder Platform.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Prisma** - Next-generation ORM
- **JWT** - Authentication
- **Class Validator** - DTO validation

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL="postgresql://user:password@localhost:5432/formbuilder?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

3. **Set up database:**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

4. **Start development server:**
```bash
npm run start:dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Forms
- `GET /forms` - Get all forms (filtered by role)
- `POST /forms` - Create new form
- `GET /forms/:id` - Get form by ID
- `PATCH /forms/:id` - Update form
- `DELETE /forms/:id` - Delete form
- `POST /forms/:id/clone` - Clone form

### Presets
- `GET /presets` - Get all active presets
- `POST /presets` - Create preset (SuperAdmin only)
- `GET /presets/:id` - Get preset by ID
- `POST /presets/:id/apply/:formId` - Apply preset to form
- `PATCH /presets/:id` - Update preset (creates new version)
- `DELETE /presets/:id` - Deactivate preset

### Responses
- `POST /responses` - Submit form response (public)
- `GET /responses/form/:formId` - Get all responses for a form
- `GET /responses/:id` - Get response by ID
- `GET /responses/form/:formId/export/csv` - Export responses as CSV

### Users
- `GET /users/me` - Get current user profile

## Roles & Permissions

- **SUPER_ADMIN**: Full system access, can manage presets
- **ADMIN**: Can create/manage forms and view responses
- **EDITOR**: Can edit own forms
- **VIEWER**: Can only view published forms and responses

## Database Schema

See `prisma/schema.prisma` for complete schema definition.

## Seed Data

Default users:
- SuperAdmin: `superadmin@example.com` / `password123`
- Admin: `admin@example.com` / `password123`
- Editor: `editor@example.com` / `password123`

## Development

```bash
# Run in development mode
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Run Prisma Studio (database GUI)
npm run prisma:studio
```

