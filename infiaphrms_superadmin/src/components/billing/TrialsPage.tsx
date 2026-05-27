"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { billingApi } from "@/lib/api";
import type { TrialCompany } from "@/lib/types";
import { CalendarDays, ArrowRight, Plus } from "lucide-react";

export function TrialsPage() {
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [targetTrial, setTargetTrial] = useState<string | null>(null);
  const [trials, setTrials] = useState<TrialCompany[]>([]);
  const { addToast } = useToast();

  const trial = targetTrial ? trials.find((t) => t.id === targetTrial) : null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await billingApi.listTrials().catch(() => []);
        if (!cancelled) setTrials((res as unknown) as TrialCompany[]);
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleExtend() {
    if (!trial) return;
    try {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 14);
      await billingApi.extendTrial(trial.id, newDate.toISOString().split("T")[0], "Sales support");
      addToast({ title: "Trial extended", type: "success" });
      setTrials((prev) => prev.map((t) => t.id === trial.id ? { ...t, daysRemaining: 14 } : t));
    } catch (err: any) {
      addToast({ title: err.message || "Failed to extend trial", type: "error" });
    }
    setExtendModalOpen(false);
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Billing", href: "/billing" }, { label: "Trial Management" }]} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trial Management</h1>
            <p className="text-sm text-muted-foreground">Monitor and extend company trials</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Active Trials</p>
            <p className="text-2xl font-bold">{trials.length}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Expiring Soon (&lt;3 days)</p>
            <p className="text-2xl font-bold">{trials.filter(t => t.daysRemaining <= 3).length}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-2xl font-bold">64%</p>
          </div>
        </div>
        <DataTable
          columns={[
            { key: "name", header: "Company", cell: (t) => <span className="font-medium">{t.name}</span>, sortable: true },
            { key: "admin", header: "Admin Email", cell: (t) => t.adminEmail },
            { key: "signup", header: "Signup Date", cell: (t) => new Date(t.signupDate).toLocaleDateString(), sortable: true },
            { key: "remaining", header: "Days Remaining", cell: (t) => <Badge variant={t.daysRemaining <= 3 ? "error" : t.daysRemaining <= 7 ? "warning" : "success"}>{t.daysRemaining}</Badge>, sortable: true },
            { key: "actions", header: "", cell: (t) => (
              <Button variant="ghost" size="sm" onClick={() => { setTargetTrial(t.id); setExtendModalOpen(true); }}>
                <CalendarDays className="h-4 w-4 mr-1" /> Extend
              </Button>
            ), className: "w-28" },
          ]}
          data={trials}
          keyExtractor={(t) => t.id}
          emptyState={<EmptyState title="No active trials" description="There are no companies currently on trial." />}
        />
      </div>
      <Modal isOpen={extendModalOpen} onClose={() => setExtendModalOpen(false)} title="Extend Trial" footer={<><Button variant="outline" onClick={() => setExtendModalOpen(false)}>Cancel</Button><Button onClick={handleExtend}>Extend Trial</Button></>}>
        <p className="text-sm">Extend the trial for <span className="font-semibold">{trial?.name}</span> by 14 days.</p>
      </Modal>
    </AdminShell>
  );
}
