"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/providers/ToastProvider";
import { rolesApi } from "@/lib/api";
import type { Role } from "@/lib/types";
import { PERMISSION_MODULES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const actions = ["View", "Create", "Edit", "Delete", "Export"];

export function RoleFormPage({ roleId }: { roleId?: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [perms, setPerms] = useState<Record<string, boolean[]>>({});

  useEffect(() => {
    if (!roleId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await rolesApi.get(roleId!).catch(() => null);
        if (!cancelled) {
          const role = (res as unknown) as Role;
          setName(role.name || "");
          setDescription(role.description || "");
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [roleId]);

  function toggleAll(module: string, enabled: boolean) {
    setPerms((p) => ({ ...p, [module]: actions.map(() => enabled) }));
  }

  function toggle(module: string, idx: number) {
    setPerms((p) => {
      const curr = p[module] || actions.map(() => false);
      const next = [...curr];
      next[idx] = !next[idx];
      return { ...p, [module]: next };
    });
  }

  async function save() {
    try {
      const payload = { name, description, permissions: perms };
      if (roleId) {
        await rolesApi.update(roleId, payload);
        addToast({ title: "Role updated", type: "success" });
      } else {
        await rolesApi.create(payload);
        addToast({ title: "Role created", type: "success" });
      }
      router.push("/roles");
    } catch (err: any) {
      addToast({ title: err.message || "Failed to save role", type: "error" });
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Roles & Permissions", href: "/roles" }, { label: roleId ? "Edit Role" : "Create Role" }]} />
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{roleId ? "Edit Role" : "Create Role"}</h1>
          <p className="text-sm text-muted-foreground">Define role name, description, and permission matrix</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input label="Role Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Permission Matrix</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {PERMISSION_MODULES.map((module) => (
              <div key={module} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{module}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleAll(module, true)}>All</Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleAll(module, false)}>None</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {actions.map((action, i) => (
                    <label key={action} className={cn("flex flex-col items-center gap-1 rounded-md border p-2 cursor-pointer transition-colors", (perms[module]?.[i]) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50")}>
                      <input type="checkbox" checked={perms[module]?.[i] || false} onChange={() => toggle(module, i)} className="h-4 w-4" />
                      <span className="text-xs">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/roles")}>Cancel</Button>
          <Button onClick={save}>Save Role</Button>
        </div>
      </div>
    </AdminShell>
  );
}
