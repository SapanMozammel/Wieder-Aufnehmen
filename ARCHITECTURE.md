# Project Architecture

## Folder Structure

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
│   ├── icons/                          # Base Icon components
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
│   ├── validations/                    # Zod validation schemas (consolidated)
│   │   ├── auth.ts                     # Authentication schemas
│   │   ├── user.ts                     # User schemas
│   │   ├── blog.ts                     # Blog schemas
│   │   ├── portfolio.ts                # Portfolio schemas
│   │   ├── forms.ts                    # Form validation schemas
│   │   └── common.ts                   # Common validation schemas
│   ├── constants/                      # Application constants (consolidated)
│   │   ├── roles.ts                    # User roles and permissions
│   │   ├── routes.ts                   # Application routes
│   │   ├── api.ts                      # API constants
│   │   ├── ui.ts                       # UI constants
│   │   └── index.ts                    # Main constants export
│   ├── hooks/                          # Custom React hooks
│   │   ├── useAuth.ts                  # Authentication hooks
│   │   ├── useApi.ts                   # API hooks
│   │   ├── useLocalStorage.ts          # Local storage hooks
│   │   ├── useDebounce.ts              # Debounce hooks
│   │   └── usePermissions.ts           # Permission hooks
│   ├── utils/                          # General utilities (consolidated)
│   │   ├── format.ts                   # Formatting utilities
│   │   ├── validation.ts               # Validation utilities
│   │   ├── date.ts                     # Date utilities
│   │   ├── string.ts                   # String utilities (includes generateId)
│   │   ├── file.ts                     # File utilities
│   │   ├── async.ts                    # Async utilities (sleep, promises)
│   │   └── performance.ts              # Performance utilities (debounce, throttle)
│   ├── utils.ts                        # shadcn/ui utilities (cn function)

├── types/                              # TypeScript type definitions
│   ├── api.ts                          # API response/request types
│   ├── auth.ts                         # Authentication types
│   ├── blog.ts                         # Blog-related types
│   ├── portfolio.ts                    # Portfolio-related types
│   ├── users.ts                        # User-specific types
│   ├── role.ts                         # Role management types
│   ├── permission.ts                   # Permission management types
│   ├── analytics.ts                    # Analytics types
│   ├── notifications.ts                # Notification types
│   ├── database.ts                     # Database model types
│   ├── forms.ts                        # Form-related types
│   ├── ui.ts                           # UI component types
│   └── global.ts                       # Global types and interfaces
├── styles/                             # Styling (renamed from scss/)
│   ├── globals.scss                    # Moved from app/globals.scss
│   ├── themes.scss                     # Theme configurations
│   ├── utilities.scss                  # Utility classes
│   ├── components.scss                 # Component-specific styles
│   └── animations.scss                 # Animation styles
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
├── graphql/                            # GraphQL setup
│   └── schema.graphql                  # GraphQL schema definition
└── middleware.ts                       # Next.js middleware
```
