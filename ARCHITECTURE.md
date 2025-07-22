# Project Architecture

## 1. Folder Structure

```
src/
├── app/                                # Next.js App Router (pages only)
│   ├── layout.tsx
│   ├── page.tsx                        # Root redirect logic
│   ├── (auth)/                         # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── layout.tsx
│   ├── (marketing)/                    # Marketing/landing routes for row users
│   │   ├── layout.tsx
│   │   ├── (landing)/
│   │   │   └── page.tsx
│   │   ├── apps/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── about/
│   │   ├── support/
│   │   ├── blog/                       # Public blog view (read-only)
│   │   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   └── career/
│   ├── founder/
│   │   ├── layout.tsx
│   │   ├── (landing)/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   ├── services/
│   │   ├── blog/                       # founder's blog view (read-only)
│   │   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── portfolio/                  # founder's portfolio view (read-only)
│   │   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   └── contact/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard redirect logic (role-based)
│   │   ├── profile/                    # Profile management
│   │   ├── (admin)/                    # Admin dashboard routes (includes super-admin, admin, manager)
│   │   │   ├── page.tsx                # Admin dashboard home
│   │   │   ├── analytics/              # Analytics (full for super-admin, limited for admin/manager)
│   │   │   ├── apps/                   # Apps management (create for super-admin, manage for admin/manager)
│   │   │   ├── users/                  # User management (all users for super-admin, users/subscribers for admin/manager)
│   │   │   ├── roles/                  # Role management (super-admin only)
│   │   │   ├── orders/                 # Order management
│   │   │   ├── content/                # Content moderation
│   │   │   ├── settings/               # System settings (super-admin only)
│   │   │   │   └── permissions/        # Permission management (super-admin only)
│   │   │   ├── billing/                # Financial management (super-admin only)
│   │   │   ├── blog/                   # General blog management (admin/manager)
│   │   │   │   ├── create/
│   │   │   │   ├── edit/[id]/
│   │   │   │   └── page.tsx
│   │   │   ├── marketing/              # Marketing mails management (admin/manager)
│   │   │   │   ├── newsletters/
│   │   │   │   ├── campaigns/
│   │   │   │   └── page.tsx
│   │   │   ├── founder/                # Founder-specific content (super-admin only)
│   │   │   │   ├── blog/
│   │   │   │   │   ├── create/
│   │   │   │   │   ├── edit/[id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── portfolio/
│   │   │   │       ├── create/
│   │   │   │       ├── edit/[id]/
│   │   │   │       └── page.tsx
│   │   │   ├── notifications/          # Notification management (admin/manager)
│   │   │   ├── audit/                  # Audit trails (super-admin only)
│   │   │   └── support/                # User support (admin/manager)
│   │   └── (user)/                     # User dashboard routes
│   │       ├── page.tsx                # User dashboard home
│   │       ├── billing/                # Personal billing
│   │       ├── notifications/          # Personal notifications
│   │       └── orders/                 # App requests / Feature requests
│   │           ├── request/
│   │           ├── history/
│   │           └── page.tsx
│   └── api/                            # API routes
│       ├── auth/
│       ├── blog/
│       ├── portfolio/
│       ├── apps/                       # Apps management API
│       ├── users/                      # User management API
│       ├── roles/                      # Role management API (super-admin only)
│       ├── permissions/                # Permission management API (super-admin only)
│       ├── orders/                     # Orders API
│       ├── analytics/                  # Analytics data API
│       ├── notifications/              # Notification system API
│       ├── audit/                      # Audit trails API (super-admin only)
│       ├── webhooks/                   # External integrations API
│       ├── marketing/                  # Marketing mails API (admin/manager)
│       │   ├── newsletters/
│       │   └── campaigns/
│       ├── subscribers/                # Subscriber management API
│       │   ├── newsletter/
│       │   └── preferences/
│       └── graphql/                    # GraphQL endpoint
│           └── route.ts
├── components/                         # React components
│   ├── ui/                             # Base UI components (shadcn/ui)
│   ├── forms/                          # Form-specific components
│   │   ├── auth/                       # Authentication forms
│   │   ├── user/                       # User management forms
│   │   ├── blog/                       # Blog forms
│   │   └── common/                     # Reusable form components
│   ├── layout/                         # Layout components
│   │   ├── marketing/                  # Marketing layout components
│   │   │   ├── common/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── app/
│   │   │   └── blog/
│   │   ├── founder/                    # Founder-specific layout components
│   │   │   ├── common/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── blog/
│   │   │   └── portfolio/
│   │   └── dashboard/                  # Dashboard layout components
│   │       ├── admin/                  # Admin dashboard layouts
│   │       ├── user/                   # User dashboard layouts
│   │       └── common/                 # Shared dashboard layouts
│   ├── features/                       # Feature-specific components
│   │   ├── auth/                       # Authentication components
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── password-reset/
│   │   ├── blog/                       # Blog management components
│   │   │   ├── editor/
│   │   │   ├── list/
│   │   │   └── viewer/
│   │   ├── portfolio/                  # Portfolio management components
│   │   │   ├── editor/
│   │   │   ├── gallery/
│   │   │   └── viewer/
│   │   ├── user-management/            # User management components
│   │   │   ├── user-list/
│   │   │   ├── user-profile/
│   │   │   ├── role-management/        # Super-admin only
│   │   │   └── permission-management/  # Super-admin only
│   │   ├── analytics/                  # Analytics components
│   │   │   ├── charts/
│   │   │   ├── metrics/
│   │   │   └── reports/
│   │   ├── marketing/                  # Marketing components
│   │   │   ├── newsletters/
│   │   │   └── campaigns/
│   │   ├── notifications/              # Notification components
│   │   │   ├── toast/
│   │   │   ├── inbox/
│   │   │   └── settings/
│   │   └── audit/                      # Audit trail components (super-admin only)
│   │       ├── logs/
│   │       └── reports/
│   └── common/                         # Shared/common components
│       ├── loading/                    # Loading states
│       ├── error/                      # Error boundaries and states
│       ├── modals/                     # Modal components
│       ├── tables/                     # Data table components
│       └── navigation/                 # Navigation components
├── lib/                                # Utilities and configurations
│   ├── auth/                           # Authentication utilities
│   │   ├── config.ts                   # Auth configuration
│   │   ├── providers.ts                # Auth providers (NextAuth, JWT)
│   │   ├── middleware.ts               # Auth middleware
│   │   └── utils.ts                    # Auth utility functions
│   ├── api/                            # API client and utilities
│   │   ├── client.ts                   # API client configuration
│   │   ├── endpoints.ts                # API endpoints
│   │   ├── interceptors.ts             # Request/response interceptors
│   │   └── types.ts                    # API types
│   ├── database/                       # Database utilities
│   │   ├── connection.ts               # Database connection
│   │   ├── migrations/                 # Database migrations
│   │   ├── seeds/                      # Database seeds
│   │   └── utils.ts                    # Database utilities
│   ├── validations/                    # Zod schemas
│   │   ├── auth.ts                     # Authentication schemas
│   │   ├── user.ts                     # User schemas
│   │   ├── blog.ts                     # Blog schemas
│   │   ├── portfolio.ts                # Portfolio schemas
│   │   └── common.ts                   # Common validation schemas
│   ├── constants/                      # Application constants
│   │   ├── roles.ts                    # User roles and permissions
│   │   ├── routes.ts                   # Application routes
│   │   ├── api.ts                      # API constants
│   │   └── ui.ts                       # UI constants
│   ├── hooks/                          # Custom React hooks
│   │   ├── useAuth.ts                  # Authentication hooks
│   │   ├── useApi.ts                   # API hooks
│   │   ├── useLocalStorage.ts          # Local storage hooks
│   │   ├── useDebounce.ts              # Debounce hooks
│   │   └── usePermissions.ts           # Permission hooks
│   ├── utils/                          # General utilities
│   │   ├── format.ts                   # Formatting utilities
│   │   ├── validation.ts               # Validation utilities
│   │   ├── date.ts                     # Date utilities
│   │   ├── string.ts                   # String utilities
│   │   └── file.ts                     # File utilities
│   └── config/                         # Configuration files
│       ├── database.ts                 # Database configuration
│       ├── auth.ts                     # Authentication configuration
│       ├── api.ts                      # API configuration
│       └── app.ts                      # Application configuration
├── types/                              # TypeScript type definitions
│   ├── api.ts                          # API response/request types
│   ├── auth.ts                         # Authentication types
│   ├── blog.ts                         # Blog-related types
│   ├── portfolio.ts                    # Portfolio-related types
│   ├── users.ts                        # User-specific types
│   ├── role.ts                         # Role management types
│   ├── permission.ts                   # Permission management types
│   ├── marketing.ts                    # Marketing management types
│   ├── analytics.ts                    # Analytics types
│   ├── notifications.ts                # Notification types
│   ├── audit.ts                        # Audit trail types
│   ├── database.ts                     # Database model types
│   ├── forms.ts                        # Form-related types
│   ├── ui.ts                           # UI component types
│   └── global.ts                       # Global types and interfaces
├── styles/                             # Styling (renamed from scss/)
│   ├── globals.css                     # Moved from app/globals.css
│   ├── components.css                  # Component-specific styles
│   ├── utilities.css                   # Utility classes
│   ├── themes/                         # Theme configurations
│   │   ├── light.css
│   │   ├── dark.css
│   │   └── variables.css
│   └── scss/                           # Keep existing SCSS files
│       └── style.scss                  # Main SCSS file
├── providers/                          # React context providers
│   ├── AuthProvider.tsx                # Authentication context
│   ├── ThemeProvider.tsx               # Theme context (light/dark mode)
│   ├── QueryProvider.tsx               # React Query/Apollo provider
│   ├── PermissionProvider.tsx          # Permission context
│   ├── NotificationProvider.tsx        # Notification context
│   └── index.tsx                       # Combined providers wrapper
├── store/                              # Redux Toolkit state management
│   ├── slices/                         # Redux slices
│   │   ├── authSlice.ts                # Authentication state
│   │   ├── userSlice.ts                # User management state (all user types)
│   │   ├── roleSlice.ts                # Role management state (super-admin only)
│   │   ├── permissionSlice.ts          # Permission management state (super-admin only)
│   │   ├── analyticsSlice.ts           # Analytics state
│   │   ├── dashboardSlice.ts           # Dashboard state
│   │   ├── blogSlice.ts                # Blog management state
│   │   ├── portfolioSlice.ts           # Portfolio management state
│   │   ├── notificationSlice.ts        # Notification state
│   │   ├── auditSlice.ts               # Audit trail state (super-admin only)
│   │   └── uiSlice.ts                  # UI state (modals, loading, etc.)
│   ├── api/                            # RTK Query API slices
│   │   ├── baseApi.ts                  # Base API configuration
│   │   ├── authApi.ts                  # Authentication APIs
│   │   ├── userApi.ts                  # User management APIs
│   │   ├── roleApi.ts                  # Role management APIs (super-admin only)
│   │   ├── permissionApi.ts            # Permission management APIs (super-admin only)
│   │   ├── blogApi.ts                  # Blog management APIs
│   │   ├── portfolioApi.ts             # Portfolio management APIs
│   │   ├── appsApi.ts                  # Apps management APIs
│   │   ├── analyticsApi.ts             # Analytics APIs
│   │   ├── notificationApi.ts          # Notification APIs
│   │   ├── auditApi.ts                 # Audit trail APIs (super-admin only)
│   │   └── marketingApi.ts             # Marketing APIs
│   ├── middleware/                     # Custom middleware
│   │   ├── authMiddleware.ts           # Authentication middleware
│   │   ├── errorMiddleware.ts          # Error handling middleware
│   │   ├── loggingMiddleware.ts        # Logging middleware
│   │   └── cacheMiddleware.ts          # Cache middleware
│   ├── selectors/                      # Reselect selectors
│   │   ├── authSelectors.ts            # Authentication selectors
│   │   ├── userSelectors.ts            # User selectors
│   │   ├── dashboardSelectors.ts       # Dashboard selectors
│   │   └── uiSelectors.ts              # UI selectors
│   ├── hooks.ts                        # Typed Redux hooks
│   └── index.ts                        # Store configuration
├── graphql/                            # GraphQL related files
│   ├── queries/                        # GraphQL queries
│   │   ├── auth.graphql                # Authentication queries
│   │   ├── user.graphql                # User queries
│   │   ├── blog.graphql                # Blog queries
│   │   ├── portfolio.graphql           # Portfolio queries
│   │   ├── analytics.graphql           # Analytics queries
│   │   ├── notifications.graphql       # Notification queries
│   │   └── audit.graphql               # Audit queries
│   ├── mutations/                      # GraphQL mutations
│   │   ├── auth.graphql                # Authentication mutations
│   │   ├── user.graphql                # User mutations
│   │   ├── blog.graphql                # Blog mutations
│   │   ├── portfolio.graphql           # Portfolio mutations
│   │   ├── notifications.graphql       # Notification mutations
│   │   └── audit.graphql               # Audit mutations
│   ├── subscriptions/                  # GraphQL subscriptions
│   │   ├── notifications.graphql       # Real-time notifications
│   │   ├── analytics.graphql           # Real-time analytics
│   │   └── audit.graphql               # Real-time audit logs
│   ├── fragments/                      # GraphQL fragments
│   │   ├── userFragment.graphql        # User fragments
│   │   ├── blogFragment.graphql        # Blog fragments
│   │   ├── portfolioFragment.graphql   # Portfolio fragments
│   │   └── commonFragment.graphql      # Common fragments
│   ├── generated/                      # Generated types and hooks
│   │   ├── graphql.ts                  # Generated types
│   │   ├── hooks.ts                    # Generated hooks
│   │   └── operations.ts               # Generated operations
│   ├── resolvers/                      # GraphQL resolvers (if using code-first)
│   │   ├── auth.ts                     # Authentication resolvers
│   │   ├── user.ts                     # User resolvers
│   │   ├── blog.ts                     # Blog resolvers
│   │   ├── portfolio.ts                # Portfolio resolvers
│   │   └── index.ts                    # Combined resolvers
│   ├── client.ts                       # Apollo Client configuration
│   ├── schema.graphql                  # GraphQL schema (if using schema-first)
│   └── codegen.yml                     # GraphQL Code Generator configuration
├── utils/                              # Global utility functions
│   ├── format.ts                       # Formatting utilities
│   ├── validation.ts                   # Validation utilities
│   ├── date.ts                         # Date utilities
│   ├── string.ts                       # String utilities
│   ├── file.ts                         # File utilities
│   └── constants.ts                    # Global constants
├── constants/                          # Application constants
│   ├── roles.ts                        # User roles and permissions
│   ├── routes.ts                       # Application routes
│   ├── api.ts                          # API constants
│   ├── ui.ts                           # UI constants
│   └── validation.ts                   # Validation constants
├── validations/                        # Zod validation schemas
│   ├── auth.ts                         # Authentication schemas
│   ├── user.ts                         # User schemas
│   ├── blog.ts                         # Blog schemas
│   ├── portfolio.ts                    # Portfolio schemas
│   ├── forms.ts                        # Form validation schemas
│   └── common.ts                       # Common validation schemas
└── middleware.ts                       # Next.js middleware
```

