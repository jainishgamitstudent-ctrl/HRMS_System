"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { reportsApi } from "@/lib/api";
import type { LoginActivity } from "@/lib/types";
import { downloadCSV } from "@/lib/csv-export";
import { Button } from "@/components/ui/Button";
import { Search, Download } from "lucide-react";

export function LoginActivityReport() {
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState<LoginActivity[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await reportsApi.logins().catch(() => null);
        if (!cancelled) setActivities(((res?.data || res) as unknown) as LoginActivity[]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Login Activity" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Login Activity</h1>
            <p className="text-sm text-muted-foreground">Authentication events and suspicious activity flags</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "login-activity.csv",
            ["Timestamp", "User", "Company", "IP Address", "Status"],
            activities.map((l) => ({
              Timestamp: new Date(l.timestamp).toLocaleString(),
              User: l.userName,
              Company: l.companyName,
              "IP Address": l.ip,
              Status: l.status,
            }))
          )}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user or IP..." className="w-full max-w-md h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm" />
        </div>
        <DataTable
          columns={[
            { key: "timestamp", header: "Timestamp", cell: (l) => new Date(l.timestamp).toLocaleString() },
            { key: "user", header: "User", cell: (l) => l.userName },
            { key: "company", header: "Company", cell: (l) => l.companyName },
            { key: "ip", header: "IP Address", cell: (l) => l.ip },
            { key: "status", header: "Status", cell: (l) => <Badge variant={l.status === "success" ? "success" : l.status === "failed" ? "warning" : "error"}>{l.status}</Badge> },
          ]}
          data={activities}
          keyExtractor={(l) => l.id}
          emptyState={<EmptyState title="No login activity" description="No events match your search." />}
        />
      </div>
    </AdminShell>
  );
}
