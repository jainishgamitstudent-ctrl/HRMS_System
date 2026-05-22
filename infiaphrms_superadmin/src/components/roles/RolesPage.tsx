"use client";

import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/providers/ToastProvider";
import { showDeleteConfirm } from "@/lib/sweetalert";
import { mockRoles } from "@/lib/mock-data";
import { KeyRound, Plus, Users, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function RolesPage() {
  const { addToast } = useToast();

  const systemRoles = mockRoles.filter((r) => r.isSystem);
  const customRoles = mockRoles.filter((r) => !r.isSystem);

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
                    <Button variant="outline" size="sm" onClick={async () => {
                      const result = await showDeleteConfirm(r.name, "Delete", "Cancel");
                      if (result.isConfirmed) addToast({ title: "Role deleted", type: "success" });
                    }}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
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
