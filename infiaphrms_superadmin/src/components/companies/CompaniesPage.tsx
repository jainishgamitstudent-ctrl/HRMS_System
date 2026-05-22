"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/providers/ToastProvider";
import { mockCompanies } from "@/lib/mock-data";
import { COMPANY_STATUSES, PLANS } from "@/lib/constants";
import { showConfirm, showDeleteConfirm } from "@/lib/sweetalert";
import { downloadCSV } from "@/lib/csv-export";
import { Plus, Search, Download, Pause, Play, Trash2, Eye } from "lucide-react";

export function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    return mockCompanies.filter((c) => {
      const matchesSearch =
        !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesPlan = !planFilter || c.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [search, statusFilter, planFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const activeFilters = [
    ...(statusFilter ? [{ key: "status", label: "Status", value: statusFilter }] : []),
    ...(planFilter ? [{ key: "plan", label: "Plan", value: planFilter }] : []),
  ];

  function handleSelect(id: string, selected: boolean) {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function handleSelectAll(selected: boolean) {
    setSelectedIds(selected ? paginated.map((c) => c.id) : []);
  }

  async function openSuspend(id: string) {
    const company = mockCompanies.find((c) => c.id === id);
    if (!company) return;
    const result = await showConfirm(
      `Suspend ${company.name}?`,
      "All users will be locked out until reactivated.",
      "Suspend",
      "Cancel"
    );
    if (result.isConfirmed) {
      addToast({ title: "Company suspended", type: "success" });
    }
  }

  async function openDelete(id: string) {
    const company = mockCompanies.find((c) => c.id === id);
    if (!company) return;
    const result = await showDeleteConfirm(company.name);
    if (result.isConfirmed) {
      addToast({ title: "Company deleted", type: "success" });
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Companies" }]} />
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Company Management</h1>
            <p className="text-sm text-muted-foreground">Manage all tenant companies on the platform</p>
          </div>
          <Link href="/companies/new">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" /> Create Company
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search companies..."
              className="w-full h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "companies.csv",
            ["ID", "Name", "Industry", "Size", "Plan", "Status", "Employees", "Country", "Created"],
            filtered.map((c) => ({
              ID: c.id,
              Name: c.name,
              Industry: c.industry,
              Size: c.size,
              Plan: c.plan,
              Status: c.status,
              Employees: c.employeeCount,
              Country: c.country,
              Created: new Date(c.createdAt).toLocaleDateString(),
            }))
          )}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
        </div>

        <FilterBar
          activeFilters={activeFilters}
          onClearFilter={(key) => { key === "status" ? setStatusFilter("") : setPlanFilter(""); }}
          onClearAll={() => { setStatusFilter(""); setPlanFilter(""); }}
        >
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All" }, ...COMPANY_STATUSES.map(s => ({ value: s.value, label: s.label }))]} />
          <Select label="Plan" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} options={[{ value: "", label: "All" }, ...PLANS.map(p => ({ value: p, label: p }))]} />
        </FilterBar>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm">
            <span className="font-medium">{selectedIds.length} selected</span>
            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>Clear</Button>
            <Button variant="outline" size="sm"><Pause className="h-3.5 w-3.5 mr-1" /> Suspend</Button>
            <Button variant="outline" size="sm"><Play className="h-3.5 w-3.5 mr-1" /> Activate</Button>
          </div>
        )}

        <DataTable
          columns={[
            { key: "name", header: "Company", cell: (c) => <Link href={`/companies/${c.id}`} className="font-medium hover:underline">{c.name}</Link>, sortable: true },
            { key: "industry", header: "Industry", cell: (c) => c.industry, sortable: true },
            { key: "size", header: "Size", cell: (c) => c.size, sortable: true },
            { key: "plan", header: "Plan", cell: (c) => <Badge variant={c.plan === "Enterprise" ? "info" : c.plan === "Pro" ? "success" : "secondary"}>{c.plan}</Badge> },
            { key: "status", header: "Status", cell: (c) => <Badge variant={c.status === "active" ? "success" : c.status === "trial" ? "info" : c.status === "suspended" ? "warning" : "secondary"}>{c.status}</Badge> },
            { key: "employees", header: "Employees", cell: (c) => c.employeeCount.toLocaleString(), sortable: true },
            { key: "created", header: "Created", cell: (c) => new Date(c.createdAt).toLocaleDateString(), sortable: true },
            { key: "actions", header: "", cell: (c) => (
              <div className="flex items-center gap-1">
                <Link href={`/companies/${c.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                <Button variant="ghost" size="sm" onClick={() => openSuspend(c.id)}><Pause className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => openDelete(c.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            ), className: "w-32" },
          ]}
          data={paginated}
          keyExtractor={(c) => c.id}
          selectable
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          emptyState={<EmptyState title="No companies found" description="Try adjusting your search or filters." action={<Link href="/companies/new"><Button><Plus className="h-4 w-4 mr-1.5" /> Create Company</Button></Link>} />}
        />

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} totalItems={filtered.length} />
      </motion.div>

    </AdminShell>
  );
}
