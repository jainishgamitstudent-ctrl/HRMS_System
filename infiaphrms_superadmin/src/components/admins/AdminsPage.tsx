"use client";

import { useState, useEffect } from "react";
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
import { adminsApi, companiesApi } from "@/lib/api";
import type { Admin, Company } from "@/lib/types";
import { USER_STATUSES } from "@/lib/constants";
import { ShieldCheck, Plus, Search, KeyRound, Eye } from "lucide-react";

export function AdminsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<{ total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [adminsRes, companiesRes] = await Promise.all([
          adminsApi.list({ page, limit: pageSize, status: statusFilter || undefined, company_id: companyFilter || undefined }).catch(() => null),
          companiesApi.list({ limit: 1000 }).catch(() => null),
        ]);
        if (cancelled) return;
        const adminsList = Array.isArray(adminsRes?.data) ? adminsRes.data : Array.isArray(adminsRes) ? adminsRes : [];
        setAdmins(adminsList as unknown as Admin[]);
        setMeta(adminsRes?.meta || null);
        setCompanies(((companiesRes?.companies || []) as unknown) as Company[]);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, pageSize, search, statusFilter, companyFilter]);

  const totalPages = meta ? Math.ceil(meta.total / pageSize) : 1;
  const totalItems = meta?.total || admins.length;

  const activeFilters = [
    ...(statusFilter ? [{ key: "status", label: "Status", value: statusFilter }] : []),
    ...(companyFilter ? [{ key: "company", label: "Company", value: companies.find(c => c.id === companyFilter)?.name || companyFilter }] : []),
  ];

  async function handleResetPassword(id: string) {
    try {
      await adminsApi.resetPassword(id);
      addToast({ title: "Password reset sent", type: "success" });
    } catch (err: any) {
      addToast({ title: err.message || "Failed to reset password", type: "error" });
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Admin Management" }]} />
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
            <p className="text-sm text-muted-foreground">Provision and manage company-level admins</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Add Admin</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." className="w-full h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm" />
          </div>
        </div>

        <FilterBar activeFilters={activeFilters} onClearFilter={(key) => { key === "status" ? setStatusFilter("") : setCompanyFilter(""); }} onClearAll={() => { setStatusFilter(""); setCompanyFilter(""); }}>
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{ value: "", label: "All" }, ...USER_STATUSES.map(s => ({ value: s.value, label: s.label }))]} />
          <Select label="Company" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} options={[{ value: "", label: "All" }, ...companies.map(c => ({ value: c.id, label: c.name }))]} />
        </FilterBar>

        <DataTable
          columns={[
            { key: "name", header: "Name", cell: (a) => <Link href={`/admins/${a.id}`} className="font-medium hover:underline">{a.fullName}</Link>, sortable: true },
            { key: "email", header: "Email", cell: (a) => a.email, sortable: true },
            { key: "company", header: "Company", cell: (a) => a.companyName, sortable: true },
            { key: "status", header: "Status", cell: (a) => <Badge variant={a.status === "active" ? "success" : "secondary"}>{a.status}</Badge> },
            { key: "lastLogin", header: "Last Login", cell: (a) => a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never", sortable: true },
            { key: "actions", header: "", cell: (a) => (
              <div className="flex items-center gap-1">
                <Link href={`/admins/${a.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                <Button variant="ghost" size="sm" onClick={() => handleResetPassword(a.id)}><KeyRound className="h-4 w-4" /></Button>
              </div>
            ), className: "w-24" },
          ]}
          data={admins}
          keyExtractor={(a) => a.id}
          emptyState={<EmptyState title="No admins found" description="Try adjusting your search or filters." action={<Button onClick={() => setAddModalOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Add Admin</Button>} />}
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} totalItems={totalItems} />
      </motion.div>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Admin" description="Invite a new admin to a company." footer={<><Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button><Button onClick={() => { setAddModalOpen(false); addToast({ title: "Admin invited", type: "success" }); }}>Send Invite</Button></>}>
        <div className="space-y-4">
          <Input label="Full Name" required />
          <Input label="Email" type="email" required />
          <Select label="Company" options={companies.map(c => ({ value: c.id, label: c.name }))} required />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Send invitation email</label>
        </div>
      </Modal>
    </AdminShell>
  );
}
