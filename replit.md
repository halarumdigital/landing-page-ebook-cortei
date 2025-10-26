# Barbershop/Salon Lead Capture Landing Page

## Overview

This is a full-stack lead capture and admin application designed for barbershops and salons. The application consists of:

1. **Public Landing Page**: Collects visitor information (name, email, WhatsApp) in exchange for a free e-book titled "7 Dicas Infalíveis para Lotar sua Agenda"
2. **Admin Dashboard**: Protected area with MySQL authentication, sidebar navigation, and management pages for users and leads

The landing page features a conversion-focused design with a split-screen layout on desktop, professional aesthetics with black/neutral color scheme and yellow accents, and automatic e-book download upon form submission.

## User Preferences

Preferred communication style: Simple, everyday language.
Color scheme: Black/neutral backgrounds with yellow primary color (no blue)

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- TailwindCSS for styling with custom design system
- shadcn/ui component library (Radix UI primitives with Tailwind)

**Design System:**
- Custom Tailwind configuration with semantic color tokens (HSL-based)
- Color palette: Black/neutral backgrounds (hue 0), yellow primary (hue 45)
- Poppins font family from Google Fonts for modern, geometric sans-serif typography
- Responsive spacing system using Tailwind utilities (p-4, p-6, p-8, p-10)
- Split-screen architecture: 50/50 layout on desktop, stacked on mobile
- "New York" shadcn style with custom border radius and CSS variables

**State Management:**
- TanStack Query (React Query) for server state and API calls
- React Hook Form with Zod validation for form handling
- Local component state with React hooks

**Form Validation:**
- Zod schema validation integrated with React Hook Form via @hookform/resolvers
- Custom validation rules for Brazilian phone format (WhatsApp) and email

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js server
- TypeScript throughout the entire stack
- ESM modules (type: "module" in package.json)

**Server Configuration:**
- Custom Vite middleware integration for development HMR
- Static file serving for production builds
- API routes under `/api/*` prefix
- Express middleware for JSON parsing with raw body capture for webhook support

**API Endpoints:**
1. `POST /api/leads` - Accepts lead form submissions, validates data, stores leads
2. `GET /api/ebook/download` - Serves the PDF e-book file with proper headers for download

**Data Storage:**
- MySQL storage implementation (MySQLStorage class)
- Interface-based storage design (IStorage) with methods for leads and users
- UUID-based lead IDs using Node.js crypto module
- Bcrypt password hashing for user authentication

### Database Schema

**Database Configuration:**
- MySQL database (remote server via .env configuration)
- Direct mysql2 connection pool (no ORM for production)
- Tables: `leads` (id, name, email, whatsapp, created_at) and `users` (id, username, password_hash, name, email, role, created_at)
- Schema defined in `shared/schema.ts` for type safety

**Leads Table Structure:**
- `id`: UUID primary key with auto-generation
- `name`: Text field (required, minimum 2 characters)
- `email`: Text field (required, validated email format)
- `whatsapp`: Text field (required, Brazilian format validation)
- `createdAt`: Timestamp with automatic default (current time)

**Validation:**
- Drizzle-Zod integration for type-safe schema validation
- Shared validation schema between frontend and backend
- Brazilian WhatsApp format: `(DD) 99999-9999` or `(DD) 9999-9999`

### External Dependencies

**UI Component Libraries:**
- Radix UI primitives (17+ components): Provides accessible, unstyled component primitives
- shadcn/ui: Pre-styled component collection built on Radix UI
- class-variance-authority: Component variant management
- Lucide React: Icon library

**Form & Validation:**
- React Hook Form: Form state management with performance optimization
- Zod: TypeScript-first schema validation
- @hookform/resolvers: Zod resolver for React Hook Form integration

**Database & ORM:**
- Drizzle ORM: TypeScript ORM for PostgreSQL
- @neondatabase/serverless: Neon serverless PostgreSQL driver
- drizzle-kit: Database migration tool
- drizzle-zod: Automatic Zod schema generation from Drizzle schemas

**Development Tools:**
- @replit/vite-plugin-runtime-error-modal: Runtime error overlay
- @replit/vite-plugin-cartographer: Replit-specific development tools
- @replit/vite-plugin-dev-banner: Development environment banner
- tsx: TypeScript execution for Node.js (development server)
- esbuild: Production bundling for server code

**Third-Party Services:**
- Google Fonts CDN: Poppins font family hosting
- None for analytics, email, or payment processing in current implementation

**Asset Delivery:**
- Local PDF file storage in `server/assets/` directory
- Generated barbershop image asset in `attached_assets/generated_images/`
- Favicon served from public directory

**Key Architectural Decisions:**

1. **Monorepo Structure**: Client, server, and shared code in single repository with path aliases (@, @shared, @assets) for clean imports

2. **Type Safety**: Full TypeScript coverage with shared types between frontend and backend via the shared directory

3. **Data Flow**: Unidirectional data flow - form submission → validation → API call → MySQL storage → file download trigger

4. **Authentication**: Express-session based authentication with bcrypt password hashing, protected routes via middleware

5. **Admin Dashboard**: Shadcn sidebar navigation with three pages (Dashboard, Leads, Usuários), logout functionality

6. **Database**: MySQL connection via environment variables, tables created on initialization, default admin user (username: admin, password: admin123)

7. **Portuguese Localization**: All user-facing content in Brazilian Portuguese (pt-BR) including metadata, form labels, and validation messages

8. **Color Scheme**: Black/neutral theme (hue 0) with yellow accents (hue 45), no blue colors