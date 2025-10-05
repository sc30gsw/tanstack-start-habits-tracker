# Claude Code Spec-Driven Development

Kiro-style Spec Driven Development implementation using claude code slash commands, hooks and agents.

## Project Context

### Project Information
- **Project Name**: track-daily-habits-app
- **Description**: Comprehensive habit tracking application with time recording and visualization
- **Target Platform**: MacBook-optimized desktop application with responsive design
- **Core Features**: Daily habit tracking, duration recording, calendar/heatmap visualization, minimal UI

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- `habit-tracking-system`: Comprehensive habit tracking system implementation
- Use `/kiro:spec-status [feature-name]` to check progress

## Technology Stack

### Frontend Framework
- **TanStack Start**: SSR-enabled modern React framework
- **React 19**: Latest React with concurrent features
- **TypeScript 5.7**: Type-safe development with latest features

### UI Framework
- **Mantine UI 8.x**: Primary component library
  - `@mantine/core`: Core components and theme system
  - `@mantine/charts`: Data visualization components
  - `@mantine/dates`: Calendar and date picker components
  - `@mantine/hooks`: Utility hooks
  - `@mantine/modals`: Modal management
- **Tailwind CSS 4.0**: Utility-first CSS framework
- **PostCSS**: CSS processing with Mantine preset

### Backend & Database
- **TanStack Router**: File-based routing with type safety
- **Server Functions**: Server-side operations with validation
- **Drizzle ORM**: Type-safe database operations
- **libSQL (Turso)**: SQLite-compatible cloud database
- **Zod**: Schema validation library

### Development Tools
- **Vite**: Fast build tool and development server
- **Bun**: Package manager and runtime
- **Biome**: Code formatting and linting
- **Vitest**: Unit testing framework
- **Testing Library**: Component testing utilities

### Additional Libraries
- **dayjs**: Date manipulation library
- **recharts**: Additional charting capabilities
- **web-vitals**: Performance monitoring

### Authentication & Subscriptions
- **Better Auth**: Modern authentication library with React Start integration
  - `better-auth`: Core authentication framework
  - Email/password authentication
  - Social login (GitHub OAuth)
  - Passkey/WebAuthn support
  - Drizzle adapter for database integration
- **Polar Integration**: Subscription and monetization platform
  - `@polar-sh/better-auth`: Polar plugin for Better Auth
  - `@polar-sh/sdk`: Polar SDK for subscription management
  - Checkout flow integration
  - Customer portal for subscription management
  - Webhook handling for subscription events

## Development Guidelines

### TanStack Start Best Practices
- Use file-based routing in `src/routes/`
- Implement Server Functions with `createServerFn`
- Leverage route loaders for SSR data fetching
- Use type-safe navigation with `Link` and `useNavigate`
- Configure selective SSR per route as needed

### Mantine UI Integration
- Configure MantineProvider with consistent theme
- Use theme tokens for colors, spacing, and typography
- Leverage Styles API for component customization
- Follow Mantine component patterns and conventions
- Use CSS Modules or @mantine/emotion for custom styling

### Database & Validation
- Always validate Server Function inputs with Zod schemas
- Use Drizzle ORM for type-safe database operations
- Implement proper error handling and boundaries
- Follow database schema design patterns

### Code Organization
- Feature-based directory structure
- Colocation of related components, hooks, and utilities
- Consistent naming conventions (kebab-case files, PascalCase components)
- Proper TypeScript typing throughout

### Authentication & Security
- Use Better Auth for all authentication flows
- Configure authentication in `src/lib/auth.ts`
- Use `authClient` from `src/lib/auth-client.ts` for client-side auth
- Always use Server Functions for sensitive operations
- Implement proper session management with Better Auth cookies
- Follow OAuth best practices for social login (GitHub)
- Use Passkey/WebAuthn for passwordless authentication when available

### Subscription Management (Polar)
- Polar integration handles subscription lifecycle
- Checkout flow: `/checkout` route with success callback
- Customer portal: `/customer/portal` for subscription management
- Webhook handlers in `src/lib/auth.ts` for subscription events:
  - `onOrderPaid`: Handle successful payments
  - `onSubscriptionActive`: Enable subscription features
  - `onSubscriptionCanceled`: Handle cancellations
  - `onSubscriptionRevoked`: Immediate access revocation
  - `onCustomerStateChanged`: Update customer access control

