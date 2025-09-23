
## Coding Guidelines
### Introduction
This coding standard is based on TanStack Start documentation and Mantine UI best practices.

### Common Principles
-  Use TanStack Router's file-based routing and type-safe navigation
-  Leverage Server Functions for server-side operations with proper validation
-  Use Suspense for async components and proper loading states
-  Implement proper SSR/streaming strategies based on route requirements
-  Before PR, run build and test commands to ensure everything passes

### Naming Conventions
-  Use kebab-case for filenames and folder names (excluding dynamic routes with $ prefix)
-  Use camelCase for variables and functions
-  Use PascalCase for component names and types

### Function Definitions
-  Use function declarations for consistency (e.g., `export default async function Component() {}`)
-  Export Server Functions using `createServerFn` with proper validation

### TanStack Start Routing
-  Follow file-based routing conventions in `src/routes/`
-  Use `createFileRoute` for page components
-  Use `createServerFileRoute` for server-only routes
-  Implement proper loaders for data fetching
-  Use type-safe navigation with `Link` and `useNavigate`

### Server Functions
-  Always validate inputs using Zod schemas
-  Use `createServerFn` with method specification
-  Handle errors gracefully with proper error boundaries
-  Implement proper authentication and authorization

### Component Design
-  Follow [AHA Programming](https://kentcdodds.com/blog/aha-programming)
-  Use Mantine UI components as the primary component library
-  Extend Mantine components through theme configuration when needed
-  Use compound component patterns for complex components

### Mantine UI Integration
-  Configure MantineProvider with consistent theme
-  Use theme tokens for colors, spacing, and typography
-  Leverage Styles API for component customization
-  Use CSS Modules or @mantine/emotion for custom styling

### Data Fetching
-  Use route loaders for SSR data fetching
-  Implement proper loading and error states
-  Use TanStack Query for client-side state management when needed
-  Follow data colocation principles

### Cache Management
-  Use TanStack Router's built-in caching
-  Implement proper cache invalidation strategies
-  Use route-level preloading for performance

### SSR and Streaming
-  Configure selective SSR per route as needed
-  Use streaming for better user experience
-  Implement proper hydration strategies

## Directory Structure
-  Follow TanStack Start conventions with feature-based organization

### TanStack Start Directory Structure
```
/tanstack-start-app
  ├ public : Static assets (images, icons, etc.)
  ├ src
  |  ├ routes: TanStack Router route definitions
  |  |  ├ __root.tsx : Root route with layout and providers
  |  |  ├ index.tsx : Home page route
  |  |  ├ about.tsx : About page route
  |  |  ├ api/ : Server routes directory
  |  |  |  ├ auth.ts : Authentication server route
  |  |  |  └ users.ts : Users API server route
  |  |  ├ posts/ : Posts feature routes
  |  |  |  ├ index.tsx : Posts listing page
  |  |  |  └ $postId.tsx : Individual post page (dynamic route)
  |  |  └ users/
  |  |     ├ index.tsx : Users listing page
  |  |     └ $userId.tsx : User profile page (dynamic route)
  |  ├ components : Reusable components
  |  |  ├ providers/ : Context providers and theme setup
  |  |  |  ├ mantine-provider.tsx : Mantine theme provider
  |  |  |  └ query-provider.tsx : TanStack Query provider
  |  |  └ ui/ : Common UI components
  |  |     ├ layout/ : Layout components
  |  |     |  ├ header.tsx : Application header
  |  |     |  ├ footer.tsx : Application footer
  |  |     |  └ navigation.tsx : Navigation component
  |  |     ├ forms/ : Form components
  |  |     |  ├ login-form.tsx : Login form
  |  |     |  └ contact-form.tsx : Contact form
  |  |     └ feedback/ : User feedback components
  |  |        ├ loading-spinner.tsx : Loading component
  |  |        └ error-boundary.tsx : Error boundary component
  |  ├ features : Feature-based modules
  |  |  ├ auth/ : Authentication feature
  |  |  |  ├ components/ : Auth-specific components
  |  |  |  |  ├ login-form.tsx : Login form component
  |  |  |  |  └ signup-form.tsx : Signup form component
  |  |  |  ├ server/ : Server functions for auth
  |  |  |  |  ├ auth-functions.ts : Authentication server functions
  |  |  |  |  └ session-utils.ts : Session management utilities
  |  |  |  ├ types/ : Auth type definitions
  |  |  |  |  ├ schemas/ : Zod schemas for validation
  |  |  |  |  |  ├ login-schema.ts : Login validation schema
  |  |  |  |  |  └ user-schema.ts : User data schema
  |  |  |  |  └ auth.ts : Auth-related TypeScript types
  |  |  |  ├ hooks/ : Auth-specific hooks
  |  |  |  |  └ use-auth.ts : Authentication hook
  |  |  |  └ utils/ : Auth utility functions
  |  |  |     └ token-utils.ts : Token handling utilities
  |  |  ├ posts/ : Posts feature
  |  |  |  ├ components/
  |  |  |  |  ├ post-list.tsx : Posts listing component
  |  |  |  |  ├ post-card.tsx : Individual post card
  |  |  |  |  └ post-form.tsx : Post creation/editing form
  |  |  |  ├ server/
  |  |  |  |  └ posts-functions.ts : Posts server functions
  |  |  |  ├ types/
  |  |  |  |  ├ schemas/
  |  |  |  |  |  └ post-schema.ts : Post validation schema
  |  |  |  |  └ post.ts : Post-related types
  |  |  |  └ hooks/
  |  |  |     └ use-posts.ts : Posts data hook
  |  |  └ users/ : Users feature
  |  |     ├ components/
  |  |     |  ├ user-list.tsx : Users listing
  |  |     |  └ user-profile.tsx : User profile component
  |  |     ├ server/
  |  |     |  └ users-functions.ts : Users server functions
  |  |     ├ types/
  |  |     |  ├ schemas/
  |  |     |  |  └ user-schema.ts : User validation schema
  |  |     |  └ user.ts : User-related types
  |  |     └ hooks/
  |  |        └ use-users.ts : Users data hook
  |  ├ hooks : Global custom hooks
  |  |  ├ use-local-storage.ts : Local storage hook
  |  |  └ use-debounce.ts : Debounce hook
  |  ├ theme : Mantine theme configuration
  |  |  ├ index.ts : Main theme configuration
  |  |  ├ colors.ts : Custom color definitions
  |  |  └ components.ts : Component style overrides
  |  ├ types : Global type definitions
  |  |  ├ api.ts : API response types
  |  |  └ common.ts : Common utility types
  |  ├ utils : Global utility functions
  |  |  ├ format.ts : Formatting utilities
  |  |  ├ validation.ts : Validation helpers
  |  |  └ api.ts : API utility functions
  |  ├ constants : Application constants
  |  |  ├ routes.ts : Route path constants
  |  |  └ config.ts : Configuration constants
  |  ├ styles : Global styles
  |  |  ├ globals.css : Global CSS styles
  |  |  └ components.css : Component-specific styles
  |  ├ router.tsx : Router configuration
  |  └ routeTree.gen.ts : Generated route tree (auto-generated)
  ├ .env.* : Environment variable files
  ├ app.config.ts : TanStack Start configuration
  ├ vite.config.ts : Vite configuration
  ├ package.json : Package dependencies and scripts
  ├ tsconfig.json : TypeScript configuration
  ├ postcss.config.cjs : PostCSS configuration (for Mantine)
  └ biome.json : Code formatting and linting
```


