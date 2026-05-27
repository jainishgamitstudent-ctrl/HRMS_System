"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { reportsApi } from "@/lib/api";
import type { AuditLogEntry } from "@/lib/types";
import { downloadCSV } from "@/lib/csv-export";
import { Download, Search } from "lucide-react";

export function AuditLogReport() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState<{ total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await reportsApi.auditLogs({ page, limit: pageSize, action: actionFilter || undefined }).catch(() => null);
        if (cancelled) return;
        setLogs(((res?.data || res) as unknown) as AuditLogEntry[]);
        setMeta(res?.meta || null);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, pageSize, actionFilter]);

  const totalPages = meta ? Math.ceil(meta.total / pageSize) : 1;
  const totalItems = meta?.total || logs.length;

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Audit Log" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
            <p className="text-sm text-muted-foreground">Complete action history across the platform</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "audit-log.csv",
            ["Timestamp", "Actor", "Action", "Resource", "Resource ID", "Company"],
            logs.map((a) => ({
              Timestamp: new Date(a.timestamp).toLocaleString(),
              Actor: a.actor,
              Action: a.action,
              Resource: a.resource,
              "Resource ID": a.resourceId,
              Company: a.companyName || "—",
            }))
          )}><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search actor or resource..." className="w-full h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm" />
          </div>
        </div>
        <FilterBar activeFilters={actionFilter ? [{ key: "action", label: "Action", value: actionFilter }] : []} onClearFilter={() => setActionFilter("")} onClearAll={() => setActionFilter("")}>
          <Input label="Action Type" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} placeholder="e.g. CREATE, UPDATE" />
        </FilterBar>
        <DataTable
          columns={[
            { key: "timestamp", header: "Timestamp", cell: (a) => new Date(a.timestamp).toLocaleString(), sortable: true },
            { key: "actor", header: "Actor", cell: (a) => a.actor, sortable: true },
            { key: "action", header: "Action", cell: (a) => <Badge variant="secondary">{a.action}</Badge> },
            { key: "resource", header: "Resource", cell: (a) => `${a.resource} (${a.resourceId})` },
            { key: "company", header: "Company", cell: (a) => a.companyName || "—" },
          ]}
          data={logs}
          keyExtractor={(a) => a.id}
          emptyState={<EmptyState title="No audit entries" description="No actions match your filters." />}
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} totalItems={totalItems} />
      </div>
    </AdminShell>
  );
}
