"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { mockCompanies } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { downloadCSV } from "@/lib/csv-export";
import { Users, TrendingUp, Building2, Download } from "lucide-react";

export function EmployeeTrendsReport() {
  const total = mockCompanies.reduce((s, c) => s + c.employeeCount, 0);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Employee Trends" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Trends</h1>
            <p className="text-sm text-muted-foreground">Headcount growth and distribution</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "employee-trends.csv",
            ["Company Size", "Count"],
            ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((size) => ({
              "Company Size": size,
              Count: mockCompanies.filter((c) => c.size === size).length,
            }))
          )}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total Employees</p><p className="text-2xl font-bold">{total.toLocaleString()}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Avg per Company</p><p className="text-2xl font-bold">{Math.round(total / mockCompanies.length)}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-green-500" /><div><p className="text-sm text-muted-foreground">Growth</p><p className="text-2xl font-bold">+12%</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Headcount by Company Size</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((size) => {
                const count = mockCompanies.filter((c) => c.size === size).length;
                return (
                  <div key={size} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-muted-foreground">{size}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(count / mockCompanies.length) * 100}%` }} />
                    </div>
                    <span className="w-8 text-sm font-medium text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
