"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { reportsApi, companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";
import { downloadCSV } from "@/lib/csv-export";
import { Download, TrendingUp, Users, Building2, Percent } from "lucide-react";

export function PlatformOverviewReport() {
  const [dateRange, setDateRange] = useState("30d");
  const [overview, setOverview] = useState<Record<string, unknown>>({});
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ov, compRes] = await Promise.all([
          reportsApi.overview().catch(() => null),
          companiesApi.list({ limit: 10 }).catch(() => null),
        ]);
        if (cancelled) return;
        if (ov) setOverview(ov);
        setCompanies(((compRes?.companies || []) as unknown) as Company[]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dateRange]);

  const totalEmployees = (overview.total_employees as number) || companies.reduce((s, c) => s + (c.employeeCount || 0), 0);
  const avgHeadcount = companies.length ? Math.round(totalEmployees / companies.length) : 0;
  const churnRate = (overview.churn_rate as number) || 2.4;

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Reports", href: "/reports" }, { label: "Platform Overview" }]} />
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
            <p className="text-sm text-muted-foreground">High-level platform metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => downloadCSV(
              "platform-overview.csv",
              ["Company", "Employees", "Plan", "Status"],
              companies.map((c) => ({
                Company: c.name,
                Employees: c.employeeCount || 0,
                Plan: c.plan,
                Status: c.status,
              }))
            )}><Download className="h-4 w-4 mr-1.5" /> Export</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total Employees</p><p className="text-2xl font-bold">{totalEmployees.toLocaleString()}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Building2 className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Avg Headcount</p><p className="text-2xl font-bold">{avgHeadcount}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Percent className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Churn Rate</p><p className="text-2xl font-bold">{churnRate}%</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Company Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th><th className="px-3 py-2 text-left font-medium text-muted-foreground">Employees</th><th className="px-3 py-2 text-left font-medium text-muted-foreground">Plan</th><th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{c.name}</td>
                      <td className="px-3 py-2.5">{c.employeeCount || 0}</td>
                      <td className="px-3 py-2.5"><Badge variant={c.plan === "Enterprise" ? "info" : c.plan === "Pro" ? "success" : "secondary"}>{c.plan}</Badge></td>
                      <td className="px-3 py-2.5"><Badge variant={c.status === "active" ? "success" : "secondary"}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminShell>
  );
}
