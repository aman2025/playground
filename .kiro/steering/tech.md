# Technology Stack

## Framework & Runtime
- **Next.js 13.4.10** with App Router
- **React 18.2.0** with React DOM
- **Node.js >=20.0.0** (specified in package.json engines)

## Core Libraries
- **Mistral AI API** - Pixtral Large 124B for code generation
- **Sandpack** - Code sandbox for real-time editing and preview
- **Prisma** - Database ORM with PostgreSQL
- **NextAuth** - Authentication system
- **React Query** - Data fetching, caching, and state synchronization
- **Zustand** - Lightweight state management

## UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library built on Radix UI primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## Development Tools
- **ESLint** - Code linting with Prettier integration
- **Prettier** - Code formatting
- **TypeScript** - Not used (pure JavaScript project)

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma migrate   # Run database migrations
npx prisma studio    # Open Prisma Studio GUI
```

## Environment Setup
1. Create `.env` file with required variables:
   - `MISTRAL_API_KEY` or `AGENT_ID`
   - `MISTRAL_API_ENDPOINT`
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
2. Run `npm install`
3. Set up PostgreSQL database
4. Run `npx prisma db push` to sync schema
5. Run `npm run dev` to start development