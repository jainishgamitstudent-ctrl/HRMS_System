"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { billingApi } from "@/lib/api";
import type { Invoice } from "@/lib/types";
import { IndianRupee, TrendingUp, FileText, CalendarDays, ArrowRight } from "lucide-react";

export function BillingDashboardPage() {
  const [mrr, setMrr] = useState(0);
  const [arr, setArr] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dash, invoicesRes, plansRes] = await Promise.all([
          billingApi.dashboard().catch(() => null),
          billingApi.listInvoices({ limit: 5 }).catch(() => null),
          billingApi.listPlans().catch(() => []),
        ]);
        if (cancelled) return;
        if (dash) {
          setMrr((dash.mrr as number) || 0);
          setArr((dash.arr as number) || 0);
        }
        setRecentInvoices(((invoicesRes?.data || invoicesRes) as unknown) as Invoice[]);
        const planCounts: Record<string, number> = {};
        ((plansRes as unknown) as Record<string, unknown>[]).forEach((p: any) => { planCounts[p.name || p.id] = (planCounts[p.name || p.id] || 0) + 1; });
        setPlans(planCounts);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Billing & Subscriptions" }]} />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Financial overview and subscription management</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><IndianRupee className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total MRR</p><p className="text-2xl font-bold">₹{mrr.toLocaleString()}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total Revenue (ARR)</p><p className="text-2xl font-bold">₹{arr.toLocaleString()}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Active Paid Companies</p><p className="text-2xl font-bold">{Object.values(plans).reduce((a, b) => a + b, 0)}</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader className="flex items-center justify-between pb-2"><CardTitle className="text-base">Recent Invoices</CardTitle><Link href="/billing/invoices"><Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4 ml-1" /></Button></Link></CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { key: "id", header: "Invoice #", cell: (i) => <Link href={`/billing/invoices/${i.id}`} className="font-medium hover:underline">{i.id.toUpperCase()}</Link> },
                { key: "company", header: "Company", cell: (i) => i.companyName },
                { key: "amount", header: "Amount", cell: (i) => `₹${i.amount}` },
                { key: "status", header: "Status", cell: (i) => <Badge variant={i.status === "paid" ? "success" : i.status === "overdue" ? "error" : "warning"}>{i.status}</Badge> },
                { key: "date", header: "Date", cell: (i) => new Date(i.date).toLocaleDateString() },
              ]}
              data={recentInvoices}
              keyExtractor={(i) => i.id}
              emptyState={<EmptyState title="No invoices" description="No invoices found." />}
            />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Plan Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {Object.entries(plans).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between"><span>{name}</span><span className="font-medium">{count} companies</span></div>
                ))}
                {Object.keys(plans).length === 0 && <p className="text-muted-foreground">No plan data available</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link href="/billing/plans"><Button variant="outline" className="w-full justify-start"><FileText className="h-4 w-4 mr-2" /> Manage Plans</Button></Link>
              <Link href="/billing/trials"><Button variant="outline" className="w-full justify-start"><CalendarDays className="h-4 w-4 mr-2" /> Trial Management</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
