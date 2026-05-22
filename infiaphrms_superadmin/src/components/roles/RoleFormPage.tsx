"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/providers/ToastProvider";
import { getRoleById } from "@/lib/mock-data";
import { PERMISSION_MODULES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const actions = ["View", "Create", "Edit", "Delete", "Export"];

export function RoleFormPage({ roleId }: { roleId?: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const existing = roleId ? getRoleById(roleId) : null;
  const [name, setName] = useState(existing?.name || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [perms, setPerms] = useState<Record<string, boolean[]>>({});

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

  function save() {
    addToast({ title: roleId ? "Role updated" : "Role created", type: "success" });
    router.push("/roles");
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
