import type {
  Company,
  Admin,
  HRUser,
  Role,
  Invoice,
  Plan,
  TrialCompany,
  Announcement,
  AuditLogEntry,
  LoginActivity,
  Notification,
  SystemHealth,
} from "./types";

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(daysBack: number = 365): string {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysBack));
  return d.toISOString();
}

const industries = ["Technology", "Healthcare", "Finance", "Education", "Manufacturing", "Retail", "Consulting", "Other"];
const countries = ["United States", "United Kingdom", "India", "Germany", "Australia", "Canada", "Singapore", "UAE"];
const plans: Array<"Free" | "Pro" | "Enterprise"> = ["Free", "Pro", "Enterprise"];
const statuses: Array<"active" | "trial" | "suspended" | "deleted"> = ["active", "trial", "suspended", "deleted"];

export const mockCompanies: Company[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `comp-${i + 1}`,
  name: [
    "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries",
    "Wayne Enterprises", "Cyberdyne", "Massive Dynamic", "Hooli", "Pied Piper",
    "Aviato", "Bachmanity", "Nucleus", "Endframe", "Raviga",
    "Eklow", "Fenwick", "Maleant", "Optra", "Somerville",
    "Tetrabit", "Veratech", "Xander", "YooHoo", "Zest",
    "Axiom", "Brio", "Caelus", "Dextro", "Elytron",
    "Fidelis", "Gravitas", "Helion", "Icarus", "Jovian",
    "Kestrel", "Lumin", "Meridian", "Nexus", "Omnia",
    "Paragon", "Quantix", "Radius", "Synthex", "Titan",
  ][i],
  industry: rand(industries),
  size: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"][randInt(0, 5)],
  country: rand(countries),
  status: i < 5 ? "trial" : i < 40 ? "active" : rand(["suspended", "deleted"]),
  plan: rand(plans),
  logo: undefined,
  primaryColor: "#2563eb",
  subdomain: undefined,
  createdAt: randDate(730),
  updatedAt: randDate(30),
  timezone: rand(["UTC", "America/New_York", "Europe/London", "Asia/Kolkata"]),
  currency: rand(["USD", "GBP", "INR", "EUR", "AUD"]),
  featureFlags: { onboarding: true, apiAccess: i % 3 === 0, customDomain: i % 5 === 0 },
  modules: { payroll: true, attendance: true, leave: true, recruitment: i % 2 === 0 },
  mrr: randInt(0, 5000),
  employeeCount: randInt(5, 500),
  adminCount: randInt(1, 5),
  hrCount: randInt(1, 10),
}));

export const mockAdmins: Admin[] = Array.from({ length: 60 }).map((_, i) => ({
  id: `admin-${i + 1}`,
  fullName: `Admin User ${i + 1}`,
  email: `admin${i + 1}@${mockCompanies[i % mockCompanies.length].name.toLowerCase().replace(/\s/g, "")}.com`,
  phone: `+1-555-01${String(i).padStart(2, "0")}`,
  companyId: mockCompanies[i % mockCompanies.length].id,
  companyName: mockCompanies[i % mockCompanies.length].name,
  status: i % 10 === 0 ? "inactive" : "active",
  role: i === 0 ? "superadmin" : "admin",
  lastLogin: i % 7 === 0 ? null : randDate(30),
  twoFactorEnabled: i % 3 === 0,
  createdAt: randDate(365),
}));

export const mockHRUsers: HRUser[] = Array.from({ length: 80 }).map((_, i) => ({
  id: `hr-${i + 1}`,
  fullName: `HR User ${i + 1}`,
  email: `hr${i + 1}@${mockCompanies[i % mockCompanies.length].name.toLowerCase().replace(/\s/g, "")}.com`,
  companyId: mockCompanies[i % mockCompanies.length].id,
  companyName: mockCompanies[i % mockCompanies.length].name,
  status: i % 12 === 0 ? "inactive" : "active",
  role: "hr",
  lastLogin: i % 8 === 0 ? null : randDate(30),
  twoFactorEnabled: false,
  createdAt: randDate(365),
  assignedModules: ["Employee Management", "Leave & Attendance", "Recruitment & Onboarding"].filter(() => Math.random() > 0.3),
}));

export const mockRoles: Role[] = [
  {
    id: "role-1",
    name: "superadmin",
    description: "Full platform access. Cannot be modified.",
    isSystem: true,
    permissions: [],
    userCount: 1,
    createdAt: randDate(730),
  },
  {
    id: "role-2",
    name: "admin",
    description: "Company-level administrator with full company access.",
    isSystem: true,
    permissions: [],
    userCount: mockAdmins.filter(a => a.role === "admin").length,
    createdAt: randDate(730),
  },
  {
    id: "role-3",
    name: "hr",
    description: "HR staff with limited module access.",
    isSystem: true,
    permissions: [],
    userCount: mockHRUsers.length,
    createdAt: randDate(730),
  },
  {
    id: "role-4",
    name: "employee",
    description: "Standard employee with self-service access.",
    isSystem: true,
    permissions: [],
    userCount: 1200,
    createdAt: randDate(730),
  },
  {
    id: "role-5",
    name: "Billing Manager",
    description: "Can manage invoices and billing settings.",
    isSystem: false,
    permissions: [],
    userCount: 8,
    createdAt: randDate(180),
  },
  {
    id: "role-6",
    name: "Read-Only Auditor",
    description: "View-only access to reports and logs.",
    isSystem: false,
    permissions: [],
    userCount: 4,
    createdAt: randDate(90),
  },
];