## 2. Folder Structure Improvements Made

### ✅ Added Missing Core Folders:

- **`types/`** - TypeScript type definitions (api.ts, auth.ts, blog.ts, portfolio.ts, users.ts, role.ts, permission.ts, marketing.ts, analytics.ts, notifications.ts, audit.ts, database.ts, forms.ts, ui.ts, global.ts)
- **`store/`** - Redux Toolkit setup (slices/, api/, middleware/, selectors/, hooks.ts, index.ts)
- **`providers/`** - React context providers (AuthProvider.tsx, ThemeProvider.tsx, QueryProvider.tsx, PermissionProvider.tsx, NotificationProvider.tsx, index.tsx)
- **`hooks/`** - Custom React hooks (useAuth.ts, usePermissions.ts, useLocalStorage.ts, useDebounce.ts, useApi.ts)
- **`utils/`** - Global utility functions (format.ts, validation.ts, date.ts, string.ts, file.ts, constants.ts)
- **`constants/`** - Application constants (roles.ts, routes.ts, api.ts, ui.ts, validation.ts)
- **`validations/`** - Zod validation schemas (auth.ts, user.ts, blog.ts, portfolio.ts, forms.ts, common.ts)
- **`graphql/`** - GraphQL setup (queries/, mutations/, subscriptions/, fragments/, generated/, resolvers/, client.ts, schema.graphql, codegen.yml)

