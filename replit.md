# Odoo Quote Calculator

## Overview

This is a full-stack web application for calculating and generating Odoo software quotes. It provides an interactive pricing calculator that supports multiple countries (US/CA), different subscription plans (Standard/Custom), various implementation packages, and multi-year term discounts. Users can configure quotes and save them to a PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for Replit environment
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with Odoo brand palette (#714B67 purple, #017E84 teal)
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **Runtime**: Node.js with tsx for development
- **API Style**: REST endpoints defined in `shared/routes.ts`
- **Validation**: Zod schemas shared between client and server
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Data Storage
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` using Drizzle table definitions
- **Migrations**: Managed via Drizzle Kit (`db:push` command)
- **Tables**: 
  - `users`: Authentication table with UUID primary key
  - `quotes`: Stores quote configurations with JSONB fields for term discounts and selected terms

### Code Organization
```
├── client/src/          # React frontend
│   ├── components/ui/   # Shadcn UI components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route components
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── routes.ts        # API endpoint handlers
│   ├── storage.ts       # Database access layer
│   └── db.ts            # Drizzle database connection
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Drizzle table definitions
│   └── routes.ts        # API contract definitions
└── migrations/          # Database migrations
```

### UI Layout
- **Pattern**: Two-panel sidebar + main panel (h-screen flex)
- **Sidebar** (340-380px): All configuration controls — currency toggle, users slider/input, plan buttons, implementation select, Odoo SH toggle+config, term checkboxes, per-term discounts (progressive disclosure)
- **Main Panel** (flex-1): Sticky config summary bar + responsive quote card grid + payout toggle
- **Design System**: Warm off-white bg (#F4F3EF), white sidebar, hairline borders (#E6E3DC), Odoo purple accents (#714B67), teal secondary (#017E84)
- **Quote Cards**: Gradient header, savings pill badge, hero monthly price, financing range, total contract block

### Build System
- Development: `tsx server/index.ts` with Vite middleware for HMR
- Production: Custom build script using esbuild (server) and Vite (client)
- Output: Bundled to `dist/` directory

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, requires `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but not currently used)

### Key NPM Packages
- **drizzle-orm** + **drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Async state management
- **zod** + **drizzle-zod**: Schema validation and type inference
- **framer-motion**: Animation library
- **Radix UI**: Headless UI component primitives (full suite installed)

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development banner