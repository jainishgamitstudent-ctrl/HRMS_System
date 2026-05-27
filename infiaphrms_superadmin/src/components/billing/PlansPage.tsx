"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { billingApi } from "@/lib/api";
import { CreditCard, Users, Check, Plus } from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  price_monthly?: number;
  price_yearly?: number;
  features?: string[];
  isArchived?: boolean;
}

export function PlansPage() {
  const [editPlan, setEditPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await billingApi.listPlans().catch(() => []);
        if (!cancelled) setPlans((res as unknown) as PlanItem[]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Billing", href: "/billing" }, { label: "Plans" }]} />
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plans & Pricing</h1>
            <p className="text-sm text-muted-foreground">Manage subscription tiers and pricing</p>
          </div>
          <Button variant="outline"><Plus className="h-4 w-4 mr-1.5" /> Create Plan</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }}
            >
              <Card className="hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <Badge variant={plan.name === "Enterprise" ? "info" : plan.name === "Pro" ? "success" : "secondary"}><Users className="h-3 w-3 mr-1" /> {plan.id.slice(0, 4)}</Badge>
                </div>
                <p className="text-3xl font-bold mt-2">₹{plan.price_monthly || 0}/mo</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {(plan.features || []).map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> {f}</li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-4 w-full" onClick={() => setEditPlan(plan.id)}>Edit Plan</Button>
              </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <Modal isOpen={!!editPlan} onClose={() => setEditPlan(null)} title={`Edit Plan`} footer={<><Button variant="outline" onClick={() => setEditPlan(null)}>Cancel</Button><Button onClick={() => { setEditPlan(null); addToast({ title: "Plan updated", type: "success" }); }}>Save Plan</Button></>}>
        <div className="space-y-4">
          <Input label="Plan Name" defaultValue={plans.find(p => p.id === editPlan)?.name || ""} />
          <Input label="Monthly Price" defaultValue={String(plans.find(p => p.id === editPlan)?.price_monthly || "")} />
          <div><label className="text-sm font-medium">Features</label><textarea defaultValue={(plans.find(p => p.id === editPlan)?.features || []).join("\n")} className="mt-1.5 w-full rounded-md border border-input bg-card px-3 py-2 text-sm min-h-[100px]" /></div>
        </div>
      </Modal>
    </AdminShell>
  );
}
