# InfiAP HRMS — SuperAdmin Panel

## Architecture Overview

- **Framework**: Next.js 16 + TypeScript + Tailwind CSS
- **UI Pattern**: Desktop-first, data-dense admin panel
- **Layout**: Fixed sidebar (260px) + sticky header (64px) + main content area
- **State**: Client-side React state with mock data

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Dashboard (entry)
    companies/            # Company Management
    admins/               # Admin Management
    hr-users/             # HR User Management
    roles/                # Roles & Permissions
    reports/              # Reports & Analytics
    billing/              # Billing & Subscriptions
    settings/             # Platform Settings
  components/
    layout/               # Sidebar, Header, Breadcrumbs, AdminShell
    ui/                   # Reusable UI (Badge, Button, Card, DataTable, Modal, etc.)
    providers/            # ToastProvider
    dashboard/            # DashboardPage
    companies/            # CompaniesPage, CompanyWizardPage, CompanyDetailPage
    admins/               # AdminsPage, AdminDetailPage
    hr-users/             # HRUsersPage, HRUserDetailPage
    roles/                # RolesPage, RoleFormPage
    reports/              # ReportsHubPage, PlatformOverviewReport, AuditLogReport, LoginActivityReport
    billing/              # BillingDashboardPage, PlansPage, InvoicesPage, InvoiceDetailPage, TrialsPage
    settings/             # ProfileSettingsPage, SecuritySettingsPage, NotificationSettingsPage, etc.
  lib/
    types.ts              # Domain TypeScript types
    constants.ts          # Nav items, statuses, plans, industries
    mock-data.ts          # Mock API data
    utils.ts              # cn() helper
```

## Sitemap

### 1. Dashboard (`/`)
- KPI Cards (Total companies, active users, MRR, system health)
- Charts (signups over time, plan distribution)
- Recent Signups table
- System Health indicators

### 2. Company Management (`/companies`)
- `/companies` — List view with search, filters, bulk actions, suspend/delete modals
- `/companies/new` — 5-step creation wizard (Basic Info > Branding > Plan > Admin Invite > Review)
- `/companies/[id]` — Detail with tabs: Overview, Admins, HR Users, Settings, Billing, Audit Log

### 3. Admin Management (`/admins`)
- `/admins` — List with company filter, reset password, deactivate
- `/admins/[id]` — Profile, Permissions, Sessions, Audit Log tabs

### 4. HR User Management (`/hr-users`)
- `/hr-users` — List with module access preview, reassign company
- `/hr-users/[id]` — Profile, Assigned Company, Permissions, Activity Log tabs

### 5. Roles & Permissions (`/roles`)
- `/roles` — System roles grid + custom roles cards with user counts
- `/roles/new` — Create role with permission matrix (View/Create/Edit/Delete/Export per module)
- `/roles/[id]` — Edit existing role

### 6. Reports & Analytics (`/reports`)
- `/reports` — Hub grid linking to all reports
- `/reports/platform-overview` — MRR, revenue, churn, company breakdown
- `/reports/audit-log` — Filterable audit trail with CSV export
- `/reports/login-activity` — Authentication events with anomaly detection
- Additional placeholder routes: company-health, employee-trends, attendance, payroll, leave, recruitment

### 7. Billing & Subscriptions (`/billing`)
- `/billing` — MRR, revenue KPIs, recent invoices, plan distribution
- `/billing/plans` — Plan cards with edit modal
- `/billing/invoices` — Full invoice list with status filters
- `/billing/invoices/[id]` — Invoice detail with line items and PDF download
- `/billing/trials` — Active trials, days remaining, extend modal

### 8. Platform Settings (`/settings`)
- `/settings/profile` — Avatar, name, email, password change
- `/settings/security` — 2FA setup, active sessions, password policy
- `/settings/notifications` — Event notification matrix (Email/In-App/SMS)
- `/settings/announcements` — Compose and broadcast to all or select tenants
- `/settings/maintenance` — Global and per-company maintenance mode
- `/settings/api-keys` — Create, scope, revoke API keys
- `/settings/platform` — Timezone, currencies, feature flags

## Global UI Patterns

- **Sidebar**: Collapsible, section headers, active state highlight
- **Header**: Global search, notifications dropdown, user avatar
- **Breadcrumbs**: Context-aware on every page
- **Modals**: ESC to close, size variants (sm, md, lg, xl), confirm-destructive actions
- **Toasts**: Auto-dismiss after 5s, stacking bottom-right
- **Tables**: Sortable, selectable rows, empty states, pagination with page-size selector
- **Filters**: Expandable filter bar with active chip pills
- **Skeletons**: Pulse animation for loading states
- **Badges**: Semantic colors (success, warning, error, info, secondary)

## Data Layer

All data is currently mocked in `src/lib/mock-data.ts`. Types are defined in `src/lib/types.ts`. Helper lookup functions (`getCompanyById`, `getAdminById`, etc.) are provided for detail pages.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```
