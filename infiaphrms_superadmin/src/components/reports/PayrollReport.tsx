"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { mockCompanies } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { downloadCSV } from "@/lib/csv-export";
import { IndianRupee, BarChart3, Landmark, Download } from "lucide-react";

export function PayrollReport() {
  const totalPayroll = mockCompanies.reduce((s, c) => s + c.employeeCount * 3500, 0);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Payroll Summary" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payroll Summary</h1>
            <p className="text-sm text-muted-foreground">Estimated payroll across all companies</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "payroll.csv",
            ["Company", "Employees", "Est. Payroll"],
            mockCompanies.slice(0, 8).map((c) => ({
              Company: c.name,
              Employees: c.employeeCount,
              "Est. Payroll": `₹${(c.employeeCount * 3500).toLocaleString()}`,
            }))
          )}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><IndianRupee className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total Monthly Payroll</p><p className="text-2xl font-bold">₹{(totalPayroll / 1e6).toFixed(1)}M</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Avg per Employee</p><p className="text-2xl font-bold">₹3,500</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Landmark className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Companies with Payroll</p><p className="text-2xl font-bold">{mockCompanies.filter(c => c.modules.payroll).length}</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Payroll by Company</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Employees</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Est. Payroll</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {mockCompanies.slice(0, 8).map((c) => (
                    <tr key={c.id}><td className="px-3 py-2.5 font-medium">{c.name}</td><td className="px-3 py-2.5 text-right">{c.employeeCount}</td><td className="px-3 py-2.5 text-right">₹{(c.employeeCount * 3500).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
