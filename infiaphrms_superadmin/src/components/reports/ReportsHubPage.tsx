"use client";

import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { REPORT_TYPES } from "@/lib/constants";
import { BarChart3, FileText } from "lucide-react";

export function ReportsHubPage() {
  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports & Analytics" }]} />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Cross-company data insights and exports</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map((report) => {
            const Icon = report.id === "audit-log" ? FileText : BarChart3;
            return (
              <Link key={report.id} href={report.href}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.label}</CardTitle>
                        <CardDescription className="mt-1">View and export {report.label.toLowerCase()} data</CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
