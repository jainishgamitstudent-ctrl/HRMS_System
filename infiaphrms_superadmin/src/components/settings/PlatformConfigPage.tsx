"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsLayout } from "./SettingsLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/providers/ToastProvider";
import { showSuccess } from "@/lib/sweetalert";
import { TIMEZONES, CURRENCIES } from "@/lib/constants";
import { Settings } from "lucide-react";

export function PlatformConfigPage() {
  const { addToast } = useToast();

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Platform Config" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Configuration</h1>
          <p className="text-sm text-muted-foreground">Global platform settings and feature flags</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select label="Default Timezone" options={TIMEZONES.map(t => ({ value: t, label: t }))} defaultValue="UTC" />
            <div>
              <label className="text-sm font-medium">Supported Currencies</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CURRENCIES.map((c) => (
                  <label key={c} className="flex items-center gap-1.5 text-sm border border-border rounded-md px-3 py-1.5 bg-card">
                    <input type="checkbox" defaultChecked className="h-4 w-4" /> {c}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Feature Flags</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {["Custom Integrations", "Advanced Analytics", "White-label Mode", "SSO Login", "API Access"].map((flag) => (
              <label key={flag} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded transition-colors">
                <span>{flag}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </label>
            ))}
            <Button className="mt-2" onClick={async () => { addToast({ title: "Config saved", type: "success" }); await showSuccess("Configuration Saved", "Your platform settings have been updated successfully."); }}>Save Configuration</Button>
          </CardContent>
        </Card>
      </div>
      </SettingsLayout>
    </AdminShell>
  );
}
