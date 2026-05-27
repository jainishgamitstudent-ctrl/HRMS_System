"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { billingApi, companiesApi } from "@/lib/api";
import type { Invoice, Company } from "@/lib/types";
import { Search, Download } from "lucide-react";
import { downloadCSV } from "@/lib/csv-export";

export function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<{ total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [invRes, compRes] = await Promise.all([
          billingApi.listInvoices({ page, limit: pageSize, status: statusFilter || undefined, company_id: companyFilter || undefined }).catch(() => null),
          companiesApi.list({ limit: 1000 }).catch(() => null),
        ]);
        if (cancelled) return;
        setInvoices(((invRes?.data || invRes) as unknown) as Invoice[]);
        setMeta(invRes?.meta || null);
        setCompanies(((compRes?.companies || []) as unknown) as Company[]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, pageSize, statusFilter, companyFilter]);

  const totalPages = meta ? Math.ceil(meta.total / pageSize) : 1;
  const totalItems = meta?.total || invoices.length;

  const activeFilters = [
    ...(statusFilter ? [{ key: "status", label: "Status", value: statusFilter }] : []),
    ...(companyFilter ? [{ key: "company", label: "Company", value: companies.find(c => c.id === companyFilter)?.name || companyFilter }] : []),
  ];

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Billing", href: "/billing" }, { label: "Invoices" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice Management</h1>
            <p className="text-sm text-muted-foreground">View and manage all invoices across companies</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "invoices.csv",
            ["Invoice ID", "Company", "Amount", "Status", "Date", "Due Date"],
            invoices.map((i) => ({
              "Invoice ID": i.id.toUpperCase(),
              Company: i.companyName,
              Amount: `₹${i.amount}`,
              Status: i.status,
              Date: new Date(i.date).toLocaleDateString(),
              "Due Date": new Date(new Date(i.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            }))
          )}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search invoice #..." className="w-full h-9 rounded-md border border-input bg-card pl-9 pr-3 text-sm" />
          </div>
        </div>
        <FilterBar activeFilters={activeFilters} onClearFilter={(key) => { key === "status" ? setStatusFilter("") : setCompanyFilter(""); }} onClearAll={() => { setStatusFilter(""); setCompanyFilter(""); }}>
          <Input label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} placeholder="e.g. paid, overdue" />
          <Input label="Company ID" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} placeholder="Filter by company" />
        </FilterBar>
        <DataTable
          columns={[
            { key: "invoice", header: "Invoice #", cell: (i) => <Link href={`/billing/invoices/${i.id}`} className="font-medium hover:underline">{i.id.toUpperCase()}</Link>, sortable: true },
            { key: "company", header: "Company", cell: (i) => i.companyName, sortable: true },
            { key: "amount", header: "Amount", cell: (i) => `₹${i.amount}`, sortable: true },
            { key: "status", header: "Status", cell: (i) => <Badge variant={i.status === "paid" ? "success" : i.status === "overdue" ? "error" : "warning"}>{i.status}</Badge> },
            { key: "issued", header: "Issued", cell: (i) => new Date(i.date).toLocaleDateString(), sortable: true },
            { key: "due", header: "Due Date", cell: (i) => new Date(new Date(i.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), sortable: true },
          ]}
          data={invoices}
          keyExtractor={(i) => i.id}
          emptyState={<EmptyState title="No invoices found" description="No invoices match your filters." />}
        />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} totalItems={totalItems} />
      </div>
    </AdminShell>
  );
}