export const mockInvoices: Invoice[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `inv-${i + 1}`,
  companyId: mockCompanies[i % mockCompanies.length].id,
  companyName: mockCompanies[i % mockCompanies.length].name,
  date: randDate(180),
  amount: randInt(49, 5000),
  status: rand(["paid", "pending", "overdue", "cancelled"]),
  plan: rand(plans),
  lineItems: [
    { description: "Platform subscription", quantity: 1, unitPrice: randInt(49, 4999), total: 0 },
  ],
}));
mockInvoices.forEach(inv => {
  inv.lineItems[0].total = inv.lineItems[0].unitPrice;
});

export const mockPlans: Plan[] = [
  { id: "plan-free", name: "Free", price: 0, billingPeriod: "monthly", features: ["Up to 10 employees", "Basic attendance", "Email support"], limits: { employees: 10, storage: "1GB" }, isArchived: false },
  { id: "plan-pro", name: "Pro", price: 99, billingPeriod: "monthly", features: ["Up to 200 employees", "Advanced attendance", "Leave management", "Priority support", "API access"], limits: { employees: 200, storage: "50GB" }, isArchived: false },
  { id: "plan-enterprise", name: "Enterprise", price: 499, billingPeriod: "monthly", features: ["Unlimited employees", "All modules", "Custom integrations", "Dedicated support", "SSO", "Audit logs"], limits: { employees: "Unlimited", storage: "Unlimited" }, isArchived: false },
];

export const mockTrials: TrialCompany[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `trial-${i + 1}`,
  name: mockCompanies[i].name,
  daysRemaining: randInt(1, 14),
  adminEmail: mockAdmins[i].email,
  signupDate: mockCompanies[i].createdAt,
}));

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "New Feature: Custom Reports",
    message: "We have launched custom reports for all Pro and Enterprise customers.",
    target: "all",
    channel: ["in-app", "email"],
    scheduledAt: null,
    sentAt: randDate(7),
    status: "sent",
  },
  {
    id: "ann-2",
    title: "Scheduled Maintenance",
    message: "Platform maintenance on Sunday 2 AM UTC.",
    target: "all",
    channel: ["in-app"],
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: null,
    status: "scheduled",
  },
];

export const mockAuditLogs: AuditLogEntry[] = Array.from({ length: 100 }).map((_, i) => ({
  id: `audit-${i + 1}`,
  actor: rand(mockAdmins).fullName,
  actorId: `admin-${randInt(1, 20)}`,
  action: rand(["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT", "SUSPEND", "ACTIVATE"]),
  resource: rand(["Company", "Admin", "HRUser", "Role", "Invoice", "Setting"]),
  resourceId: `res-${randInt(1, 100)}`,
  companyId: rand(mockCompanies).id,
  companyName: rand(mockCompanies).name,
  timestamp: randDate(90),
}));

export const mockLoginActivity: LoginActivity[] = Array.from({ length: 60 }).map((_, i) => ({
  id: `login-${i + 1}`,
  userId: `user-${randInt(1, 100)}`,
  userName: rand(mockAdmins).fullName,
  companyId: rand(mockCompanies).id,
  companyName: rand(mockCompanies).name,
  ip: `192.168.${randInt(0, 255)}.${randInt(0, 255)}`,
  userAgent: "Mozilla/5.0",
  status: rand(["success", "success", "success", "failed", "blocked"]),
  timestamp: randDate(30),
}));

export const mockNotifications: Notification[] = [
  { id: "notif-1", title: "New company signup", message: "Acme Corp has signed up for a trial.", type: "success", read: false, timestamp: randDate(1), link: "/companies/comp-1" },
  { id: "notif-2", title: "Plan expiry warning", message: "Globex Pro plan expires in 3 days.", type: "warning", read: false, timestamp: randDate(2), link: "/billing" },
  { id: "notif-3", title: "Login anomaly detected", message: "Suspicious login from IP 203.0.113.42.", type: "error", read: true, timestamp: randDate(3), link: "/reports/login-activity" },
  { id: "notif-4", title: "System alert", message: "Queue depth exceeded 1000 messages.", type: "warning", read: true, timestamp: randDate(1), link: "/" },
];

export const mockSystemHealth: SystemHealth = {
  apiUptime: 99.98,
  errorRate: 0.04,
  queueStatus: "healthy",
  queueDepth: 12,
  lastChecked: new Date().toISOString(),
};

export function getCompanyById(id: string): Company | undefined {
  return mockCompanies.find(c => c.id === id);
}

export function getAdminById(id: string): Admin | undefined {
  return mockAdmins.find(a => a.id === id);
}

export function getHRUserById(id: string): HRUser | undefined {
  return mockHRUsers.find(h => h.id === id);
}

export function getRoleById(id: string): Role | undefined {
  return mockRoles.find(r => r.id === id);
}

export function getInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find(i => i.id === id);
}