## Development Commands

### Development Server
```bash
bun run dev          # Start development server on port 3000
```

### Build & Production
```bash
bun run build        # Build for production
bun run start        # Start production server
bun run serve        # Preview production build
```

### Code Quality
```bash
bun run test         # Run Vitest unit tests
bun run tsc          # TypeScript type checking
bun run lint         # Biome linting with auto-fix
bun run format       # Biome code formatting
bun run check        # Biome comprehensive check
```

### Package Management
```bash
bun install         # Install dependencies
bun add <package>    # Add new dependency
bun add -d <package> # Add development dependency
```

## Workflow

### Phase 0: Steering (Optional)
`/kiro:steering` - Create/update steering documents
`/kiro:steering-custom` - Create custom steering for specialized contexts

Note: Optional for new features or small additions. You can proceed directly to spec-init.

### Phase 1: Specification Creation
1. `/kiro:spec-init [detailed description]` - Initialize spec with detailed project description
2. `/kiro:spec-requirements [feature]` - Generate requirements document
3. `/kiro:spec-design [feature]` - Interactive: "Have you reviewed requirements.md? [y/N]"
4. `/kiro:spec-tasks [feature]` - Interactive: Confirms both requirements and design review

### Phase 2: Progress Tracking
`/kiro:spec-status [feature]` - Check current progress and phases

## Development Rules
1. **Consider steering**: Run `/kiro:steering` before major development (optional for new features)
2. **Follow 3-phase approval workflow**: Requirements → Design → Tasks → Implementation
3. **Approval required**: Each phase requires human review (interactive prompt or manual)
4. **No skipping phases**: Design requires approved requirements; Tasks require approved design
5. **Update task status**: Mark tasks as completed when working on them
6. **Keep steering current**: Run `/kiro:steering` after significant changes
7. **Check spec compliance**: Use `/kiro:spec-status` to verify alignment

## Steering Configuration

### Current Steering Files
Managed by `/kiro:steering` command. Updates here reflect command changes.

### Active Steering Files
- `product.md`: Always included - Product context and business objectives
- `tech.md`: Always included - Technology stack and architectural decisions
- `structure.md`: Always included - File organization and code patterns

### Custom Steering Files
<!-- Added by /kiro:steering-custom command -->
<!-- Format:
- `filename.md`: Mode - Pattern(s) - Description
  Mode: Always|Conditional|Manual
  Pattern: File patterns for Conditional mode
-->

### Inclusion Modes
- **Always**: Loaded in every interaction (default)
- **Conditional**: Loaded for specific file patterns (e.g., "*.test.js")
- **Manual**: Reference with `@filename.md` syntax

## AI Operation Principles (Highest Priority)

1. **Pre-execution Confirmation**: AI must always report its work plan before file generation, updates, or program execution, obtain y/n user confirmation, and halt all execution until receiving 'y'.

2. **No Unauthorized Workarounds**: AI must not perform detours or alternative approaches on its own; if the initial plan fails, it must seek confirmation for the next plan.

3. **User Authority**: AI is a tool and decision-making authority always belongs to the user. Even if user suggestions are inefficient or irrational, AI must not optimize but execute as instructed.

4. **Absolute Rule Compliance**: AI must not distort or reinterpret these rules and must absolutely comply with them as top-priority commands.

5. **Compliance with Guidelines**: AI must not violate prohibitions in Claude.md and must develop according to CODING-STANDARDS.md.

6. **Mandatory Principle Display**: AI must verbatim output these 6 principles at the beginning of every chat before responding.

## Project Architecture

### Directory Structure
Follow TanStack Start conventions with feature-based organization:

```
src/
├── routes/                 # TanStack Router file-based routes
│   ├── __root.tsx         # Root layout with providers
│   ├── index.tsx          # Home page
│   └── api/               # Server-side API routes
├── features/              # Feature-based modules
│   ├── habits/            # Habit tracking feature
│   │   ├── components/    # Feature components
│   │   ├── server/        # Server functions
│   │   ├── types/         # Type definitions and schemas
│   │   └── hooks/         # Feature-specific hooks
│   └── calendar/          # Calendar visualization feature
├── components/            # Shared components
│   ├── ui/                # Reusable UI components
│   └── providers/         # Context providers
├── hooks/                 # Global custom hooks
├── theme/                 # Mantine theme configuration
├── types/                 # Global type definitions
├── utils/                 # Utility functions
└── constants/             # Application constants
```

