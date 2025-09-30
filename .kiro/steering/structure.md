# Project Structure

## Directory Organization

```
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes (Next.js API handlers)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── chat/          # Chat and messaging endpoints
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── chat/              # Chat interface pages
│   ├── signin/            # Authentication pages
│   ├── signup/
│   ├── verify/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── layout.jsx         # Root layout component
│   ├── page.jsx           # Home page
│   ├── providers.jsx      # React Query and other providers
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # Shadcn/UI components (Button, Dialog, etc.)
│   ├── ChatInterface.jsx # Main chat components
│   ├── ChatHistory.jsx
│   ├── ChatInputForm.jsx
│   ├── ChatMessage.jsx
│   ├── CodeViewer.jsx    # Sandpack code viewer
│   ├── Layout.jsx
│   ├── Loading.jsx
│   ├── Sandpack.jsx      # Code sandbox component
│   ├── UserProfile.jsx
│   └── WelcomeCards.jsx
├── lib/                  # Utility libraries and configurations
│   ├── prisma.js         # Prisma client setup
│   ├── email.js          # Email service configuration
│   └── utils.js          # General utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema definition
│   └── migrations/       # Database migration files
├── services/             # API service layer
│   └── api.js            # Axios configuration and API calls
├── store/                # Zustand state management
│   └── chatStore.js      # Chat-related global state
├── styles/               # Additional CSS files
├── prompts/              # AI prompt templates
│   └── system.js         # System prompts for Mistral AI
└── public/               # Static assets
    ├── images/           # Application images
    └── upload/           # User uploaded files
```

## Naming Conventions

- **Files**: Use camelCase for JavaScript files, kebab-case for CSS
- **Components**: PascalCase for React components
- **API Routes**: Follow Next.js App Router conventions (`route.js`)
- **Database**: Use camelCase for Prisma schema fields

## Architecture Patterns

- **API Layer**: Centralized in `services/api.js` using Axios
- **State Management**: Zustand stores in `store/` directory
- **Data Fetching**: React Query for server state management
- **Authentication**: NextAuth with Prisma adapter
- **Database**: Prisma ORM with PostgreSQL
- **Styling**: Tailwind CSS with Shadcn/UI components
- **File Organization**: Feature-based grouping in `app/` directory

## Key Conventions

- All API routes return JSON responses with consistent error handling
- Components use React Query for data fetching
- Global state managed through Zustand stores
- Database operations handled through Prisma client
- Authentication required for chat and user-specific features
- File uploads stored in `public/upload/` with timestamp prefixes