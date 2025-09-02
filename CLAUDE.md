# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TanStack Start demo/learning project showcasing React 19 with a modern full-stack React framework. It demonstrates file-based routing, SSR capabilities, and integrated developer tools.

**Key Technologies:**
- React 19 + TypeScript 5.7
- TanStack Start 1.131.7+ (full-stack framework)
- TanStack Router 1.130.2+ (file-based routing)
- Tailwind CSS 4.0 + Vite integration
- Biome 2.2.2 (linting/formatting)
- Vitest 3.0.5 (testing)

## Development Commands

### Essential Development Workflow
```bash
# Install dependencies
bun install

# Start development server (http://localhost:3000)
bun dev

# Type check (run before commits)
bun run tsc

# Lint + format + organize imports (auto-fix enabled)
bun run check

# Run tests
bun test

# Production build
bun build
```

### Quality Gates (Run Before Commits)
```bash
bun run tsc     # Type checking
bun run check   # Code quality
bun test        # Test suite
```

## Architecture

### File-Based Routing System
The routing is entirely file-based using TanStack Router:

- `src/routes/__root.tsx` - Root layout component with `shellComponent` pattern
- `src/routes/index.tsx` - Home page (`/`)  
- `src/routes/demo.*.tsx` - Demo pages with nested routing
- `src/routeTree.gen.ts` - Auto-generated route tree (don't edit manually)

**Route Component Pattern:**
```typescript
export const Route = createFileRoute('/path')({
  component: ComponentFunction,
})

// For root layout:
export const Route = createRootRoute({
  head: () => ({ meta: [...], links: [...] }),
  shellComponent: RootDocument,
})
```

### Component Architecture
- `src/components/` - Reusable components (currently just Header.tsx)
- Default exports preferred for components
- React 19 JSX transform (no import React needed)
- TypeScript strict mode with unused variable/parameter checking

### Styling System
- Tailwind CSS 4.0 with Vite plugin integration
- Biome enforces automatic Tailwind class sorting via `useSortedClasses` rule
- Custom values supported: `h-[40vmin]`, `text-[calc(10px+2vmin)]`
- Responsive-first approach: `flex flex-col items-center justify-center`

### Developer Tools Integration
TanStack Devtools are integrated in the root document:
```typescript
<TanstackDevtools
  config={{ position: 'bottom-left' }}
  plugins={[{
    name: 'Tanstack Router',
    render: <TanStackRouterDevtoolsPanel />
  }]}
/>
```

## Code Standards

### Biome Configuration
- 2-space indentation, 100-char line width
- Single quotes for JS/TS, double quotes for JSX
- Trailing commas everywhere, semicolons as needed
- Auto-import organization enabled
- Strict TypeScript rules enforced

### Import Patterns
```typescript
// External libraries first
import { createFileRoute } from '@tanstack/react-router'

// Internal components (relative paths)
import Header from '../components/Header'

// Assets with proper Vite handling
import logo from '../logo.svg'
import appCss from '../styles.css?url'
```

### TypeScript Configuration
- Bundler module resolution for Vite compatibility
- Path aliasing: `@/*` maps to `./src/*`
- Strict mode with additional safety checks
- React 19 JSX support configured

## Testing Setup

Uses Vitest 3.0.5 with React Testing Library. Test files should use `.test.ts/.test.tsx` extension. Currently no test directory exists - tests should be created alongside components or in a `tests/` directory.