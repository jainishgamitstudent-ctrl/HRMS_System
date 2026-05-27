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
import { Shield, Monitor, Lock, Smartphone, HelpCircle, Fingerprint, Trash2, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

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

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([loadSecurityQuestions(), loadSessions(), loadTrustedDevices()]);
  }

  async function loadSecurityQuestions() {
    try {
      const res = await settingsApi.getSecurityQuestions();
      if (res.success && res.data) {
        setPredefinedQuestions(res.data.predefined || []);
        setIsSqConfigured(res.data.isConfigured || false);
        if (!res.data.isConfigured) {
          // Initialize with first 3 predefined questions
          const initial = (res.data.predefined || []).slice(0, 3).map((q: PredefinedQuestion) => ({
            questionId: q.id,
            questionText: q.text,
            answer: "",
          }));
          setSqForm(initial);
        } else {
          setSqForm(
            (res.data.configured || []).map((q: any) => ({
              questionId: q.questionId,
              questionText: q.questionText,
              answer: "",
            }))
          );
        }
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

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Security" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
          <p className="text-sm text-muted-foreground">Manage sessions, devices, and security questions</p>
        </div>

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
              <Button variant="outline" size="sm" onClick={() => setSqModalOpen(true)}>
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
