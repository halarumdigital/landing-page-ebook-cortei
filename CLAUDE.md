# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Barbershop/Salon lead capture landing page with admin dashboard. Collects visitor information (name, email, WhatsApp) in exchange for a free e-book ("7 Dicas Infalíveis para Lotar sua Agenda"). Includes protected admin area with user authentication and lead management.

**Language**: All user-facing content in Brazilian Portuguese (pt-BR)
**Design**: Black/neutral backgrounds with yellow accents (no blue colors)

## Development Commands

### Primary Commands
```bash
npm run dev          # Start development server (uses cross-env for Windows compatibility)
npm run build        # Build frontend and backend for production
npm start            # Run production server (requires npm run build first)
npm run check        # TypeScript type checking without emitting files
npm run db:push      # Push database schema changes (Drizzle Kit)
```

### Database Setup
The application expects a MySQL database. Tables are created automatically on server initialization via `server/init-db.ts`.

**Default admin credentials** (created on first run):
- Username: `admin`
- Password: `admin123`

## Architecture

### Monorepo Structure

```
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Route pages (landing, login, dashboard, etc.)
│       ├── components/
│       └── hooks/
├── server/          # Express backend (TypeScript, ESM)
│   ├── assets/      # PDF e-book file
│   ├── auth.ts      # Authentication routes & middleware
│   ├── storage.ts   # MySQL storage implementation
│   ├── routes.ts    # API route registration
│   └── init-db.ts   # Database initialization
├── shared/          # Shared types and schemas
│   └── schema.ts    # Zod validation schemas & types
└── attached_assets/ # Generated images
```

### Path Aliases (Vite & TypeScript)
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (dev server with HMR)
- **Routing**: Wouter (lightweight React Router alternative)
- **Styling**: TailwindCSS 4.x with custom theme
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query)
- **Fonts**: Poppins from Google Fonts

### Backend Stack
- **Runtime**: Node.js with ESM modules (`type: "module"`)
- **Framework**: Express.js with TypeScript
- **Database**: MySQL (direct connection via mysql2, no ORM)
- **Authentication**: express-session with bcrypt password hashing
- **Session Store**: In-memory (MemoryStore)

**Important**: The `shared/schema.ts` uses Drizzle ORM with PostgreSQL syntax (`pgTable`) but the actual storage implementation in `server/storage.ts` uses MySQL with raw queries. This is a schema/storage mismatch.

### Database Configuration

Connection configured via environment variables in `.env`:
```
MYSQL_HOST=...
MYSQL_PORT=3306
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DATABASE=...
```

**Tables**:
1. `leads` - Lead capture data (id, name, email, whatsapp, created_at)
2. `users` - Admin users (id, username, password_hash, name, email, role, created_at)

### API Endpoints

**Public**:
- `POST /api/leads` - Create new lead (validated with Zod)
- `GET /api/ebook/download` - Download PDF e-book

**Protected** (require authentication):
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Check session status
- `GET /api/users` - List all users (passwords excluded)
- `GET /api/leads` - List all leads

### Routes (Client)

- `/` - Landing page with lead capture form
- `/login` - Admin login page
- `/dashboard` - Admin dashboard home
- `/dashboard/leads` - Leads management page
- `/dashboard/usuarios` - User management page

### Development vs Production

**Development** (`NODE_ENV=development`):
- Vite dev server with HMR
- Runtime error overlay
- API logging middleware
- Replit-specific plugins (if `REPL_ID` is set)

**Production** (`NODE_ENV=production`):
- Frontend built to `dist/public/`
- Backend bundled to `dist/index.js` with esbuild
- Static file serving from Express
- No Vite middleware

### Cross-Platform Compatibility

The project uses `cross-env` for setting environment variables in npm scripts to ensure compatibility across Windows, Linux, and macOS. Always use `cross-env` when adding new scripts that set environment variables.

### Form Validation

WhatsApp format validation (Brazilian):
```
Regex: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/
Valid: (11) 99999-9999 or (11) 9999-9999
```

All validation schemas are in `shared/schema.ts` and shared between frontend and backend.

### Session Management

- Session secret: Configured via `SESSION_SECRET` env var or default
- Session duration: 24 hours
- Cookie settings: httpOnly, not secure (change for production HTTPS)
- Session data stores `userId` and `username`

### File Download Flow

1. User submits lead form on landing page
2. Lead data validated and stored in MySQL
3. Success response triggers frontend to request `/api/ebook/download`
4. Backend streams PDF file from `server/assets/7-Dicas-Infaliveis.pdf`
5. Browser downloads file as "7-Dicas-Infaliveis-para-Lotar-sua-Agenda.pdf"

### Design System

**Colors** (HSL-based, defined in Tailwind config):
- Background: Neutral blacks (hue 0)
- Primary: Yellow (hue 45) - used for CTAs and accents
- No blue colors allowed per user preferences

**Typography**:
- Font family: Poppins (geometric sans-serif)
- Eyebrow text: `text-sm font-semibold tracking-widest uppercase`
- Headlines: `text-4xl md:text-5xl font-bold leading-tight`
- Body: `text-base leading-relaxed`

**Layout**:
- Desktop: Split-screen (50/50) with content left, form right
- Mobile: Stacked (content first, form below)
- Full viewport height hero section

## Key Technical Notes

1. **Module System**: The project uses ESM modules exclusively (`type: "module"` in package.json). All imports must use `.js` extensions in TypeScript files when importing from the same package.

2. **Database Schema Mismatch**: The `shared/schema.ts` uses PostgreSQL Drizzle ORM syntax but production uses MySQL with raw queries. The schema file is primarily used for Zod validation schema generation, not actual database operations.

3. **Asset Paths**: The e-book PDF must exist at `server/assets/7-Dicas-Infaliveis.pdf` or downloads will fail.

4. **Authentication Flow**: Session-based auth using express-session. The `requireAuth` middleware protects routes. Client-side uses TanStack Query to check `/api/auth/me` for session status.

5. **Vite Dev Server**: In development, the Express server integrates Vite middleware for HMR. Routes must be registered before Vite setup (see `server/index.ts:78`) to prevent catch-all interference.

6. **Windows Development**: Environment variable setting in package.json scripts uses `cross-env` for cross-platform compatibility.

7. **Component Library**: Uses shadcn/ui with "New York" style variant. Components are copied into the project (not installed as npm package) and can be customized.

## Design Guidelines

See `design_guidelines.md` for comprehensive UI/UX specifications including:
- Split-screen layout system
- Typography hierarchy
- Component specifications
- Responsive behavior
- Accessibility considerations
- Conversion optimization elements
