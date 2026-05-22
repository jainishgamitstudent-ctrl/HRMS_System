import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Users,
  KeyRound,
  BarChart3,
  Settings,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

export const SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    label: "Company Management",
    href: "/companies",
    icon: Building2,
  },
  {
    label: "Admin Management",
    href: "/admins",
    icon: ShieldCheck,
  },
  {
    label: "HR User Management",
    href: "/hr-users",
    icon: Users,
  },
  {
    label: "Roles & Permissions",
    href: "/roles",
    icon: KeyRound,
  },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "System Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Security", href: "/settings/security" },
      { label: "Notifications", href: "/settings/notifications" },
      { label: "Announcements", href: "/settings/announcements" },
      { label: "Maintenance", href: "/settings/maintenance" },
      { label: "API Keys", href: "/settings/api-keys" },
      { label: "Platform Config", href: "/settings/platform" },
    ],
  },
  {
    label: "Billing & Subscriptions",
    href: "/billing",
    icon: CreditCard,
  },
];

export const COMPANY_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "trial", label: "Trial", color: "bg-blue-100 text-blue-700" },
  { value: "suspended", label: "Suspended", color: "bg-amber-100 text-amber-700" },
  { value: "deleted", label: "Deleted", color: "bg-gray-100 text-gray-700" },
] as const;

export const USER_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-700" },
] as const;

export const PLANS: PlanType[] = ["Free", "Pro", "Enterprise"];
export type PlanType = "Free" | "Pro" | "Enterprise";

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Other",
] as const;

export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
] as const;

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "India",
  "Germany",
  "Australia",
  "Canada",
  "Singapore",
  "UAE",
] as const;

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

export const CURRENCIES = [
  "USD",
  "GBP",
  "INR",
  "EUR",
  "AUD",
  "CAD",
  "SGD",
  "AED",
] as const;

export const PERMISSION_MODULES = [
  "Company Management",
  "Employee Management",
  "Payroll & Finance",
  "Leave & Attendance",
  "Recruitment & Onboarding",
  "Reports & Analytics",
  "System Settings",
] as const;

export const REPORT_TYPES = [
  { id: "platform-overview", label: "Platform Overview", href: "/reports/platform-overview" },
  { id: "company-health", label: "Company Health", href: "/reports/company-health" },
  { id: "employee-trends", label: "Employee Trends", href: "/reports/employee-trends" },
  { id: "attendance", label: "Attendance Analytics", href: "/reports/attendance" },
  { id: "payroll", label: "Payroll Summary", href: "/reports/payroll" },
  { id: "leave", label: "Leave Analytics", href: "/reports/leave" },
  { id: "recruitment", label: "Recruitment Funnel", href: "/reports/recruitment" },
  { id: "login-activity", label: "Login Activity", href: "/reports/login-activity" },
  { id: "audit-log", label: "Audit Log", href: "/reports/audit-log" },
] as const;
