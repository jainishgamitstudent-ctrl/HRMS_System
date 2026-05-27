"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { billingApi } from "@/lib/api";
import type { Invoice } from "@/lib/types";
import { ArrowLeft, FileText } from "lucide-react";

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await billingApi.getInvoice(invoiceId).catch(() => null);
        if (!cancelled) setInvoice((res as unknown) as Invoice);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [invoiceId]);

  if (!invoice) {
    return (
      <AdminShell>
        <div className="text-center py-20">
          <h1 className="text-xl font-semibold">Invoice not found</h1>
          <Link href="/billing/invoices" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">&larr; Back to invoices</Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Billing", href: "/billing" }, { label: "Invoices", href: "/billing/invoices" }, { label: invoice.id.toUpperCase() }]} />
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/billing/invoices"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{invoice.id.toUpperCase()}</h1>
              <Badge variant={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "error" : "warning"} className="mt-1">{invoice.status}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1.5" /> Download PDF</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Company</span><p className="font-medium">{invoice.companyName}</p></div>
              <div><span className="text-muted-foreground">Amount</span><p className="font-medium">₹{invoice.amount}</p></div>
              <div><span className="text-muted-foreground">Date</span><p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p></div>
              <div><span className="text-muted-foreground">Plan</span><p className="font-medium">{invoice.plan}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Qty</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Unit Price</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {invoice.lineItems.map((item, i) => (
                    <tr key={i}><td className="px-3 py-2.5">{item.description}</td><td className="px-3 py-2.5 text-right">{item.quantity}</td><td className="px-3 py-2.5 text-right">₹{item.unitPrice}</td><td className="px-3 py-2.5 text-right font-medium">₹{item.total}</td></tr>
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
