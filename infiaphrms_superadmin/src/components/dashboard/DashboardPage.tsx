"use client";

import { AdminShell } from "@/components/layout/AdminShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { reportsApi, companiesApi, hrUsersApi } from "@/lib/api";
import type { Company, HRUser } from "@/lib/types";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Activity,
  Plus,
  ShieldCheck,
  Download,
  Clock,
  Server,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  DollarSign,
  FileText,
  Smartphone,
  Shield,
  Database,
  Cpu,
  HardDrive,
  TrendingUp,
  MapPin,
  Bell,
  XCircle,
  LogIn,
  Eye,
  Wifi,
  CalendarX,
} from "lucide-react";
import Link from "next/link";

function BentoKpiCard({
  title,
  value,
  subLabel,
  subValue,
  subPercent,
  icon: Icon,
  color,
  loading,
  href,
}: {
  title: string;
  value: string;
  subLabel: string;
  subValue: string;
  subPercent: number;
  icon: React.ElementType;
  color: "blue" | "emerald" | "violet";
  loading: boolean;
  href?: string;
}) {
  const colorMap = {
    blue: { bg: "bg-blue-100", icon: "text-blue-600", bar: "bg-blue-500" },
    emerald: { bg: "bg-emerald-100", icon: "text-emerald-600", bar: "bg-emerald-500" },
    violet: { bg: "bg-violet-100", icon: "text-violet-600", bar: "bg-violet-500" },
  };
  const c = colorMap[color];

  const content = (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="h-full">
      <Card className="h-full hover:shadow-md">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
              <Icon className={`h-5 w-5 ${c.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-6 w-20 mt-0.5" />
              ) : (
                <p className="text-xl font-bold tracking-tight">{value}</p>
              )}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{subLabel}</span>
                  <span className="font-medium">{subValue}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  {loading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <motion.div
                      className={`h-full rounded-full ${c.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${subPercent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  return href ? <Link href={href} className="block h-full">{content}</Link> : content;
}

function BentoStatusCard({
  title,
  activeLabel,
  activeValue,
  inactiveLabel,
  inactiveValue,
  icon: Icon,
  loading,
}: {
  title: string;
  activeLabel: string;
  activeValue: string;
  inactiveLabel: string;
  inactiveValue: string;
  icon: React.ElementType;
  loading: boolean;
}) {
  const total = parseInt(activeValue || "0") + parseInt(inactiveValue || "0");
  const activePct = total > 0 ? (parseInt(activeValue || "0") / total) * 100 : 0;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="h-full">
      <Card className="h-full hover:shadow-md">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
              <Icon className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{title}</p>
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  {loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className="text-xl font-bold tracking-tight text-emerald-600">{activeValue}</p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-muted-foreground">{activeLabel}</span>
                  </div>
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    <p className="text-xl font-bold tracking-tight text-muted-foreground">{inactiveValue}</p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    <span className="text-[11px] text-muted-foreground">{inactiveLabel}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                {loading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${activePct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatRow({ icon: Icon, label, value, color = "default" }: {
  icon: React.ElementType; label: string; value: string; color?: "green" | "red" | "yellow" | "default";
}) {
  const col = { green: "text-emerald-600", red: "text-red-600", yellow: "text-amber-600", default: "text-foreground" }[color];
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />{label}
      </div>
      <span className={`text-sm font-semibold ${col}`}>{value}</span>
    </div>
  );
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [health, setHealth] = useState<{ apiUptime?: number; errorRate?: number; queueStatus?: string; queueDepth?: number; lastChecked?: string; dbStatus?: string; dbLatency?: number; dbConnections?: number; cpuUsage?: number; memoryUsage?: number; storageUsedGB?: number; storageTotalGB?: number } | null>(null);
  const [activeSessions, setActiveSessions] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [dashData, setDashData] = useState<Record<string, unknown> | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, unknown> | null>(null);
  const [payrollData, setPayrollData] = useState<Record<string, unknown> | null>(null);
  const [leaveData, setLeaveData] = useState<Record<string, unknown> | null>(null);
  const [loginsData, setLoginsData] = useState<Record<string, unknown> | null>(null);
  const [auditLogs, setAuditLogs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dash, companiesRes, hrRes, attendanceRes, payrollRes, leaveRes, loginsRes, auditRes] = await Promise.all([
          reportsApi.dashboard().catch(() => null),
          companiesApi.list({ limit: 10, sort_by: "created_at", order: "desc" }).catch(() => null),
          hrUsersApi.list({ limit: 1000 }).catch(() => null),
          reportsApi.attendance().catch(() => null),
          reportsApi.payroll().catch(() => null),
          reportsApi.leave().catch(() => null),
          reportsApi.logins().catch(() => null),
          reportsApi.auditLogs({ limit: 10 }).catch(() => null),
        ]);
        if (cancelled) return;
        if (dash) {
          setActiveSessions((dash.activeUsers as number) || 0);
          setDashData(dash);
          setMrr(0);
        }
        const companyList = ((companiesRes?.companies || companiesRes || []) as unknown) as Company[];
        const hrList = ((hrRes?.data || hrRes || []) as unknown) as HRUser[];
        setCompanies(companyList.map((c: any) => ({
          ...c,
          name: c.name || c.companyName,
          status: c.status || c.registrationStatus || "active",
          plan: c.plan || "Free",
          employeeCount: c.employeeCount ?? c.totalEmployees ?? 0,
        })));
        setHrUsers(hrList);
        if (attendanceRes) setAttendanceData(attendanceRes);
        if (payrollRes) setPayrollData(payrollRes);
        if (leaveRes) setLeaveData(leaveRes);
        if (loginsRes) setLoginsData(loginsRes);
        const auditList = ((auditRes?.data || auditRes || []) as unknown) as Record<string, unknown>[];
        setAuditLogs(auditList);
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
  const activeCompanies = companies.filter((c) => c.status === "active").length;
  const totalEmployees = companies.reduce((sum, c) => sum + (c.employeeCount || 0), 0);
  const activeEmployees = companies
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + (c.employeeCount || 0), 0);
  const activeHR = hrUsers.filter((h) => h.status === "active").length;
  const inactiveHR = hrUsers.filter((h) => h.status === "inactive").length;

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          <motion.div
            className="md:col-span-1 lg:col-span-2"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } } }}
          >
            <BentoKpiCard
              title="Total Companies"
              value={totalCompanies.toString()}
              subLabel="Active Companies"
              subValue={`${activeCompanies} of ${totalCompanies}`}
              subPercent={totalCompanies > 0 ? (activeCompanies / totalCompanies) * 100 : 0}
              icon={Building2}
              color="blue"
              loading={loading}
              href="/companies"
            />
          </motion.div>
          <motion.div
            className="md:col-span-1 lg:col-span-2"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } } }}
          >
            <BentoKpiCard
              title="Total Employees"
              value={totalEmployees.toLocaleString()}
              subLabel="Active Employees"
              subValue={`${activeEmployees.toLocaleString()} of ${totalEmployees.toLocaleString()}`}
              subPercent={totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0}
              icon={Users}
              color="emerald"
              loading={loading}
            />
          </motion.div>
          <motion.div
            className="md:col-span-2 lg:col-span-4"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } } }}
          >
            <BentoStatusCard
              title="HR Active Status"
              activeLabel="Active HR"
              activeValue={activeHR.toString()}
              inactiveLabel="Inactive HR"
              inactiveValue={inactiveHR.toString()}
              icon={ShieldCheck}
              loading={loading}
            />
          </motion.div>
        </motion.div>

        {/* ── Workforce ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workforce</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-emerald-500" /><CardTitle className="text-sm">Live Attendance</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <StatRow icon={CheckCircle2} label="Present" value={String((attendanceData?.present as number) ?? 0)} color="green" />
                    <StatRow icon={XCircle} label="Absent" value={String((attendanceData?.absent as number) ?? 0)} color="red" />
                    <StatRow icon={Clock} label="Late" value={String((attendanceData?.late as number) ?? 0)} color="yellow" />
                    <StatRow icon={CalendarX} label="On Leave" value={String((attendanceData?.onLeave as number) ?? 0)} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-blue-500" /><CardTitle className="text-sm">Payroll Summary</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <StatRow icon={DollarSign} label="Total Payroll" value={`₹${((payrollData?.totalAmount as number) ?? 0).toLocaleString()}`} />
                    <StatRow icon={CheckCircle2} label="Processed" value={String((payrollData?.processedCount as number) ?? 0)} color="green" />
                    <StatRow icon={Clock} label="Pending" value={String((payrollData?.pendingCount as number) ?? 0)} color="yellow" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-violet-500" /><CardTitle className="text-sm">Pending Approvals</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <StatRow icon={CalendarX} label="Leave Requests" value={String((leaveData?.pending as number) ?? (leaveData?.pendingCount as number) ?? 0)} color="yellow" />
                    <StatRow icon={DollarSign} label="Expense Claims" value={String((dashData?.pendingExpenses as number) ?? 0)} color="yellow" />
                    <StatRow icon={FileText} label="Documents" value={String((dashData?.pendingDocuments as number) ?? 0)} color="yellow" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Security ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><LogIn className="h-4 w-4 text-blue-500" /><CardTitle className="text-sm">Active Sessions</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <p className="text-2xl font-bold">{activeSessions}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">users online now</p>
                    <StatRow icon={Smartphone} label="Devices" value={String((dashData?.activeDevices as number) ?? activeSessions)} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /><CardTitle className="text-sm">Failed Logins</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <p className="text-2xl font-bold text-red-600">{(loginsData?.failedLogins as number) ?? (loginsData?.failed as number) ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">last 24 hours</p>
                    <StatRow icon={AlertTriangle} label="Locked accounts" value={String((loginsData?.lockedAccounts as number) ?? 0)} color="red" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><Eye className="h-4 w-4 text-amber-500" /><CardTitle className="text-sm">Suspicious Activity</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{(loginsData?.suspiciousCount as number) ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">flagged events</p>
                    <StatRow icon={MapPin} label="Geo anomalies" value={String((loginsData?.geoAnomalies as number) ?? 0)} color="yellow" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-red-500" /><CardTitle className="text-sm">Security Alerts</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div className="space-y-1.5">
                    {((loginsData?.alerts as any[]) ?? []).length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 py-1"><CheckCircle2 className="h-4 w-4" />No active alerts</div>
                    ) : (
                      ((loginsData?.alerts as any[]) ?? []).slice(0, 3).map((a: any, i: number) => (
                        <div key={i} className="text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded px-2 py-1">{typeof a === "string" ? a : (a.message ?? "Alert")}</div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Infrastructure ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Infrastructure</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-blue-500" /><CardTitle className="text-sm">Database Health</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <StatRow icon={CheckCircle2} label="Status" value={(health?.dbStatus as string) ?? "Healthy"} color="green" />
                    <StatRow icon={Clock} label="Latency" value={`${(health?.dbLatency as number) ?? 0}ms`} />
                    <StatRow icon={Database} label="Connections" value={String((health?.dbConnections as number) ?? 0)} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-emerald-500" /><CardTitle className="text-sm">API Status</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <StatRow icon={CheckCircle2} label="Uptime" value={`${health?.apiUptime ?? "—"}%`} color="green" />
                    <StatRow icon={AlertTriangle} label="Error Rate" value={`${health?.errorRate ?? 0}%`} color={(health?.errorRate as number) > 1 ? "red" : "green"} />
                    <StatRow icon={Activity} label="Queue" value={(health?.queueStatus as string) ?? "—"} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-violet-500" /><CardTitle className="text-sm">Server Health</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <StatRow icon={Cpu} label="CPU Usage" value={`${(health?.cpuUsage as number) ?? 0}%`} color={(health?.cpuUsage as number) > 80 ? "red" : "green"} />
                    <StatRow icon={Server} label="Memory" value={`${(health?.memoryUsage as number) ?? 0}%`} color={(health?.memoryUsage as number) > 80 ? "yellow" : "green"} />
                    <StatRow icon={Clock} label="Queue Depth" value={String(health?.queueDepth ?? 0)} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-orange-500" /><CardTitle className="text-sm">Storage Usage</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <div>
                    <p className="text-xl font-bold">{(health?.storageUsedGB as number) ?? "—"} <span className="text-xs font-normal text-muted-foreground">GB used</span></p>
                    <p className="text-xs text-muted-foreground mb-2">of {(health?.storageTotalGB as number) ?? "—"} GB total</p>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div className="h-full rounded-full bg-orange-500" initial={{ width: 0 }} animate={{ width: `${health?.storageTotalGB ? Math.min(((health.storageUsedGB as number) / (health.storageTotalGB as number)) * 100, 100) : 0}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Analytics ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Analytics</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Plan Distribution</CardTitle>
                <CardDescription>Companies by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-48 w-full rounded-full" /> : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90">
                        {planDistribution.reduce(
                          (acc, plan, _i) => {
                            const total = planDistribution.reduce((s, p) => s + p.count, 0);
                            const pct = total > 0 ? (plan.count / total) * 100 : 0;
                            const dash = pct * 2.51;
                            const gap = 251 - dash;
                            const offset = 251 - acc.cumulative * 2.51;
                            acc.elements.push(
                              <circle key={plan.label} cx="50" cy="50" r="40" fill="none" stroke={plan.color} strokeWidth="12" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} className="transition-[stroke-dashoffset,stroke-dasharray] duration-700 ease-out" />
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
                {loading ? <Skeleton className="h-48 w-full" /> : (
                  <div className="h-48 flex items-end gap-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const height = 30 + Math.random() * 60;
                      return (
                        <motion.div key={i} className="flex-1 flex flex-col items-center gap-1" initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: i * 0.03, duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }} style={{ originY: 1 }}>
                          <motion.div className="w-full rounded-t bg-primary/80 hover:bg-primary" style={{ height: `${height}%` }} whileHover={{ scaleY: 1.05 }} transition={{ duration: 0.15 }} />
                          <span className="text-[10px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Live Tracking ── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Tracking</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-500" /><CardTitle className="text-sm">Company Growth</CardTitle></div>
                <CardDescription className="text-xs">Monthly new companies</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-28 w-full" /> : (
                  <div className="h-28 flex items-end gap-1">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const h = 20 + Math.random() * 70;
                      return (
                        <motion.div key={i} className="flex-1 flex flex-col items-center gap-0.5" initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: i * 0.03, duration: 0.3 }} style={{ originY: 1 }}>
                          <div className="w-full rounded-t bg-blue-500/70 hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }} />
                          <span className="text-[9px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-500" /><CardTitle className="text-sm">Live User Tracking</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-28 w-full" /> : (
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{activeSessions}</p>
                      <p className="text-xs text-muted-foreground">users online now</p>
                    </div>
                    <StatRow icon={Building2} label="Companies active" value={String(activeCompanies)} color="green" />
                    <StatRow icon={Users} label="HR users online" value={String(activeHR)} color="green" />
                    <StatRow icon={Clock} label="Avg session" value={(dashData?.avgSessionMin as string) ?? "—"} />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-violet-500" /><CardTitle className="text-sm">Active Devices</CardTitle></div></CardHeader>
              <CardContent className="px-4 pb-4">
                {loading ? <Skeleton className="h-28 w-full" /> : (
                  <div>
                    <StatRow icon={Smartphone} label="Mobile" value={String((dashData?.mobileDevices as number) ?? 0)} />
                    <StatRow icon={Server} label="Desktop" value={String((dashData?.desktopDevices as number) ?? 0)} />
                    <StatRow icon={Wifi} label="Tablet" value={String((dashData?.tabletDevices as number) ?? 0)} />
                    <StatRow icon={Shield} label="Unknown" value={String((dashData?.unknownDevices as number) ?? 0)} color="yellow" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activities</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : (
                <div>
                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  ) : (
                    auditLogs.slice(0, 8).map((log, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                        <div className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{(log.action as string) || "—"}</p>
                          <p className="text-xs text-muted-foreground">{(log.actorEmail as string) || "System"}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{log.createdAt ? new Date(log.createdAt as string).toLocaleTimeString() : "—"}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Company Signups</CardTitle>
              <CardDescription>Last 10 companies that joined the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
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
                        <motion.tr key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }} className="hover:bg-muted/30">
                          <td className="px-3 py-2.5 font-medium"><Link href={`/companies/${c.id}`} className="hover:underline">{c.name}</Link></td>
                          <td className="px-3 py-2.5"><Badge variant={c.plan === "Enterprise" ? "info" : c.plan === "Pro" ? "success" : "secondary"}>{c.plan}</Badge></td>
                          <td className="px-3 py-2.5"><Badge variant={c.status === "active" ? "success" : c.status === "trial" ? "info" : c.status === "suspended" ? "warning" : "secondary"}>{c.status}</Badge></td>
                          <td className="px-3 py-2.5 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
