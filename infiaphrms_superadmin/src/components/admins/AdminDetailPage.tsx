"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { showConfirm } from "@/lib/sweetalert";
import { adminsApi } from "@/lib/api";
import type { Admin } from "@/lib/types";
import { User, Shield, Activity, FileText, ArrowLeft, KeyRound } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "sessions", label: "Sessions", icon: Activity },
  { id: "audit", label: "Audit Log", icon: FileText },
];

export function AdminDetailPage({ adminId }: { adminId: string }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [admin, setAdmin] = useState<Admin | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await adminsApi.get(adminId).catch(() => null);
        if (!cancelled) setAdmin((res as unknown) as Admin);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [adminId]);

  if (!admin) {
    return (
      <AdminShell>
        <div className="text-center py-20">
          <h1 className="text-xl font-semibold">Admin not found</h1>
          <Link href="/admins" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">&larr; Back to admins</Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Admins", href: "/admins" }, { label: admin.fullName }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admins"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{admin.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={admin.status === "active" ? "success" : "secondary"}>{admin.status}</Badge>
                <Badge variant="secondary">{admin.role}</Badge>
                {admin.twoFactorEnabled && <Badge variant="info">2FA</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={async () => {
              const result = await showConfirm(
                `Reset password for ${admin.fullName}?`,
                `A password reset email will be sent to ${admin.email}. The user will be required to set a new password on next login.`,
                "Send Reset",
                "Cancel"
              );
              if (result.isConfirmed) {
                try {
                  await adminsApi.resetPassword(adminId);
                  addToast({ title: "Password reset sent", type: "success" });
                } catch (err: any) {
                  addToast({ title: err.message || "Failed to reset password", type: "error" });
                }
              }
            }}><KeyRound className="h-4 w-4 mr-1.5" /> Reset Password</Button>
            <Button variant={admin.status === "active" ? "destructive" : "default"} size="sm" onClick={async () => {
              const result = await showConfirm(
                `${admin.status === "active" ? "Deactivate" : "Activate"} ${admin.fullName}?`,
                `Are you sure you want to ${admin.status === "active" ? "deactivate" : "activate"} this admin?`,
                admin.status === "active" ? "Deactivate" : "Activate",
                "Cancel"
              );
              if (result.isConfirmed) {
                try {
                  const newStatus = admin.status === "active" ? "inactive" : "active";
                  await adminsApi.updateStatus(adminId, newStatus);
                  setAdmin({ ...admin, status: newStatus });
                  addToast({ title: admin.status === "active" ? "Admin deactivated" : "Admin activated", type: "success" });
                } catch (err: any) {
                  addToast({ title: err.message || "Failed to update status", type: "error" });
                }
              }
            }}>{admin.status === "active" ? "Deactivate" : "Activate"}</Button>
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
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Email</span><p className="font-medium">{admin.email}</p></div>
                <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{admin.phone || "—"}</p></div>
                <div><span className="text-muted-foreground">Company</span><p className="font-medium">{admin.companyName}</p></div>
                <div><span className="text-muted-foreground">Role</span><p className="font-medium">{admin.role}</p></div>
                <div><span className="text-muted-foreground">2FA Status</span><p className="font-medium">{admin.twoFactorEnabled ? "Enabled" : "Disabled"}</p></div>
                <div><span className="text-muted-foreground">Last Login</span><p className="font-medium">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Never"}</p></div>
                <div><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(admin.createdAt).toLocaleDateString()}</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "permissions" && (
          <Card><CardHeader><CardTitle className="text-base">Assigned Permissions</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Full admin permissions for {admin.companyName}.</p></CardContent></Card>
        )}

        {activeTab === "sessions" && (
          <Card><CardHeader><CardTitle className="text-base">Active Sessions</CardTitle></CardHeader><CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                <div><p className="font-medium">Chrome on macOS</p><p className="text-muted-foreground">IP: 192.168.1.42</p></div>
                <Button variant="outline" size="sm">Force Logout</Button>
              </div>
            </div>
          </CardContent></Card>
        )}

        {activeTab === "audit" && (
          <Card><CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">No recent activity recorded.</p></CardContent></Card>
        )}
      </div>

    </AdminShell>
  );
}
