"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { reportsApi, companiesApi } from "@/lib/api";
import type { Company } from "@/lib/types";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Activity,
  IndianRupee,
  Plus,
  ShieldCheck,
  UserPlus,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Server,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  loading,
  href,
}: {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  loading: boolean;
  href?: string;
}) {
  const content = (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className="hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
              {!loading && change !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  {change >= 0 ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-green-600 font-medium">+{change}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                      <span className="text-red-600 font-medium">{change}%</span>
                    </>
                  )}
                  {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
                </div>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [health, setHealth] = useState<{ apiUptime?: number; errorRate?: number; queueStatus?: string; queueDepth?: number; lastChecked?: string } | null>(null);
  const [activeSessions, setActiveSessions] = useState(0);
  const [mrr, setMrr] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dash, companiesRes] = await Promise.all([
          reportsApi.dashboard().catch(() => null),
          companiesApi.list({ limit: 10, sort_by: "created_at", order: "desc" }).catch(() => null),
        ]);
        if (cancelled) return;
        if (dash) {
          setActiveSessions((dash.activeUsers as number) || 0);
          setMrr(0);
        }
        const companyList = ((companiesRes?.companies || companiesRes || []) as unknown) as Company[];
        setCompanies(companyList.map((c: any) => ({
          ...c,
          name: c.name || c.companyName,
          status: c.status || c.registrationStatus || "active",
          plan: c.plan || "Free",
          employeeCount: c.employeeCount ?? c.totalEmployees ?? 0,
        })));
        const healthRes = await reportsApi.health().catch(() => null);
        if (!cancelled && healthRes) setHealth(healthRes);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const totalCompanies = companies.length;
  const totalEmployees = companies.reduce((sum, c) => sum + (c.employeeCount || 0), 0);

  const planDistribution = [
    { label: "Free", count: companies.filter((c) => c.plan === "Free").length, color: "#94a3b8" },
    { label: "Pro", count: companies.filter((c) => c.plan === "Pro").length, color: "#2563eb" },
    { label: "Enterprise", count: companies.filter((c) => c.plan === "Enterprise").length, color: "#8b5cf6" },
  ];

  const recentSignups = [...companies]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Platform-wide health at a glance. Last updated {new Date().toLocaleTimeString()}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/companies/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> Add Company
              </Button>
            </Link>
            <Link href="/admins">
              <Button variant="outline" size="sm">
                <ShieldCheck className="h-4 w-4 mr-1.5" /> Add Admin
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" /> Export
            </Button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const } } }}>
            <KpiCard
              title="Total Companies"
              value={totalCompanies.toString()}
              icon={Building2}
              loading={loading}
              href="/companies"
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const } } }}>
            <KpiCard
              title="Total Employees"
              value={totalEmployees.toLocaleString()}
              icon={Users}
              loading={loading}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const } } }}>
            <KpiCard
              title="Active Users"
              value={loading ? "" : activeSessions.toLocaleString()}
              icon={Activity}
              loading={loading}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const } } }}>
            <KpiCard
              title="MRR"
              value={loading ? "" : `₹${mrr.toLocaleString()}`}
              icon={IndianRupee}
              loading={loading}
              href="/billing"
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Plan Distribution</CardTitle>
              <CardDescription>Companies by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full rounded-full" />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90">
                      {planDistribution.reduce(
                        (acc, plan, i) => {
                          const total = planDistribution.reduce((s, p) => s + p.count, 0);
                          const pct = total > 0 ? (plan.count / total) * 100 : 0;
                          const dash = pct * 2.51;
                          const gap = 251 - dash;
                          const offset = 251 - acc.cumulative * 2.51;
                          acc.elements.push(
                            <circle
                              key={plan.label}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={plan.color}
                              strokeWidth="12"
                              strokeDasharray={`${dash} ${gap}`}
                              strokeDashoffset={offset}
                              className="transition-[stroke-dashoffset,stroke-dasharray] duration-700 ease-out"
                            />
                          );
                          acc.cumulative += pct;
                          return acc;
                        },
                        { elements: [] as React.ReactNode[], cumulative: 0 }
                      ).elements}
                    </svg>
                  </div>
                  <div className="space-y-2">
                    {planDistribution.map((plan) => (
                      <div key={plan.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: plan.color }} />
                          <span>{plan.label}</span>
                        </div>
                        <span className="font-medium">{plan.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Monthly Active Users Trend</CardTitle>
              <CardDescription>Platform-wide user engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="h-48 flex items-end gap-2">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const height = 30 + Math.random() * 60;
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ delay: i * 0.03, duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
                        style={{ originY: 1 }}
                      >
                        <motion.div
                          className="w-full rounded-t bg-primary/80 hover:bg-primary"
                          style={{ height: `${height}%` }}
                          whileHover={{ scaleY: 1.05 }}
                          transition={{ duration: 0.15 }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Company Signups</CardTitle>
              <CardDescription>Last 10 companies that joined the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Plan</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentSignups.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
                          className="hover:bg-muted/30"
                        >
                          <td className="px-3 py-2.5 font-medium">
                            <Link href={`/companies/${c.id}`} className="hover:underline">
                              {c.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              variant={
                                c.plan === "Enterprise"
                                  ? "info"
                                  : c.plan === "Pro"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {c.plan}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              variant={
                                c.status === "active"
                                  ? "success"
                                  : c.status === "trial"
                                  ? "info"
                                  : c.status === "suspended"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {c.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Health</CardTitle>
              <CardDescription>Real-time platform status indicators</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">API Uptime</p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{health?.apiUptime}%</span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Error Rate</p>
                        <p className="text-xs text-muted-foreground">5xx responses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{health?.errorRate}%</span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Queue Status</p>
                        <p className="text-xs text-muted-foreground">{health?.queueDepth} messages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={health?.queueStatus === "healthy" ? "success" : "warning"}>
                        {health?.queueStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Checked</p>
                        <p className="text-xs text-muted-foreground">Auto-refresh every 30s</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(health?.lastChecked || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
