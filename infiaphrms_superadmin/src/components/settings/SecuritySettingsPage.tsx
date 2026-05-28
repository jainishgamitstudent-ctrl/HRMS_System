"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsLayout } from "./SettingsLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/providers/ToastProvider";
import { settingsApi } from "@/lib/api";
import { Shield, Monitor, Lock, Smartphone, HelpCircle, Fingerprint, Trash2, AlertTriangle, CheckCircle2, Loader2, Mail, RefreshCw, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface PredefinedQuestion {
  id: string;
  text: string;
}

interface ConfiguredQuestion {
  questionId: string;
  questionText: string;
  answer: string;
}

interface SessionItem {
  _id: string;
  deviceInfo: {
    browser: string;
    os: string;
    deviceType: string;
    ipAddress: string;
  };
  loginAt: string;
  lastActiveAt: string;
  isTrustedDevice: boolean;
}

interface TrustedDeviceItem {
  _id: string;
  deviceInfo: {
    browser: string;
    os: string;
    deviceType: string;
  };
  firstSeenAt: string;
  lastSeenAt: string;
  firstSeenIp: string;
}

export function SecuritySettingsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Security questions
  const [sqModalOpen, setSqModalOpen] = useState(false);
  const [predefinedQuestions, setPredefinedQuestions] = useState<PredefinedQuestion[]>([]);
  const [isSqConfigured, setIsSqConfigured] = useState(false);
  const [sqForm, setSqForm] = useState<ConfiguredQuestion[]>([]);

  // Sessions
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  // Trusted devices
  const [trustedDevices, setTrustedDevices] = useState<TrustedDeviceItem[]>([]);
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);

  // ── Recovery email ──
  type ReStep = "idle" | "enter-email" | "verify-otp";
  type RecoveryStatus = { maskedPrimaryEmail: string; maskedRecoveryEmail: string | null; hasPendingChange: boolean; maskedPendingEmail: string | null } | null;
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>(null);
  const [reStep, setReStep] = useState<ReStep>("idle");
  const [reEmail, setReEmail] = useState("");
  const [reOtp, setReOtp] = useState("");
  const [reLoading, setReLoading] = useState(false);
  const [reExpiry, setReExpiry] = useState(0);
  const [reResendCooldown, setReResendCooldown] = useState(0);
  const [reDevOtp, setReDevOtp] = useState<string | null>(null);
  const [reError, setReError] = useState<string | null>(null);
  const [reAttemptsLeft, setReAttemptsLeft] = useState(5);
  const [reMaskedPrimaryEmail, setReMaskedPrimaryEmail] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (reExpiry <= 0) return;
    const t = setInterval(() => setReExpiry((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [reExpiry]);

  useEffect(() => {
    if (reResendCooldown <= 0) return;
    const t = setInterval(() => setReResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [reResendCooldown]);

  async function loadAll() {
    await Promise.all([loadSecurityQuestions(), loadSessions(), loadTrustedDevices(), loadRecoveryEmailStatus()]);
  }

  async function loadSecurityQuestions() {
    try {
      const raw = await settingsApi.getSecurityQuestions() as any;
      // saFetch unwraps { success: true, data: X } → returns X directly
      // so 'raw' is { predefined, configured, isConfigured }, not { success, data }
      const d = raw?.predefined !== undefined ? raw : raw?.data;
      if (!d) return;
      setPredefinedQuestions(d.predefined || []);
      setIsSqConfigured(d.isConfigured || false);
      if (!d.isConfigured) {
        setSqForm(
          (d.predefined || []).slice(0, 3).map((q: PredefinedQuestion) => ({
            questionId: q.id,
            questionText: q.text,
            answer: "",
          }))
        );
      } else {
        setSqForm(
          (d.configured || []).map((q: any) => ({
            questionId: q.questionId,
            questionText: q.questionText,
            answer: "",
          }))
        );
      }
    } catch (err: any) {
      addToast({ title: err.message || "Failed to load security questions", type: "error" });
    }
  }

  async function loadSessions() {
    try {
      const res = await settingsApi.getSessions();
      if (res.success && res.data) {
        setSessions(res.data as SessionItem[]);
      }
    } catch (err: any) {
      // Silently ignore; backend may not have sessions yet
    }
  }

  async function loadTrustedDevices() {
    try {
      const res = await settingsApi.getTrustedDevices();
      if (res.success && res.data) {
        setTrustedDevices(res.data as TrustedDeviceItem[]);
      }
    } catch (err: any) {
      // Silently ignore
    }
  }

  const handleSaveSecurityQuestions = async () => {
    if (sqForm.some((q) => !q.answer.trim() || q.answer.trim().length < 2)) {
      addToast({ title: "Each answer must be at least 2 characters", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await settingsApi.setSecurityQuestions(sqForm.map((q) => ({ questionId: q.questionId, questionText: q.questionText, answer: q.answer })));
      addToast({ title: "Security questions saved", type: "success" });
      setSqModalOpen(false);
      await loadSecurityQuestions();
    } catch (err: any) {
      addToast({ title: err.message || "Failed to save security questions", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      await settingsApi.revokeOneSession(sessionId);
      addToast({ title: "Session revoked", type: "success" });
      await loadSessions();
    } catch (err: any) {
      addToast({ title: err.message || "Failed to revoke session", type: "error" });
    } finally {
      setRevokingSession(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm("This will log you out of all devices including this one. Continue?")) return;
    setLoading(true);
    try {
      await settingsApi.revokeAllSuperadminSessions();
      addToast({ title: "All sessions revoked", type: "success" });
      setSessions([]);
    } catch (err: any) {
      addToast({ title: err.message || "Failed to revoke all sessions", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setRemovingDevice(deviceId);
    try {
      await settingsApi.removeTrustedDevice(deviceId);
      addToast({ title: "Device trust removed", type: "success" });
      await loadTrustedDevices();
    } catch (err: any) {
      addToast({ title: err.message || "Failed to remove device", type: "error" });
    } finally {
      setRemovingDevice(null);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  async function loadRecoveryEmailStatus() {
    try {
      const res = await settingsApi.getRecoveryEmailStatus();
      setRecoveryStatus(res as any);
      setReMaskedPrimaryEmail((res as any).maskedPrimaryEmail || "");
    } catch {
      // Silently ignore on load
    }
  }

  async function handleRequestRecoveryEmailChange() {
    const email = reEmail.trim().toLowerCase();
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setReError("Please enter a valid email address");
      return;
    }
    setReError(null);
    setReLoading(true);
    try {
      const res = await settingsApi.requestRecoveryEmailChange(email);
      setReExpiry((res as any).expiresInSeconds || 300);
      setReResendCooldown(60);
      setReDevOtp((res as any).devOtp || null);
      setReAttemptsLeft(5);
      setReOtp("");
      setReStep("verify-otp");
    } catch (err: any) {
      const code = err.data?.code || err.code;
      if (code === "resend_too_soon") {
        setReResendCooldown(err.data?.waitSeconds || 60);
        setReError(`Please wait ${err.data?.waitSeconds || 60}s before resending`);
      } else {
        setReError(err.data?.message || err.message || "Failed to send OTP");
      }
    } finally {
      setReLoading(false);
    }
  }

  async function handleConfirmRecoveryEmailChange() {
    const code = reOtp.trim().toUpperCase();
    if (!code || code.length !== 6 || !/^[A-Z0-9]{6}$/.test(code)) {
      setReError("Enter a valid 6-character OTP (letters and numbers)");
      return;
    }
    setReError(null);
    setReLoading(true);
    try {
      const res = await settingsApi.confirmRecoveryEmailChange(code);
      setReStep("idle");
      setReEmail("");
      setReOtp("");
      setReDevOtp(null);
      await loadRecoveryEmailStatus();
      await Swal.fire({
        icon: "success",
        title: "Recovery email updated!",
        html: `Your new recovery email <strong>${(res as any).recoveryEmailMasked}</strong> has been saved.`,
        confirmButtonText: "Done",
        confirmButtonColor: "#16a34a",
        timer: 6000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      const errCode = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Verification failed";
      if (errCode === "too_many_attempts") {
        setReError("Too many failed attempts. Please start over.");
        setReStep("enter-email");
        setReAttemptsLeft(0);
      } else {
        setReAttemptsLeft(err.data?.attemptsLeft ?? Math.max(0, reAttemptsLeft - 1));
        setReError(errCode === "expired_otp" ? "OTP has expired. Click Resend." : msg);
      }
    } finally {
      setReLoading(false);
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Security" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-sm text-muted-foreground">Manage sessions, devices, and security questions</p>
        </div>

        {/* Recovery Email */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Recovery Email</CardTitle></CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">

              {/* ── IDLE ── */}
              {reStep === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {recoveryStatus?.maskedRecoveryEmail ?? "Not configured"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {recoveryStatus?.maskedRecoveryEmail
                            ? "Used for account recovery if locked out"
                            : "Set a recovery email to regain access if locked out"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" noMotion onClick={() => { setReError(null); setReEmail(""); setReStep("enter-email"); }}>
                      {recoveryStatus?.maskedRecoveryEmail ? "Change" : "Set up"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── ENTER EMAIL ── */}
              {reStep === "enter-email" && (
                <motion.div key="enter-email" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 flex items-start gap-2">
                    <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800">
                      A 6-character verification OTP will be sent to your primary email:
                      {" "}<span className="font-semibold">{reMaskedPrimaryEmail || "your registered email"}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Recovery Email</label>
                    <Input
                      type="email"
                      placeholder="recovery@example.com"
                      value={reEmail}
                      onChange={(e: any) => { setReEmail(e.target.value); setReError(null); }}
                      onKeyDown={(e: any) => e.key === "Enter" && !reLoading && handleRequestRecoveryEmailChange()}
                      error={reError || undefined}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleRequestRecoveryEmailChange} disabled={reLoading || !reEmail.trim()} isLoading={reLoading} noMotion className="flex-1">
                      {!reLoading && <Mail className="h-4 w-4 mr-1.5" />}
                      Send OTP to primary email
                    </Button>
                    <Button variant="outline" size="sm" noMotion onClick={() => { setReStep("idle"); setReError(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── VERIFY OTP ── */}
              {reStep === "verify-otp" && (
                <motion.div key="verify-otp" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="space-y-4">

                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">OTP sent to <span className="font-medium text-foreground">{reMaskedPrimaryEmail}</span></span>
                    <span className={`text-xs font-mono font-semibold ${reExpiry > 30 ? "text-green-600" : reExpiry > 0 ? "text-amber-600" : "text-red-500"}`}>
                      {reExpiry > 0 ? `${Math.floor(reExpiry / 60)}:${String(reExpiry % 60).padStart(2, "0")}` : "Expired"}
                    </span>
                  </div>

                  {reDevOtp && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2.5 text-center">
                      <p className="text-[10px] font-semibold text-yellow-700 uppercase tracking-wider mb-0.5">Dev mode OTP</p>
                      <p className="text-sm font-mono font-bold text-yellow-800 tracking-widest">{reDevOtp}</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">6-Character OTP</label>
                    <Input
                      type="text"
                      placeholder="A1B2C3"
                      maxLength={6}
                      value={reOtp}
                      onChange={(e: any) => { setReOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setReError(null); }}
                      onKeyDown={(e: any) => e.key === "Enter" && !reLoading && handleConfirmRecoveryEmailChange()}
                      className="tracking-widest text-center font-mono text-lg uppercase"
                      error={reError || undefined}
                      disabled={reExpiry === 0}
                    />
                    {reAttemptsLeft < 5 && reAttemptsLeft > 0 && (
                      <p className="text-xs text-amber-600">{reAttemptsLeft} attempt(s) remaining</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleConfirmRecoveryEmailChange} disabled={reLoading || reOtp.length !== 6 || reExpiry === 0} isLoading={reLoading} noMotion className="flex-1">
                      {!reLoading && <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      noMotion
                      disabled={reResendCooldown > 0 || reLoading}
                      onClick={handleRequestRecoveryEmailChange}
                      className="gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {reResendCooldown > 0 ? `${reResendCooldown}s` : "Resend"}
                    </Button>
                    <Button variant="ghost" size="sm" noMotion onClick={() => { setReStep("idle"); setReError(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Security Questions */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Security Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Login Verification Questions</p>
                  <p className="text-xs text-muted-foreground">
                    {isSqConfigured ? "Configured — used on new device logins" : "Not configured — recommended for account security"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" noMotion onClick={async () => {
                await loadSecurityQuestions();
                setSqModalOpen(true);
              }}>
                {isSqConfigured ? "Update" : "Setup"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Monitor className="h-4 w-4" /> Active Sessions</CardTitle>
              {sessions.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleRevokeAll} disabled={loading}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Revoke All"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg bg-muted/30">
                No active sessions found
              </div>
            ) : (
              sessions.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{s.deviceInfo?.browser} on {s.deviceInfo?.os} ({s.deviceInfo?.deviceType})</p>
                    <p className="text-xs text-muted-foreground">IP: {s.deviceInfo?.ipAddress} · {formatDate(s.lastActiveAt)}</p>
                    {s.isTrustedDevice && <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">Trusted</span>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeSession(s._id)}
                    disabled={revokingSession === s._id}
                  >
                    {revokingSession === s._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Revoke"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Trusted Devices */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Trusted Devices</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {trustedDevices.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg bg-muted/30">
                No trusted devices found
              </div>
            ) : (
              trustedDevices.map((d) => (
                <div key={d._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{d.deviceInfo?.browser} on {d.deviceInfo?.os} ({d.deviceInfo?.deviceType})</p>
                    <p className="text-xs text-muted-foreground">First seen: {formatDate(d.firstSeenAt)} · IP: {d.firstSeenIp}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(d._id)}
                    disabled={removingDevice === d._id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {removingDevice === d._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Password Policy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Minimum Password Length" defaultValue="8" type="number" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Require uppercase letters</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Require numbers</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4" /> Require special characters</label>
            <Button onClick={() => addToast({ title: "Policy updated", type: "success" })}>Save Policy</Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Questions Modal */}
      <Modal isOpen={sqModalOpen} onClose={() => setSqModalOpen(false)} title="Setup Security Questions" footer={
        <>
          <Button variant="outline" onClick={() => setSqModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSecurityQuestions} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Save Questions
          </Button>
        </>
      }>
        <div className="space-y-5">
          {isSqConfigured && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Updating security questions will overwrite your existing answers. You must re-enter answers for all questions.</p>
            </div>
          )}
          {sqForm.map((q, idx) => (
            <div key={q.questionId} className="space-y-2">
              <label className="text-sm font-medium">{idx + 1}. {q.questionText}</label>
              <Input
                value={q.answer}
                onChange={(e: any) => {
                  const value = e.target?.value ?? e;
                  setSqForm((prev) => prev.map((item) => item.questionId === q.questionId ? { ...item, answer: value } : item));
                }}
                placeholder="Your answer"
                type="password"
              />
            </div>
          ))}
          {sqForm.length < 3 && predefinedQuestions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const usedIds = new Set(sqForm.map((q) => q.questionId));
                const next = predefinedQuestions.find((pq) => !usedIds.has(pq.id));
                if (next) {
                  setSqForm((prev) => [...prev, { questionId: next.id, questionText: next.text, answer: "" }]);
                }
              }}
            >
              Add Question
            </Button>
          )}
        </div>
      </Modal>
      </SettingsLayout>
    </AdminShell>
  );
}
