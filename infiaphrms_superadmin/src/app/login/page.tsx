"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useGeolocationGate } from "@/hooks/useGeolocationGate";
import { openBrowserLocationHelp } from "@/lib/geolocation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import {
  Mail,
  Smartphone,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Lock,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const SUPERADMIN_EMAIL = "mriya0619@gmail.com";
const SUPERADMIN_PHONE = "+91 9979720864";
const OTP_REQUESTS_KEY = "infiap_superadmin_otp_requests";
const MAX_FRONTEND_REQUESTS = 5;
const FRONTEND_WINDOW_MS = 60 * 60 * 1000;

type Step = "send" | "verify" | "done";

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

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatShortAddress(address: {
  neighbourhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formatted?: string;
}): string {
  const parts = [address.neighbourhood, address.city, address.state, address.country, address.postalCode]
    .filter((part): part is string => Boolean(part));

  return parts.join(", ") || address.formatted || "Address detected";
}

function LocationErrorBanner({
  geoStatus,
  geoError,
  permissionState,
  onRetry,
}: {
  geoStatus: "denied" | "error" | "unavailable";
  geoError: { code: string; message: string } | null;
  permissionState: string;
  onRetry: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const help = openBrowserLocationHelp();

  const isUnavailable = geoStatus === "unavailable";
  const isDenied = geoStatus === "denied";
  const code = geoError?.code ?? "UNKNOWN";

  let title = "Location access required";
  let message = geoError?.message || "Unable to detect location. Please check your device settings and try again.";

  if (isUnavailable) {
    title = code === "INSECURE_CONTEXT" ? "HTTPS required" : "Location not supported";
    message =
      code === "INSECURE_CONTEXT"
        ? "Location requires HTTPS. Please open this site on HTTPS."
        : "Your browser does not support geolocation. Please use Chrome, Edge, or Safari on HTTPS.";
  } else if (isDenied) {
    title = "Location permission denied";
    message = "Location permission was denied. Please enable it in your browser site settings and retry.";
  } else if (code === "POSITION_UNAVAILABLE") {
    title = "Location unavailable";
    message = "Location unavailable. Turn on GPS/Wi-Fi, disable VPN, and try again.";
  } else if (code === "TIMEOUT" && permissionState === "prompt") {
    title = "Waiting for permission";
    message = "Click 'Allow' in the browser prompt to share your location. If no prompt appeared, check your browser settings.";
  } else if (code === "TIMEOUT") {
    title = "Location timed out";
    message = "Timed out. Move near a window or try again with low accuracy mode.";
  } else if (code === "INSECURE_CONTEXT") {
    title = "HTTPS required";
    message = "Location requires HTTPS. Please open this site on HTTPS.";
  }

  const isRetryable = !isUnavailable && code !== "INSECURE_CONTEXT";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3"
    >
      <MapPin className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <div className="space-y-2 flex-1">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-red-800">{title}</p>
          <p className="text-xs text-red-700">{message}</p>
        </div>

        {isRetryable && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-800 underline hover:text-red-900"
            >
              <RefreshCw className="h-3 w-3" />
              Retry location access
            </button>
            <button
              onClick={() => setShowHelp((s) => !s)}
              className="text-xs font-medium text-red-700 hover:text-red-800"
            >
              {showHelp ? "Hide help" : "Need help?"}
            </button>
          </div>
        )}

        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-md bg-white border border-red-100 p-3 space-y-1.5"
          >
            <p className="text-xs font-semibold text-red-800">{help.title}</p>
            <ol className="text-[11px] text-red-700 space-y-0.5 list-decimal list-inside">
              {help.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {permissionState === "prompt" && (
              <div className="mt-1 space-y-1">
                <p className="text-[10px] text-red-600">
                  If the browser prompt does not appear:
                </p>
                <ul className="text-[10px] text-red-600 space-y-0.5 list-disc list-inside">
                  <li>Chrome / Edge: click the lock icon in the address bar → Site settings → Location → Allow.</li>
                  <li>Safari: Settings → Privacy → Location Services → enable for this browser.</li>
                  <li>iOS: Settings → Privacy & Security → Location Services → enable for Safari/Chrome.</li>
                </ul>
              </div>
            )}
            {isDenied && (
              <p className="text-[10px] text-red-600 mt-1">
                Chrome / Edge: click the lock icon → Site settings → Location → Allow.
                Safari: Preferences → Websites → Location → Allow.
              </p>
            )}
          </motion.div>
        )}

        <span className="text-[10px] text-red-500/80">Permission: {permissionState}</span>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, sendOtp, verifyEmailOtp, verifyPhoneOtp, completeLogin, sendRecoveryOtp, verifyRecoveryOtp } = useAuth();

  const [step, setStep] = useState<Step>("send");
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [devRecoveryOtp, setDevRecoveryOtp] = useState<string | null>(null);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [devEmailOtp, setDevEmailOtp] = useState<string | null>(null);
  const [devPhoneOtp, setDevPhoneOtp] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");

  // Geolocation gate (compulsory for security)
  const {
    status: geoStatus,
    permissionState,
    coords: geoCoords,
    error: geoError,
    attempts,
    elapsed,
    requestLocation,
    isReady,
    address,
    addressError,
    addressLoading,
  } = useGeolocationGate();

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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => setLockRemaining(Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const isEmailOtpValid = /^[A-Z0-9]{6}$/.test(emailOtp.trim().toUpperCase());
  const isPhoneOtpValid = /^\d{6}$/.test(phoneOtp.trim());
  const isEmailExpired = countdown === 0 && step === "verify" && !emailVerified;
  const isPhoneExpired = countdown === 0 && step === "verify" && !phoneVerified;

  const handleSendOtp = async () => {
    if (cooldown > 0) {
      toast.error(`Please wait ${formatTime(cooldown)} before requesting another OTP`);
      return;
    }
    if (!canRequestFrontend()) {
      toast.error("Too many OTP requests. Please try again in an hour.");
      return;
    }
    // Record the attempt immediately so rapid clicks cannot bypass the limit
    pushRequestLog();
    setLoading(true);
    const res = await sendOtp();
    setLoading(false);
    if (!res.success) {
      if (res.locked) {
        setLockedUntil(res.lockedUntil || "2099-01-01T00:00:00.000Z");
        setLockRemaining(res.remainingSeconds || 30 * 60);
        return;
      }
      toast.error(res.message);
      return;
    }
    setStep("verify");
    setCountdown(res.expiresInSeconds || 60);
    setCooldown(res.cooldownSeconds || 60);
    setMaskedEmail(res.email || "");
    setMaskedPhone(res.phone || "");
    setEmailVerified(false);
    setPhoneVerified(false);
    setEmailOtp("");
    setPhoneOtp("");
    if (res.devEmailOtp) setDevEmailOtp(res.devEmailOtp);
    if (res.devPhoneOtp) setDevPhoneOtp(res.devPhoneOtp);
    toast.success("OTPs sent to email and phone");
  };

  const handleResendEmail = async () => {
    if (cooldown > 0) {
      toast.error(`Please wait ${formatTime(cooldown)} before resending`);
      return;
    }
    await handleSendOtp();
  };

  const handleResendPhone = async () => {
    if (cooldown > 0) {
      toast.error(`Please wait ${formatTime(cooldown)} before resending`);
      return;
    }
    await handleSendOtp();
  };

  const handleVerifyEmail = async () => {
    if (!isEmailOtpValid) return;
    setLoading(true);
    const res = await verifyEmailOtp(emailOtp);
    setLoading(false);
    if (!res.success) {
      if (res.locked) {
        setLockedUntil(res.lockedUntil || "2099-01-01T00:00:00.000Z");
        setLockRemaining(res.remainingSeconds || 30 * 60);
        return;
      }
      toast.error(res.message);
      return;
    }
    setEmailVerified(true);
    if (res.phoneVerified) setPhoneVerified(true);
    toast.success("Email OTP verified");
    if (res.phoneVerified) {
      handleCompleteLogin();
    }
  };

  const handleVerifyPhone = async () => {
    if (!isPhoneOtpValid) return;
    setLoading(true);
    const res = await verifyPhoneOtp(phoneOtp);
    setLoading(false);
    if (!res.success) {
      if (res.locked) {
        setLockedUntil(res.lockedUntil || "2099-01-01T00:00:00.000Z");
        setLockRemaining(res.remainingSeconds || 30 * 60);
        return;
      }
      toast.error(res.message);
      return;
    }
    setPhoneVerified(true);
    if (res.emailVerified) setEmailVerified(true);
    toast.success("Phone OTP verified");
    if (res.emailVerified) {
      handleCompleteLogin();
    }
  };

  const handleCompleteLogin = useCallback(async () => {
    if (geoStatus === "loading") {
      toast.info("Still detecting your location. Please wait a moment and try again.");
      return;
    }
    if (!isReady || !geoCoords) {
      // Auto-trigger location request so the user gets a browser prompt on click
      requestLocation();
      return;
    }
    setLoading(true);
    const res = await completeLogin({
      latitude: geoCoords.lat,
      longitude: geoCoords.lng,
      address: address?.formatted,
      city: address?.city,
      state: address?.state,
      country: address?.country,
    });
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    if (res.nextStep === "DONE") {
      setStep("done");
      toast.success("Login successful!");
      router.replace("/");
    }
  }, [completeLogin, router, geoStatus, isReady, geoCoords, address, requestLocation]);

  const handleSendRecovery = async () => {
    setLoading(true);
    const res = await sendRecoveryOtp();
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setRecoverySent(true);
    setRecoveryEmail(res.email || "");
    setDevRecoveryOtp(res.devEmailOtp || null);
    toast.success("Recovery OTP sent");
  };

  const handleVerifyRecovery = async () => {
    if (!/^[A-Z0-9]{6}$/.test(recoveryOtp.trim().toUpperCase())) return;
    setLoading(true);
    const res = await verifyRecoveryOtp(recoveryOtp);
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success("Access recovered");
    router.replace("/superadmin/dashboard");
  };


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  if (lockedUntil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px]">
          <Card>
            <CardContent className="p-6 space-y-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Account Locked</h1>
                <p className="mt-2 text-sm text-muted-foreground">Too many attempts. Try again in 30 minutes.</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Unlocks in</p>
                <p className="mt-1 font-mono text-3xl font-semibold">{formatTime(lockRemaining)}</p>
              </div>
              {!recoverySent ? (
                <Button onClick={handleSendRecovery} disabled={loading} isLoading={loading} noMotion className="w-full">
                  Recover Access
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Enter the recovery code sent to {recoveryEmail}</p>
                  {devRecoveryOtp && <p className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-700">Dev OTP: <span className="font-mono font-bold">{devRecoveryOtp}</span></p>}
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={recoveryOtp} onChange={setRecoveryOtp} inputMode="text" pattern="[A-Z0-9]*">
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
                  <Button onClick={handleVerifyRecovery} disabled={loading || !/^[A-Z0-9]{6}$/.test(recoveryOtp.trim().toUpperCase())} isLoading={loading} noMotion className="w-full">
                    Verify Recovery OTP
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { label: "Send OTPs", done: step !== "send" },
    { label: "Verify", done: emailVerified && phoneVerified },
    { label: "Done", done: step === "done" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[480px]"
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
            Two-factor verification required
          </motion.p>
        </div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  s.done
                    ? "bg-green-100 text-green-700"
                    : i === (step === "send" ? 0 : step === "verify" ? 1 : 2)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-3.5 w-3.5 flex items-center justify-center text-[10px]">{i + 1}</span>
                )}
                {s.label}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-6 h-px", s.done ? "bg-green-300" : "bg-border")} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Geolocation status banner */}
              {geoStatus === "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3"
                >
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-blue-800">Location access required</p>
                      <p className="text-xs text-blue-700">
                        Your location helps us verify your identity and detect suspicious login activity.
                      </p>
                    </div>
                    <button
                      onClick={() => requestLocation()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Request Location Access
                    </button>
                    {permissionState === "prompt" && (
                      <p className="text-[10px] text-blue-600">
                        A browser prompt will appear. Click <strong>Allow</strong> to share your location.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {geoStatus === "loading" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3"
                >
                  <Loader2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-semibold text-amber-800">Detecting your location…</p>
                    <p className="text-xs text-amber-700">
                      Please allow the browser to access your location for secure login.
                      {attempts > 0 && (
                        <span className="ml-1">Attempt {attempts} · {(elapsed / 1000).toFixed(1)}s</span>
                      )}
                    </p>
                    {permissionState === "prompt" && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-amber-700 font-medium">
                          Click <strong>Allow</strong> in the browser prompt to share your location.
                        </p>
                        <p className="text-[10px] text-amber-600">
                          If no prompt appeared: Chrome/Edge → lock icon → Site settings → Location → Allow. Safari → Preferences → Websites → Location → Allow.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {(geoStatus === "denied" || geoStatus === "error" || geoStatus === "unavailable") && (
                <LocationErrorBanner
                  geoStatus={geoStatus}
                  geoError={geoError}
                  permissionState={permissionState}
                  onRetry={() => requestLocation()}
                />
              )}

              {/* Geo coordinates + address (shown when granted) */}
              {geoStatus === "granted" && geoCoords && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-2"
                >
                  {/* Coordinates chip */}
                  <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1.5 w-fit">
                    <MapPin className="h-3.5 w-3.5 text-green-700" />
                    <span className="text-xs text-green-700 font-medium">
                      {geoCoords.lat.toFixed(4)}, {geoCoords.lng.toFixed(4)}
                    </span>
                    {geoCoords.accuracy > 0 && (
                      <span className="text-[10px] text-green-600">±{Math.round(geoCoords.accuracy)}m</span>
                    )}
                  </div>

                  {/* Address */}
                  {addressLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Fetching address…
                    </div>
                  )}
                  {address && !addressLoading && (
                    <div className="rounded-md bg-green-50/50 border border-green-100 px-3 py-2">
                      <p className="text-xs text-green-800 font-medium leading-relaxed">
                        {formatShortAddress(address)}
                      </p>
                    </div>
                  )}
                  {addressError && !addressLoading && (
                    <div className="flex items-center gap-2 text-xs text-amber-700">
                      <AlertCircle className="h-3 w-3" />
                      <span>Address unavailable</span>
                      <button
                        onClick={() => requestLocation()}
                        className="underline hover:text-amber-800"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {/* STEP 0: Send OTPs */}
                {step === "send" && (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Verification will be sent to
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{SUPERADMIN_EMAIL}</p>
                          <p className="text-xs text-muted-foreground">Email OTP (alphanumeric)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{SUPERADMIN_PHONE.replace(/\d(?=\d{4})/g, "*")}</p>
                          <p className="text-xs text-muted-foreground">SMS OTP (numeric)</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendOtp}
                      disabled={loading || !isReady}
                      isLoading={loading}
                      noMotion
                      className="w-full"
                    >
                      {!loading && <ArrowRight className="h-4 w-4 mr-2" />}
                      {geoStatus === "loading" ? "Detecting location…" : isReady ? "Send OTPs" : "Location required"}
                    </Button>
                  </motion.div>
                )}

                {/* STEP 1: Verify */}
                {step === "verify" && (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* Timer */}
                    <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 p-3">
                      <Clock className={cn("h-4 w-4", countdown > 0 ? "text-primary" : "text-red-500")} />
                      <span className={cn("text-sm font-medium", countdown > 0 ? "text-foreground" : "text-red-500")}>
                        {countdown > 0 ? `Expires in ${formatTime(countdown)}` : "OTP expired"}
                      </span>
                    </div>

                    {/* Dev OTPs */}
                    {devEmailOtp && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center">
                        <p className="text-[10px] font-medium text-yellow-700 uppercase tracking-wider">Dev Mode</p>
                        <p className="text-xs text-yellow-700 mt-1">Email: <span className="font-mono font-bold">{devEmailOtp}</span></p>
                        <p className="text-xs text-yellow-700">Phone: <span className="font-mono font-bold">{devPhoneOtp}</span></p>
                      </div>
                    )}

                    {/* Email OTP Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Email OTP
                        </Label>
                        {emailVerified ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : isEmailExpired ? (
                          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </div>

                      {!emailVerified && (
                        <>
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={6}
                              value={emailOtp}
                              onChange={setEmailOtp}
                              autoFocus
                              inputMode="text"
                              pattern="[A-Z0-9]*"
                              disabled={isEmailExpired}
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
                          <Button
                            onClick={handleVerifyEmail}
                            disabled={loading || !isEmailOtpValid || isEmailExpired}
                            isLoading={loading}
                            noMotion
                            className="w-full"
                            variant="secondary"
                          >
                            {!loading && <ShieldCheck className="h-4 w-4 mr-2" />}
                            Verify Email OTP
                          </Button>
                          {isEmailExpired && (
                            <Button
                              variant="ghost"
                              size="sm"
                              noMotion
                              onClick={handleResendEmail}
                              disabled={cooldown > 0 || loading}
                              className="w-full text-primary"
                            >
                              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", cooldown > 0 && "animate-spin")} />
                              {cooldown > 0 ? `Resend in ${formatTime(cooldown)}` : "Resend Email OTP"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Phone OTP Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Phone OTP
                        </Label>
                        {phoneVerified ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : isPhoneExpired ? (
                          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" /> Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </div>

                      {!phoneVerified && (
                        <>
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={6}
                              value={phoneOtp}
                              onChange={setPhoneOtp}
                              inputMode="numeric"
                              pattern="\d*"
                              disabled={isPhoneExpired}
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
                          <Button
                            onClick={handleVerifyPhone}
                            disabled={loading || !isPhoneOtpValid || isPhoneExpired}
                            isLoading={loading}
                            noMotion
                            className="w-full"
                            variant="secondary"
                          >
                            {!loading && <ShieldCheck className="h-4 w-4 mr-2" />}
                            Verify Phone OTP
                          </Button>
                          {isPhoneExpired && (
                            <Button
                              variant="ghost"
                              size="sm"
                              noMotion
                              onClick={handleResendPhone}
                              disabled={cooldown > 0 || loading}
                              className="w-full text-primary"
                            >
                              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", cooldown > 0 && "animate-spin")} />
                              {cooldown > 0 ? `Resend in ${formatTime(cooldown)}` : "Resend Phone OTP"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Complete Login */}
                    {emailVerified && phoneVerified && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Button
                          onClick={handleCompleteLogin}
                          disabled={loading || !isReady}
                          isLoading={loading}
                          noMotion
                          className="w-full"
                        >
                          {!loading && <ArrowRight className="h-4 w-4 mr-2" />}
                          {geoStatus === "loading" ? "Detecting location…" : isReady ? "Complete Login" : "Location required"}
                        </Button>
                      </motion.div>
                    )}

                    {/* Back */}
                    <Button
                      variant="ghost"
                      size="sm"
                      noMotion
                      onClick={() => {
                        setStep("send");
                        setEmailOtp("");
                        setPhoneOtp("");
                        setCountdown(0);
                        setCooldown(0);
                        setEmailVerified(false);
                        setPhoneVerified(false);
                        setDevEmailOtp(null);
                        setDevPhoneOtp(null);
                      }}
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      Back to Start
                    </Button>
                  </motion.div>
                )}

                {/* STEP: Done */}
                {step === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Login Successful</h3>
                      <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard...</p>
                    </div>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
