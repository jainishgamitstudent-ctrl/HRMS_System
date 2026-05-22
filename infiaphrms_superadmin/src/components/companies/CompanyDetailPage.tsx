"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { showConfirm, showDeleteConfirm } from "@/lib/sweetalert";
import { getCompanyById, mockAdmins, mockHRUsers, mockAuditLogs } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Calendar, Users, ShieldCheck, UserCheck, Settings, CreditCard, FileText, ArrowLeft } from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: Calendar },
  { id: "admins", label: "Admins", icon: ShieldCheck },
  { id: "hr", label: "HR Users", icon: UserCheck },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "audit", label: "Audit Log", icon: FileText },
];

export function CompanyDetailPage({ companyId }: { companyId: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const { addToast } = useToast();

  const company = getCompanyById(companyId);
  if (!company) {
    return (
      <AdminShell>
        <div className="text-center py-20">
          <h1 className="text-xl font-semibold">Company not found</h1>
          <Link href="/companies" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">&larr; Back to companies</Link>
        </div>
      </AdminShell>
    );
  }

  const c = company;

  const companyAdmins = mockAdmins.filter((a) => a.companyId === companyId);
  const companyHR = mockHRUsers.filter((h) => h.companyId === companyId);
  const companyAudit = mockAuditLogs.filter((a) => a.companyId === companyId).slice(0, 20);

  async function handleSuspend() {
    const result = await showConfirm(
      `Suspend ${c.name}?`,
      "All users will be locked out until reactivated.",
      "Suspend",
      "Cancel"
    );
    if (result.isConfirmed) addToast({ title: "Company suspended", type: "success" });
  }

  async function handleDelete() {
    const result = await showDeleteConfirm(c.name);
    if (result.isConfirmed) addToast({ title: "Company deleted", type: "success" });
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Companies", href: "/companies" }, { label: company.name }]} />
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/companies"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={company.status === "active" ? "success" : company.status === "trial" ? "info" : company.status === "suspended" ? "warning" : "secondary"}>{company.status}</Badge>
                <Badge variant={company.plan === "Enterprise" ? "info" : company.plan === "Pro" ? "success" : "secondary"}>{company.plan}</Badge>
                <span className="text-sm text-muted-foreground">{company.country}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSuspend}>Suspend</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Company Statistics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                    <p className="text-2xl font-bold mt-2">{company.employeeCount}</p>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <ShieldCheck className="h-5 w-5 mx-auto text-muted-foreground" />
                    <p className="text-2xl font-bold mt-2">{company.adminCount}</p>
                    <p className="text-xs text-muted-foreground">Admins</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <UserCheck className="h-5 w-5 mx-auto text-muted-foreground" />
                    <p className="text-2xl font-bold mt-2">{company.hrCount}</p>
                    <p className="text-xs text-muted-foreground">HR Users</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <CreditCard className="h-5 w-5 mx-auto text-muted-foreground" />
                    <p className="text-2xl font-bold mt-2">₹{c.mrr}</p>
                    <p className="text-xs text-muted-foreground">MRR</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Industry</span><span className="font-medium">{company.industry}</span></div>
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Size</span><span className="font-medium">{company.size}</span></div>
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Timezone</span><span className="font-medium">{company.timezone}</span></div>
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Currency</span><span className="font-medium">{company.currency}</span></div>
                  <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Created</span><span className="font-medium">{new Date(company.createdAt).toLocaleDateString()}</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Feature Flags</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(company.featureFlags).map(([key, val]) => (
                    <label key={key} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <input type="checkbox" checked={val} readOnly className="h-4 w-4" />
                    </label>
                  ))}
                </div>
                <div className="mt-6"><CardTitle className="text-base mb-3">Modules</CardTitle></div>
                <div className="space-y-3">
                  {Object.entries(company.modules).map(([key, val]) => (
                    <label key={key} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{key}</span>
                      <input type="checkbox" checked={val} readOnly className="h-4 w-4" />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "admins" && (
          <DataTable
            columns={[
              { key: "name", header: "Name", cell: (a) => <Link href={`/admins/${a.id}`} className="font-medium hover:underline">{a.fullName}</Link> },
              { key: "email", header: "Email", cell: (a) => a.email },
              { key: "status", header: "Status", cell: (a) => <Badge variant={a.status === "active" ? "success" : "secondary"}>{a.status}</Badge> },
              { key: "lastLogin", header: "Last Login", cell: (a) => a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never" },
            ]}
            data={companyAdmins}
            keyExtractor={(a) => a.id}
            emptyState={<EmptyState title="No admins" description="This company has no assigned admins yet." />}
          />
        )}

        {activeTab === "hr" && (
          <DataTable
            columns={[
              { key: "name", header: "Name", cell: (h) => <Link href={`/hr-users/${h.id}`} className="font-medium hover:underline">{h.fullName}</Link> },
              { key: "email", header: "Email", cell: (h) => h.email },
              { key: "status", header: "Status", cell: (h) => <Badge variant={h.status === "active" ? "success" : "secondary"}>{h.status}</Badge> },
              { key: "modules", header: "Modules", cell: (h) => h.assignedModules.join(", ") },
            ]}
            data={companyHR}
            keyExtractor={(h) => h.id}
            emptyState={<EmptyState title="No HR users" description="This company has no HR staff assigned yet." />}
          />
        )}

        {activeTab === "settings" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Company Settings</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Timezone" value={company.timezone} readOnly />
                <Input label="Currency" value={company.currency} readOnly />
                <Input label="Primary Color" value={company.primaryColor} readOnly />
                <Input label="Subdomain" value={company.subdomain || "—"} readOnly />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "billing" && (
          <Card>
            <CardHeader><CardTitle className="text-base">Billing Information</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Current Plan</span><Badge variant={company.plan === "Enterprise" ? "info" : company.plan === "Pro" ? "success" : "secondary"}>{company.plan}</Badge></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">MRR</span><span className="font-medium">₹{c.mrr}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Renewal Date</span><span className="font-medium">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">Upgrade</Button>
                  <Button variant="outline" size="sm">Downgrade</Button>
                  <Button variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "audit" && (
          <DataTable
            columns={[
              { key: "actor", header: "Actor", cell: (a) => a.actor },
              { key: "action", header: "Action", cell: (a) => <Badge variant="secondary">{a.action}</Badge> },
              { key: "resource", header: "Resource", cell: (a) => a.resource },
              { key: "timestamp", header: "Timestamp", cell: (a) => new Date(a.timestamp).toLocaleString() },
            ]}
            data={companyAudit}
            keyExtractor={(a) => a.id}
            emptyState={<EmptyState title="No audit entries" description="No actions have been recorded for this company." />}
          />
        )}
      </motion.div>

    </AdminShell>
  );
}
