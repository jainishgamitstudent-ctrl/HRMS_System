"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsLayout } from "./SettingsLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { Bell } from "lucide-react";

const events = [
  { id: "signup", label: "New Company Signup" },
  { id: "expiry", label: "Plan Expiry Warning" },
  { id: "anomaly", label: "Login Anomaly Detected" },
  { id: "alert", label: "System Alert" },
];

export function NotificationSettingsPage() {
  const { addToast } = useToast();

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Notifications" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Preferences</h1>
          <p className="text-sm text-muted-foreground">Configure how you receive platform alerts</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Event Notifications</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">Event</th><th className="px-3 py-2 text-center font-medium text-muted-foreground">Email</th><th className="px-3 py-2 text-center font-medium text-muted-foreground">In-App</th><th className="px-3 py-2 text-center font-medium text-muted-foreground">SMS</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {events.map((e) => (
                    <tr key={e.id}>
                      <td className="px-3 py-3">{e.label}</td>
                      <td className="px-3 py-3 text-center"><input type="checkbox" defaultChecked className="h-4 w-4" /></td>
                      <td className="px-3 py-3 text-center"><input type="checkbox" defaultChecked className="h-4 w-4" /></td>
                      <td className="px-3 py-3 text-center"><input type="checkbox" className="h-4 w-4" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button className="mt-4" onClick={() => addToast({ title: "Preferences saved", type: "success" })}>Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
      </SettingsLayout>
    </AdminShell>
  );
}
