"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/providers/ToastProvider";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Mail, ArrowLeft, ShieldCheck, Clock, Loader2, XCircle, CheckCircle2 } from "lucide-react";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `*@${domain}`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
}

type Step = "enter-email" | "verify-otp" | "awaiting-confirm";

export default function ChangeEmailPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { logout, user, updateUser } = useAuth();

  const [step, setStep] = useState<Step>("enter-email");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [emailChangeId, setEmailChangeId] = useState<string | null>(null);
  const [maskedCurrentEmail, setMaskedCurrentEmail] = useState("");
  const [maskedNewEmail, setMaskedNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(5);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [completed, setCompleted] = useState(false);

  // OTP expiry countdown
  useEffect(() => {
    if (otpExpiry <= 0) return;
    const t = setInterval(() => setOtpExpiry((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [otpExpiry]);

  // Polling for status on step 3
  useEffect(() => {
    if (step !== "awaiting-confirm" || !emailChangeId) return;

    const poll = async () => {
      try {
        const data = await authApi.getEmailChangeStatus(emailChangeId);
        setPollStatus(data.status);
        if (data.status === "completed") {
          setCompleted(true);
          if (pollRef.current) clearInterval(pollRef.current);
          addToast({ title: "Email changed successfully", type: "success" });
          // Since all sessions were revoked on the backend, log out locally
          logout();
        } else if (data.status === "expired" || data.status === "cancelled") {
          if (pollRef.current) clearInterval(pollRef.current);
          addToast({ title: "Email change expired or cancelled", type: "error" });
          setStep("enter-email");
        }
      } catch {
        // ignore polling errors
      }
    };

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, emailChangeId, logout, addToast]);

  const handleInitiate = useCallback(async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (email === user?.email?.toLowerCase()) {
      setEmailError("New email cannot be the same as your current email");
      return;
    }
    setEmailError(null);
    setLoading(true);
    try {
      const res = await authApi.initiateEmailChange(email);
      setEmailChangeId(res.emailChangeId as string);
      setMaskedCurrentEmail((res.maskedCurrentEmail as string) || maskEmail(user?.email || ""));
      setOtpExpiry((res.otpExpiresInSeconds as number) || 600);
      setOtpAttemptsLeft(5);
      setDevOtp((res.devOtp as string) || null);
      setOtp("");
      setOtpError(null);
      setStep("verify-otp");
      addToast({ title: "OTP sent to your current email", type: "info" });
    } catch (err: any) {
      const code = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Failed to initiate email change";
      if (code === "email_taken") {
        setEmailError("This email is already in use");
      } else if (code === "pending_change") {
        setEmailError("You already have a pending email change. Please wait or cancel it.");
      } else {
        setEmailError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [newEmail, user, addToast]);

  const handleVerifyOtp = useCallback(async () => {
    if (!emailChangeId) return;
    const code = otp.trim().toUpperCase();
    if (!code || code.length !== 6) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }
    setOtpError(null);
    setLoading(true);
    try {
      const res = await authApi.verifyEmailChangeOtp(emailChangeId, code);
      setMaskedNewEmail((res.maskedNewEmail as string) || maskEmail(newEmail));
      setStep("awaiting-confirm");
      addToast({ title: "Confirmation link sent to new email", type: "success" });
    } catch (err: any) {
      const code = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Verification failed";
      if (code === "too_many_attempts") {
        setOtpError("Too many failed attempts. Please start over.");
        setOtpAttemptsLeft(0);
      } else if (code === "expired") {
        setOtpError("OTP has expired. Please start over.");
      } else {
        setOtpAttemptsLeft(err.data?.attemptsLeft ?? Math.max(0, otpAttemptsLeft - 1));
        setOtpError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [emailChangeId, otp, newEmail, otpAttemptsLeft, addToast]);

  const handleCancel = useCallback(async () => {
    if (!emailChangeId) {
      setStep("enter-email");
      return;
    }
    try {
      await authApi.cancelEmailChange(emailChangeId);
      addToast({ title: "Email change cancelled", type: "info" });
    } catch {
      // ignore
    }
    setStep("enter-email");
    setEmailChangeId(null);
    setOtp("");
    setOtpError(null);
    setNewEmail("");
    setEmailError(null);
    if (pollRef.current) clearInterval(pollRef.current);
  }, [emailChangeId, addToast]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Profile", href: "/settings/profile" }, { label: "Change Email" }]} />
      <SettingsLayout>
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Change Email Address</h1>
            <p className="text-sm text-muted-foreground">Secure 3-step verification to update your SuperAdmin email</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {(["enter-email", "verify-otp", "awaiting-confirm"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : (["verify-otp", "awaiting-confirm"].includes(step) && i < ["enter-email", "verify-otp", "awaiting-confirm"].indexOf(step))
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {(["verify-otp", "awaiting-confirm"].includes(step) && i < ["enter-email", "verify-otp", "awaiting-confirm"].indexOf(step)) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {step === "enter-email" && <Mail className="h-4 w-4" />}
                {step === "verify-otp" && <ShieldCheck className="h-4 w-4" />}
                {step === "awaiting-confirm" && <Clock className="h-4 w-4" />}
                {step === "enter-email" && "Enter new email"}
                {step === "verify-otp" && "Verify OTP"}
                {step === "awaiting-confirm" && "Awaiting confirmation"}
              </CardTitle>
              <CardDescription>
                {step === "enter-email" && "We'll send a verification code to your current email."}
                {step === "verify-otp" && `Enter the 6-digit code sent to ${maskedCurrentEmail}`}
                {step === "awaiting-confirm" && `Check ${maskedNewEmail || maskEmail(newEmail)} for a confirmation link.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === "enter-email" && (
                <>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800">
                      Your current email is <span className="font-semibold">{maskEmail(user?.email || "")}</span>. All steps must be completed within 24 hours.
                    </p>
                  </div>
                  <Input
                    label="New email address"
                    type="email"
                    placeholder="you@company.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError(null);
                    }}
                    error={emailError || undefined}
                    disabled={loading}
                  />
                  <div className="flex items-center gap-3">
                    <Button onClick={handleInitiate} isLoading={loading} disabled={loading || !newEmail.trim()}>
                      Continue
                    </Button>
                    <Button variant="ghost" onClick={() => router.push("/settings/profile")} disabled={loading}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  </div>
                </>
              )}

              {step === "verify-otp" && (
                <>
                  <div className="flex flex-col items-center gap-3 py-2">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(val: string) => {
                        setOtp(val.toUpperCase());
                        setOtpError(null);
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                    <p className="text-xs text-muted-foreground">
                      Code expires in <span className="font-medium">{formatTime(otpExpiry)}</span>
                      {otpAttemptsLeft < 5 && (
                        <span className="ml-2 text-amber-600">{otpAttemptsLeft} attempt(s) left</span>
                      )}
                    </p>
                    {devOtp && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Dev OTP: {devOtp}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={handleVerifyOtp} isLoading={loading} disabled={loading || otp.length !== 6}>
                      Verify &amp; Continue
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {step === "awaiting-confirm" && (
                <>
                  <div className="flex flex-col items-center gap-4 py-4">
                    {completed ? (
                      <>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-green-700">Email changed successfully</p>
                        <p className="text-xs text-muted-foreground text-center max-w-xs">
                          Your primary email has been updated. You will be redirected to login since all sessions were revoked for security.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium">Check your new email</p>
                        <p className="text-xs text-muted-foreground text-center max-w-xs">
                          We've sent a confirmation link to <strong>{maskedNewEmail || maskEmail(newEmail)}</strong>. Click the link to finalize the change.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Waiting for confirmation... ({pollStatus || "checking"})
                        </div>
                      </>
                    )}
                  </div>
                  {!completed && (
                    <div className="flex items-center justify-center">
                      <Button variant="outline" onClick={handleCancel} disabled={loading}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Request
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SettingsLayout>
    </AdminShell>
  );
}
