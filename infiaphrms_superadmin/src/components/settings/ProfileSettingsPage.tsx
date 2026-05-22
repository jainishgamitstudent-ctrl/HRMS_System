"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { showSuccess } from "@/lib/sweetalert";
import { SettingsLayout } from "./SettingsLayout";
import { User } from "lucide-react";

export function ProfileSettingsPage() {
  const { addToast } = useToast();

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Profile" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your SuperAdmin account details</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">SA</div>
              <Button variant="outline" size="sm">Change Avatar</Button>
            </div>
            <Input label="Full Name" defaultValue="Super Admin" required />
            <Input label="Email" type="email" defaultValue="superadmin@infiap.com" required />
            <Input label="Phone" defaultValue="+1-555-0100" />
            <Button onClick={async () => { addToast({ title: "Profile updated", type: "success" }); await showSuccess("Profile Updated", "Your profile information has been saved."); }}>Save Changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Current Password" type="password" required />
            <Input label="New Password" type="password" required />
            <Input label="Confirm New Password" type="password" required />
            <Button variant="secondary" onClick={async () => { addToast({ title: "Password updated", type: "success" }); await showSuccess("Password Updated", "Your password has been changed successfully."); }}>Update Password</Button>
          </CardContent>
        </Card>
      </div>
      </SettingsLayout>
    </AdminShell>
  );
}
