# Form Builder Frontend

Production-ready React frontend for Custom Form & Quiz Builder Platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **@dnd-kit** - Drag & drop

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3000
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Features

- ✅ Authentication (Login/Register)
- ✅ Dashboard with forms list
- ✅ Form builder (basic structure)
- ✅ Form preview
- ✅ Responses management
- ✅ CSV export

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Project Structure

```
src/
  components/     # Reusable components
  pages/          # Page components
  store/          # Zustand stores
  lib/            # Utilities and API client
  types/          # TypeScript types
```

## Notes

The form builder UI with full drag & drop functionality is a placeholder. To complete the implementation, you would need to:

1. Create field sidebar component with all field types
2. Implement drag & drop canvas using @dnd-kit
3. Build properties panel for field configuration
4. Add conditional logic builder
5. Implement quiz mode settings UI
6. Create form preview with submission handling
7. Add preset management UI (for SuperAdmin)
