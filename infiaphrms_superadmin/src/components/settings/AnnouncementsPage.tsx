"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsLayout } from "./SettingsLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { settingsApi, companiesApi } from "@/lib/api";
import type { Company, Announcement } from "@/lib/types";
import { Megaphone, Plus } from "lucide-react";

export function AnnouncementsPage() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [annRes, compRes] = await Promise.all([
          settingsApi.listAnnouncements().catch(() => []),
          companiesApi.list({ limit: 100 }).catch(() => null),
        ]);
        if (cancelled) return;
        setAnnouncements((annRes as unknown) as Announcement[]);
        setCompanies(((compRes?.companies || []) as unknown) as Company[]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Announcements" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcement Center</h1>
            <p className="text-sm text-muted-foreground">Broadcast messages to all or select tenants</p>
          </div>
          <Button onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Compose</Button>
        </div>
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{a.title}</p>
                      <Badge variant={a.status === "sent" ? "success" : "info"}>{a.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">Channel: {(a.channel || []).join(", ")} · Target: {typeof a.target === "string" ? a.target : (a.target || []).length + " companies"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </SettingsLayout>
      <Modal isOpen={composeOpen} onClose={() => setComposeOpen(false)} title="Compose Announcement" size="lg" footer={<><Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button><Button onClick={async () => {
        try {
          await settingsApi.createAnnouncement({ title: "New announcement", message: "...", target: "all", channel: ["in-app"] });
          setComposeOpen(false);
          addToast({ title: "Announcement sent", type: "success" });
        } catch (err: any) {
          addToast({ title: err.message || "Failed to send announcement", type: "error" });
        }
      }}>Send</Button></>}>
        <div className="space-y-4">
          <Input label="Title" required />
          <div><label className="text-sm font-medium">Message</label><textarea className="mt-1.5 w-full rounded-md border border-input bg-card px-3 py-2 text-sm min-h-[100px]" required /></div>
          <div><label className="text-sm font-medium">Target</label><select className="mt-1.5 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"><option value="all">All Companies</option>{companies.slice(0, 5).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="h-4 w-4" /> In-app banner</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> Email</label>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
