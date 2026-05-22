"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { mockCompanies } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { downloadCSV } from "@/lib/csv-export";
import { Activity, TrendingUp, AlertTriangle, Download } from "lucide-react";

export function CompanyHealthReport() {
  const companies = mockCompanies.slice(0, 10);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Company Health" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Company Health</h1>
            <p className="text-sm text-muted-foreground">Activity and engagement metrics per company</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "company-health.csv",
            ["Company", "Status", "Employees", "MRR", "Modules Active"],
            companies.map((c) => ({
              Company: c.name,
              Status: c.status,
              Employees: c.employeeCount,
              MRR: `₹${c.mrr}`,
              "Modules Active": Object.entries(c.modules).filter(([, v]) => v).length,
            }))
          )}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Activity className="h-5 w-5 text-green-500" /><div><p className="text-sm text-muted-foreground">Healthy</p><p className="text-2xl font-bold">{mockCompanies.filter(c => c.status === "active").length}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-yellow-500" /><div><p className="text-sm text-muted-foreground">At Risk</p><p className="text-2xl font-bold">{mockCompanies.filter(c => c.status === "suspended").length}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-blue-500" /><div><p className="text-sm text-muted-foreground">Trials</p><p className="text-2xl font-bold">{mockCompanies.filter(c => c.status === "trial").length}</p></div></div></CardContent></Card>
        </div>
        <DataTable
          columns={[
            { key: "name", header: "Company", cell: (c) => c.name, sortable: true },
            { key: "status", header: "Status", cell: (c) => <Badge variant={c.status === "active" ? "success" : c.status === "trial" ? "info" : "warning"}>{c.status}</Badge> },
            { key: "employees", header: "Employees", cell: (c) => c.employeeCount, sortable: true },
            { key: "mrr", header: "MRR", cell: (c) => `₹${c.mrr}`, sortable: true },
            { key: "modules", header: "Modules Active", cell: (c) => Object.entries(c.modules).filter(([, v]) => v).length },
          ]}
          data={companies}
          keyExtractor={(c) => c.id}
          emptyState={<EmptyState title="No data" description="No company health data available." />}
        />
      </div>
    </AdminShell>
  );
}