### Data Models
Based on REQUIREMENTS.md specifications:

- **Habits**: Core habit definitions with metadata
- **Records**: Daily habit execution records with duration
- **Settings**: User preferences and configuration
- **Calendar Data**: Aggregated view data for visualization

#### Database Schema
```sql
-- Habits table
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Records table
CREATE TABLE records (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL REFERENCES habits(id),
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, date)
);

-- Settings table
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  default_view TEXT DEFAULT 'calendar',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## User Stories Summary

**Total Story Points**: 52 | **Timeline**: 3-4 sprints | **Stories**: 6

### Core Features
1. **Habit Execution Recording** (5 points): Record daily habit execution
2. **Habit Duration Tracking** (8 points): Track work time (duration) for habits
3. **Data Persistence** (8 points): Secure data storage with libSQL/Turso

### Visualization Features
4. **Calendar Display** (13 points): Monthly/weekly/daily timeline view
5. **Heatmap Visualization** (13 points): Annual continuation status visualization

### UI/UX
6. **Minimal UI Design** (5 points): Simple and user-friendly interface

## Development Phases

### Phase 1: Core Features (MVP)
- Habit Execution Recording (Story 1)
- Habit Duration Tracking (Story 2)
- Data Persistence (Story 3)

### Phase 2: Visualization
- Calendar Display (Story 4)
- Heatmap Visualization (Story 5)

### Phase 3: UI/UX Completion
- Minimal UI Design (Story 6)

## Authentication Routes
- `/auth/sign-in` - Email/password and GitHub OAuth sign-in
- `/auth/sign-up` - User registration
- `/auth/sign-out` - Sign-out handler
- `/auth/passkey-setup` - Passkey (WebAuthn) registration
- `/api/auth/$` - Better Auth API handler (catch-all route)

## Subscription Routes
- `/checkout` - Polar checkout page for Pro plan
- `/checkout/success` - Post-checkout success callback
- `/customer/portal` - Subscription management portal (Polar-hosted)

## Environment Variables

### Required Variables
```bash
# Database
VITE_TURSO_CONNECTION_URL    # Turso database connection URL
VITE_TURSO_AUTH_TOKEN        # Turso authentication token

# Better Auth
VITE_BETTER_AUTH_URL         # Application URL (http://localhost:3000 for dev)
VITE_BETTER_AUTH_SECRET      # Secret key for session encryption
```

### Optional Variables
```bash
# GitHub OAuth
VITE_GITHUB_CLIENT_ID        # GitHub OAuth app client ID
VITE_GITHUB_CLIENT_SECRET    # GitHub OAuth app client secret

# Passkey/WebAuthn
VITE_PASSKEY_RP_ID          # Relying party ID (localhost for dev, domain for prod)
VITE_PASSKEY_RP_NAME        # Relying party name (app name)

# Polar Integration
VITE_POLAR_ACCESS_TOKEN     # Polar API access token
VITE_POLAR_SERVER           # 'sandbox' for dev, 'production' for live
VITE_POLAR_PRODUCT_ID       # Product ID for Pro plan
VITE_POLAR_WEBHOOK_SECRET   # Webhook secret for event verification
```

## Additional Information Files
- @REQUIREMENTS.md - Project requirements document with user stories
- @CODING-STANDARDS.md - Project coding conventions, directory structure, prohibitions
- @README.md - Comprehensive project documentation with tech stack and deployment guide
- `package.json` - Dependencies and development scripts
- `.env.example` - Environment variable template
- `src/lib/auth.ts` - Better Auth and Polar configuration
- `src/lib/auth-client.ts` - Client-side auth utilities

## Prohibited Items (Highest Priority)
- Excessive use of `any` type (use TypeScript Utility types whenever possible)
- Leaving `console.log` in production environment
- Committing untested code
- Direct writing of security keys

## Important Instruction Reminders (Highest Priority)
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User

## Chat Output Format
```
[AI Operation 6 Principles]
[main_output]
#[n] times. # n = increment for each chat (#1, #2...)
```