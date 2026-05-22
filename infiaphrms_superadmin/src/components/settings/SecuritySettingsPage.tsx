"use client";

import { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsLayout } from "./SettingsLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { Shield, Monitor, Lock, Smartphone } from "lucide-react";

export function SecuritySettingsPage() {
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const { addToast } = useToast();

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Security" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-sm text-muted-foreground">Platform security and access controls</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Two-Factor Authentication</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div><p className="text-sm font-medium">Authenticator App</p><p className="text-xs text-muted-foreground">TOTP-based 2FA</p></div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setTwoFaOpen(true)}>Setup</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Monitor className="h-4 w-4" /> Active Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
              <div><p className="font-medium">Chrome on macOS</p><p className="text-xs text-muted-foreground">IP: 192.168.1.42 · Current session</p></div>
              <Button variant="outline" size="sm">Force Logout</Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
              <div><p className="font-medium">Safari on iPhone</p><p className="text-xs text-muted-foreground">IP: 192.168.1.55</p></div>
              <Button variant="outline" size="sm">Force Logout</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Password Policy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Minimum Password Length" defaultValue="8" type="number" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Require uppercase letters</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Require numbers</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Require special characters</label>
            <Button onClick={() => addToast({ title: "Policy updated", type: "success" })}>Save Policy</Button>
          </CardContent>
        </Card>
      </div>
      <Modal isOpen={twoFaOpen} onClose={() => setTwoFaOpen(false)} title="Setup 2FA" footer={<><Button variant="outline" onClick={() => setTwoFaOpen(false)}>Cancel</Button><Button onClick={() => { setTwoFaOpen(false); addToast({ title: "2FA enabled", type: "success" }); }}>Verify & Enable</Button></>}>
        <div className="space-y-4 text-center">
          <div className="mx-auto h-40 w-40 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-xs text-muted-foreground">QR Code Placeholder</p>
          </div>
          <p className="text-sm text-muted-foreground">Scan with your authenticator app and enter the 6-digit code below.</p>
          <Input label="Verification Code" placeholder="000000" maxLength={6} />
        </div>
      </Modal>
      </SettingsLayout>
    </AdminShell>
  );
}
