"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { Mail, ShieldCheck, Loader2, ArrowRight, Lock, RefreshCw } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const SUPERADMIN_EMAIL = "mriya0619@gmail.com";
const OTP_REQUESTS_KEY = "infiap_superadmin_otp_requests";
const MAX_FRONTEND_REQUESTS = 5;
const FRONTEND_WINDOW_MS = 60 * 60 * 1000;

interface OtpRequestLog {
  timestamps: number[];
}

function getRequestLog(): OtpRequestLog {
  if (typeof window === "undefined") return { timestamps: [] };
  try {
    const raw = localStorage.getItem(OTP_REQUESTS_KEY);
    if (!raw) return { timestamps: [] };
    return JSON.parse(raw) as OtpRequestLog;
  } catch {
    return { timestamps: [] };
  }
}

function pushRequestLog() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const log = getRequestLog();
  const windowStart = now - FRONTEND_WINDOW_MS;
  const filtered = log.timestamps.filter((t) => t > windowStart);
  filtered.push(now);
  localStorage.setItem(OTP_REQUESTS_KEY, JSON.stringify({ timestamps: filtered }));
}

function canRequestFrontend(): boolean {
  const log = getRequestLog();
  const windowStart = Date.now() - FRONTEND_WINDOW_MS;
  const recent = log.timestamps.filter((t) => t > windowStart);
  return recent.length < MAX_FRONTEND_REQUESTS;
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, sendOtp, verifyOtp } = useAuth();

  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  const canVerify = emailOtp.length === 6;

  const handleSendOtp = async () => {
    if (!canRequestFrontend()) {
      toast.error("Too many OTP requests. Please try again in an hour.");
      return;
    }
    setLoading(true);
    const res = await sendOtp();
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    pushRequestLog();
    setOtpSent(true);
    setCountdown(60);
    if (res.devEmailOtp) {
      setDevOtp(res.devEmailOtp);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    const res = await verifyOtp(emailOtp);
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Login successful!");
    router.replace("/");
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    if (!canRequestFrontend()) {
      toast.error("Too many OTP requests. Please try again in an hour.");
      return;
    }
    setLoading(true);
    const res = await sendOtp();
    setLoading(false);
    if (res.success) {
      pushRequestLog();
      setCountdown(60);
      toast.success("OTP resent. Check your email.");
      setEmailOtp("");
      if (res.devEmailOtp) {
        setDevOtp(res.devEmailOtp);
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center"
          >
            <Lock className="w-6 h-6 text-primary-foreground" />
          </motion.div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-2xl font-semibold tracking-tight"
          >
            SuperAdmin Login
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mt-1"
          >
            Secure access to InfiAP HRMS
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              {!otpSent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-lg border bg-muted/50 p-4"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    OTP will be sent to
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{SUPERADMIN_EMAIL}</span>
                  </div>
                </motion.div>
              )}

              {!otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Button
                    onClick={handleSendOtp}
                    disabled={loading}
                    isLoading={loading}
                    noMotion
                    className="w-full"
                  >
                    {!loading && <ArrowRight className="h-4 w-4 mr-2" />}
                    Send OTP
                  </Button>
                </motion.div>
              )}

              <AnimatePresence>
                {otpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {devOtp && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center"
                      >
                        <p className="text-xs font-medium text-yellow-700 mb-2 uppercase tracking-wider">
                          Dev Mode — Use this OTP
                        </p>
                        <p className="text-2xl font-mono font-bold text-yellow-700 tracking-[0.3em]">
                          {devOtp}
                        </p>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">OTP Sent</p>
                        <p className="text-xs text-green-600">Check {SUPERADMIN_EMAIL}</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Enter 6-digit OTP
                      </Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={emailOtp}
                          onChange={setEmailOtp}
                          autoFocus
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
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={loading || !canVerify}
                        isLoading={loading}
                        noMotion
                        className="w-full"
                      >
                        {!loading && <ArrowRight className="h-4 w-4 mr-2" />}
                        Verify & Login
                      </Button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-between"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        noMotion
                        onClick={() => {
                          setOtpSent(false);
                          setEmailOtp("");
                          setCountdown(0);
                          setDevOtp(null);
                        }}
                        className="px-0 h-auto text-muted-foreground hover:text-foreground"
                      >
                        Back
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        noMotion
                        onClick={handleResend}
                        disabled={countdown > 0 || loading}
                        className="px-0 h-auto flex items-center gap-1.5 text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:pointer-events-none"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", countdown > 0 && "animate-spin")} />
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Protected by enterprise-grade security
        </motion.p>
      </motion.div>
    </div>
  );
}
