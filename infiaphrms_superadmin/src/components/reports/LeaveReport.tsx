"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { mockCompanies } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { downloadCSV } from "@/lib/csv-export";
import { Palmtree, CalendarX, CheckCircle2, Download } from "lucide-react";

export function LeaveReport() {
  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Leave Analytics" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leave Analytics</h1>
            <p className="text-sm text-muted-foreground">Platform-wide leave usage patterns</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV(
            "leave-analytics.csv",
            ["Leave Type", "Count", "Percentage"],
            ["Annual Leave", "Sick Leave", "Casual Leave", "Maternity/Paternity", "Unpaid Leave"].map((type, i) => ({
              "Leave Type": type,
              Count: [382, 210, 128, 85, 37][i],
              Percentage: `${[45, 25, 15, 10, 5][i]}%`,
            }))
          )}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Palmtree className="h-5 w-5 text-green-500" /><div><p className="text-sm text-muted-foreground">Approved</p><p className="text-2xl font-bold">842</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CalendarX className="h-5 w-5 text-yellow-500" /><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">127</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500" /><div><p className="text-sm text-muted-foreground">Avg Days/Employee</p><p className="text-2xl font-bold">14.2</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Top Leave Types</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Annual Leave", "Sick Leave", "Casual Leave", "Maternity/Paternity", "Unpaid Leave"].map((type, i) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-40 text-sm">{type}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${[45, 25, 15, 10, 5][i]}%` }} />
                  </div>
                  <Badge variant="secondary">{[382, 210, 128, 85, 37][i]}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
