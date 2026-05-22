"use client";

import { useState, useMemo } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mockAuditLogs } from "@/lib/mock-data";
import { downloadCSV } from "@/lib/csv-export";
import { Download, Search } from "lucide-react";

export function AuditLogReport() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    return mockAuditLogs.filter((a) => {
      const matchesSearch = !search || a.actor.toLowerCase().includes(search.toLowerCase()) || a.resource.toLowerCase().includes(search.toLowerCase());
      const matchesAction = !actionFilter || a.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [search, actionFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const actions = Array.from(new Set(mockAuditLogs.map((a) => a.action)));

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
            filtered.map((a) => ({
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
          data={paginated}
          keyExtractor={(a) => a.id}
          emptyState={<EmptyState title="No audit entries" description="No actions match your filters." />}
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} totalItems={filtered.length} />
      </div>
    </AdminShell>
  );
}
