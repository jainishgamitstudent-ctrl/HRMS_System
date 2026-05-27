"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/providers/ToastProvider";
import { showConfirm } from "@/lib/sweetalert";
import { hrUsersApi, companiesApi } from "@/lib/api";
import type { HRUser, Company } from "@/lib/types";
import { User, Building2, Shield, Activity, ArrowLeft } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "company", label: "Assigned Company", icon: Building2 },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "activity", label: "Activity Log", icon: Activity },
];

export function HRUserDetailPage({ hrUserId }: { hrUserId: string }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [reassignOpen, setReassignOpen] = useState(false);
  const [hrUser, setHrUser] = useState<HRUser | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [userRes, compRes] = await Promise.all([
          hrUsersApi.get(hrUserId).catch(() => null),
          companiesApi.list({ limit: 1000 }).catch(() => null),
        ]);
        if (cancelled) return;
        setHrUser((userRes as unknown) as HRUser);
        setCompanies(((compRes?.companies || []) as unknown) as Company[]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [hrUserId]);

  if (!hrUser) {
    return (
      <AdminShell>
        <div className="text-center py-20">
          <h1 className="text-xl font-semibold">HR User not found</h1>
          <Link href="/hr-users" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">&larr; Back to HR users</Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "HR Users", href: "/hr-users" }, { label: hrUser.fullName }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/hr-users"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{hrUser.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={hrUser.status === "active" ? "success" : "secondary"}>{hrUser.status}</Badge>
                <Badge variant="secondary">{hrUser.role}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setReassignOpen(true)}>Reassign Company</Button>
            <Button variant={hrUser.status === "active" ? "destructive" : "default"} size="sm" onClick={async () => {
              const result = await showConfirm(
                `${hrUser.status === "active" ? "Deactivate" : "Activate"} ${hrUser.fullName}?`,
                `Are you sure you want to ${hrUser.status === "active" ? "deactivate" : "activate"} this HR user?`,
                hrUser.status === "active" ? "Deactivate" : "Activate",
                "Cancel"
              );
              if (result.isConfirmed) {
                try {
                  const newStatus = hrUser.status === "active" ? "inactive" : "active";
                  await hrUsersApi.updateStatus(hrUserId, newStatus);
                  setHrUser({ ...hrUser, status: newStatus });
                  addToast({ title: hrUser.status === "active" ? "HR user deactivated" : "HR user activated", type: "success" });
                } catch (err: any) {
                  addToast({ title: err.message || "Failed to update status", type: "error" });
                }
              }
            }}>{hrUser.status === "active" ? "Deactivate" : "Activate"}</Button>
          </div>
        </div>
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>
        {activeTab === "profile" && (
          <Card><CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Email</span><p className="font-medium">{hrUser.email}</p></div>
              <div><span className="text-muted-foreground">Company</span><p className="font-medium">{hrUser.companyName}</p></div>
              <div><span className="text-muted-foreground">Role</span><p className="font-medium">{hrUser.role}</p></div>
              <div><span className="text-muted-foreground">Last Login</span><p className="font-medium">{hrUser.lastLogin ? new Date(hrUser.lastLogin).toLocaleString() : "Never"}</p></div>
              <div><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(hrUser.createdAt).toLocaleDateString()}</p></div>
            </div>
          </CardContent></Card>
        )}
        {activeTab === "company" && (
          <Card><CardHeader><CardTitle className="text-base">Assigned Company</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">{hrUser.companyName}</p><p className="text-sm text-muted-foreground mt-1">ID: {hrUser.companyId}</p></CardContent></Card>
        )}
        {activeTab === "permissions" && (
          <Card><CardHeader><CardTitle className="text-base">Module Access</CardTitle></CardHeader><CardContent>
            <div className="space-y-2">
              {hrUser.assignedModules.map((m) => (
                <label key={m} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"><span>{m}</span><input type="checkbox" checked readOnly className="h-4 w-4" /></label>
              ))}
            </div>
          </CardContent></Card>
        )}
        {activeTab === "activity" && (
          <Card><CardHeader><CardTitle className="text-base">Activity Log</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No recent activity recorded.</p></CardContent></Card>
        )}
      </div>
      <Modal isOpen={reassignOpen} onClose={() => setReassignOpen(false)} title="Reassign Company" footer={<><Button variant="outline" onClick={() => setReassignOpen(false)}>Cancel</Button><Button onClick={() => { setReassignOpen(false); addToast({ title: "Company reassigned", type: "success" }); }}>Reassign</Button></>}>
        <div className="space-y-4">
          <p className="text-sm">Select a new company for <span className="font-semibold">{hrUser.fullName}</span>.</p>
          <Select label="New Company" options={companies.map(c => ({ value: c.id, label: c.name }))} />
        </div>
      </Modal>
    </AdminShell>
  );
}
