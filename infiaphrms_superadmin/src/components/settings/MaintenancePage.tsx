"use client";

import { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsLayout } from "./SettingsLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { mockCompanies } from "@/lib/mock-data";
import { Wrench } from "lucide-react";

export function MaintenancePage() {
  const [globalOn, setGlobalOn] = useState(false);
  const { addToast } = useToast();

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Maintenance" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance Mode</h1>
          <p className="text-sm text-muted-foreground">Control platform availability</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Global Maintenance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between text-sm">
              <span>Enable global maintenance mode (affects all tenants)</span>
              <input type="checkbox" checked={globalOn} onChange={(e) => setGlobalOn(e.target.checked)} className="h-5 w-5" />
            </label>
            <div><label className="text-sm font-medium">Custom Message</label><textarea defaultValue="We are performing scheduled maintenance. Please check back soon." className="mt-1.5 w-full rounded-md border border-input bg-card px-3 py-2 text-sm min-h-[80px]" /></div>
            <Button onClick={() => addToast({ title: "Maintenance settings saved", type: "success" })}>Save Settings</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Per-Company Maintenance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCompanies.slice(0, 5).map((c) => (
                <label key={c.id} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded transition-colors">
                  <span>{c.name}</span>
                  <input type="checkbox" className="h-4 w-4" />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </SettingsLayout>
    </AdminShell>
  );
}
