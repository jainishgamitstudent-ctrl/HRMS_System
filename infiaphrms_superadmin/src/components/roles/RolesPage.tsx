"use client";

import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/providers/ToastProvider";
import { showDeleteConfirm } from "@/lib/sweetalert";
import { rolesApi } from "@/lib/api";
import type { Role } from "@/lib/types";
import { KeyRound, Plus, Users, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await rolesApi.list().catch(() => []);
        if (!cancelled) setRoles((res as unknown) as Role[]);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  async function handleDelete(role: Role) {
    const result = await showDeleteConfirm(role.name, "Delete", "Cancel");
    if (result.isConfirmed) {
      try {
        await rolesApi.remove(role.id);
        addToast({ title: "Role deleted", type: "success" });
        setRoles((prev) => prev.filter((r) => r.id !== role.id));
      } catch (err: any) {
        addToast({ title: err.message || "Failed to delete role", type: "error" });
      }
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Roles & Permissions" }]} />
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-sm text-muted-foreground">Fine-grained RBAC across all roles</p>
          </div>
          <Link href="/roles/new">
            <Button><Plus className="h-4 w-4 mr-1.5" /> Create Role</Button>
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">System Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemRoles.map((r) => (
              <Card key={r.id} className="opacity-80">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                    <p className="font-semibold capitalize">{r.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" /> {r.userCount} users
                  </div>
                  <Badge variant="secondary" className="mt-2">System</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Custom Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map((r) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                      <p className="font-semibold">{r.name}</p>
                    </div>
                    <Badge variant="info">{r.userCount} users</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <Link href={`/roles/${r.id}`}><Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5 mr-1" /> Edit</Button></Link>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(r)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>

    </AdminShell>
  );
}