### 🔄 Reorganized Existing Structure:

- **`styles/`** - Renamed from `scss/` (globals.css moved from app/, added components.css, utilities.css, themes/, kept scss/ folder)
- **`components/`** - Feature-based organization (ui/, forms/, layout/, features/, common/)
- **`lib/`** - Detailed sub-organization (auth/, api/, database/, validations/, constants/, hooks/, utils/, config/)
- **`api/`** - Added missing routes (analytics/, notifications/, audit/, webhooks/)

## 3. Implementation Priority

### Phase 1 (High Priority)

- **Setup GraphQL infrastructure** - Schema, resolvers, Apollo Client
- **Implement Redux Toolkit** - Store configuration, slices, RTK Query
- **Reorganize folder structure** - Move types, add GraphQL folder
- **GraphQL Code Generation** - Setup codegen for type safety
- **Basic error boundaries** - Add global error handling

### Phase 2 (Medium Priority)

- **RTK Query API integration** - Replace REST calls with GraphQL
- **Redux state management** - Implement all feature slices
- **Form validation** - Zod schemas + GraphQL validation
- **Authentication flow** - JWT or NextAuth with GraphQL
- **Testing setup** - Jest, RTL, MSW for GraphQL mocking

### Phase 3 (Low Priority)

- **Performance optimizations** - Query optimization, caching strategies
- **Advanced GraphQL features** - Subscriptions, fragments, directives
- **Monitoring & analytics** - GraphQL query analysis, error tracking
- **CI/CD pipeline** - Automated testing, schema validation
- **Documentation** - GraphQL playground, Storybook integration
