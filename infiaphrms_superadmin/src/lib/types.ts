export type CompanyStatus = "active" | "trial" | "suspended" | "deleted";
export type PlanType = "Free" | "Pro" | "Enterprise";
export type UserStatus = "active" | "inactive";

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  country: string;
  status: CompanyStatus;
  plan: PlanType;
  logo?: string;
  primaryColor?: string;
  subdomain?: string;
  createdAt: string;
  updatedAt: string;
  timezone: string;
  currency: string;
  featureFlags: Record<string, boolean>;
  modules: Record<string, boolean>;
  mrr: number;
  employeeCount: number;
  adminCount: number;
  hrCount: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  companyId: string;
  companyName: string;
  status: UserStatus;
  role: string;
  lastLogin: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Admin extends User {}
export interface HRUser extends User {
  assignedModules: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
  userCount: number;
  createdAt: string;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  label: string;
  enabled: boolean;
}

export interface Invoice {
  id: string;
  companyId: string;
  companyName: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "cancelled";
  plan: PlanType;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Plan {
  id: string;
  name: PlanType;
  price: number;
  billingPeriod: "monthly" | "yearly";
  features: string[];
  limits: Record<string, number | string>;
  isArchived: boolean;
}

export interface TrialCompany {
  id: string;
  name: string;
  daysRemaining: number;
  adminEmail: string;
  signupDate: string;
}

export interface ApiKey {
  id: string;
  name: string;
  scope: string;
  keyPreview: string;
  lastUsed: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target: "all" | string[];
  channel: ("in-app" | "email")[];
  scheduledAt: string | null;
  sentAt: string | null;
  status: "draft" | "scheduled" | "sent";
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorId: string;
  action: string;
  resource: string;
  resourceId: string;
  companyId?: string;
  companyName?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  apiUptime: number;
  errorRate: number;
  queueStatus: "healthy" | "lagging" | "backlogged";
  queueDepth: number;
  lastChecked: string;
}

export interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  companyName: string;
  ip: string;
  userAgent: string;
  status: "success" | "failed" | "blocked";
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
