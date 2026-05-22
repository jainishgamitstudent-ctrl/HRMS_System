"use client";

import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { mockInvoices, mockCompanies } from "@/lib/mock-data";
import { IndianRupee, TrendingUp, FileText, CalendarDays, ArrowRight } from "lucide-react";

export function BillingDashboardPage() {
  const totalMrr = mockCompanies.reduce((s, c) => s + c.mrr, 0);
  const totalRevenue = mockCompanies.reduce((s, c) => s + c.mrr, 0) * 12;
  const recentInvoices = mockInvoices.slice(0, 5);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Billing & Subscriptions" }]} />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Financial overview and subscription management</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><IndianRupee className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total MRR</p><p className="text-2xl font-bold">₹{totalMrr.toLocaleString()}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Avg Plan Price</p><p className="text-2xl font-bold">₹249</p></div></div></CardContent></Card>
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
                <div className="flex items-center justify-between"><span>Free</span><span className="font-medium">3 companies</span></div>
                <div className="flex items-center justify-between"><span>Pro</span><span className="font-medium">4 companies</span></div>
                <div className="flex items-center justify-between"><span>Enterprise</span><span className="font-medium">3 companies</span></div>
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
