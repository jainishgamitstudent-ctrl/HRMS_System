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
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/providers/ToastProvider";
import { mockHRUsers, mockCompanies } from "@/lib/mock-data";
import { USER_STATUSES } from "@/lib/constants";
import { Users, Plus, Search, Eye } from "lucide-react";

export function HRUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    return mockHRUsers.filter((h) => {
      const matchesSearch = !search || h.fullName.toLowerCase().includes(search.toLowerCase()) || h.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || h.status === statusFilter;
      const matchesCompany = !companyFilter || h.companyId === companyFilter;
      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [search, statusFilter, companyFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const activeFilters = [
    ...(statusFilter ? [{ key: "status", label: "Status", value: statusFilter }] : []),
    ...(companyFilter ? [{ key: "company", label: "Company", value: mockCompanies.find(c => c.id === companyFilter)?.name || companyFilter }] : []),
  ];

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "HR User Management" }]} />
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HR User Management</h1>
            <p className="text-sm text-muted-foreground">Provision and manage HR staff across companies</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Add HR User</Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="w-full h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm" />
          </div>
        </div>
        <FilterBar activeFilters={activeFilters} onClearFilter={(key) => { key === "status" ? setStatusFilter("") : setCompanyFilter(""); }} onClearAll={() => { setStatusFilter(""); setCompanyFilter(""); }}>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All" }, ...USER_STATUSES.map(s => ({ value: s.value, label: s.label }))]} />
          <Select label="Company" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} options={[{ value: "", label: "All" }, ...mockCompanies.map(c => ({ value: c.id, label: c.name }))]} />
        </FilterBar>
        <DataTable
          columns={[
            { key: "name", header: "Name", cell: (h) => <Link href={`/hr-users/${h.id}`} className="font-medium hover:underline">{h.fullName}</Link>, sortable: true },
            { key: "email", header: "Email", cell: (h) => h.email, sortable: true },
            { key: "company", header: "Company", cell: (h) => h.companyName, sortable: true },
            { key: "status", header: "Status", cell: (h) => <Badge variant={h.status === "active" ? "success" : "secondary"}>{h.status}</Badge> },
            { key: "modules", header: "Modules", cell: (h) => h.assignedModules.slice(0, 2).join(", ") + (h.assignedModules.length > 2 ? "..." : "") },
            { key: "lastLogin", header: "Last Login", cell: (h) => h.lastLogin ? new Date(h.lastLogin).toLocaleDateString() : "Never", sortable: true },
            { key: "actions", header: "", cell: (h) => <Link href={`/hr-users/${h.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>, className: "w-12" },
          ]}
          data={paginated}
          keyExtractor={(h) => h.id}
          emptyState={<EmptyState title="No HR users found" description="Try adjusting your search or filters." action={<Button onClick={() => setAddModalOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Add HR User</Button>} />}
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} totalItems={filtered.length} />
      </motion.div>
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add HR User" description="Add a new HR user to a company." footer={<><Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button><Button onClick={() => { setAddModalOpen(false); addToast({ title: "HR user added", type: "success" }); }}>Add User</Button></>}>
        <div className="space-y-4">
          <Input label="Full Name" required />
          <Input label="Email" type="email" required />
          <Select label="Company" options={mockCompanies.map(c => ({ value: c.id, label: c.name }))} required />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Send invitation email</label>
        </div>
      </Modal>
    </AdminShell>
  );
}
