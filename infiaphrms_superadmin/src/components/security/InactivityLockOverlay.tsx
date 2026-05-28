"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";

export function InactivityLockOverlay({ locked, onUnlocked }: { locked: boolean; onUnlocked: () => void }) {
  const { sendUnlockOtp, verifyUnlockOtp } = useAuth();
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!locked) return null;

  const sendOtp = async () => {
    setLoading(true);
    const res = await sendUnlockOtp();
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setSent(true);
    setEmail(res.email || "");
    setDevOtp(res.devEmailOtp || null);
    toast.success("Unlock OTP sent");
  };

  const verifyOtp = async () => {
    setLoading(true);
    const res = await verifyUnlockOtp(otp);
    setLoading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    onUnlocked();
    toast.success("Session unlocked");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-4 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[420px]">
        <Card>
          <CardContent className="p-6 text-center space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Locked due to inactivity</h1>
              {sent && <p className="mt-2 text-sm text-muted-foreground">Enter the 6-character code sent to {email}.</p>}
            </div>
            {!sent ? (
              <Button onClick={sendOtp} isLoading={loading} disabled={loading} noMotion className="w-full">
                Send OTP to unlock
              </Button>
            ) : (
              <div className="space-y-4">
                {devOtp && <p className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-700">Dev OTP: <span className="font-mono font-bold">{devOtp}</span></p>}
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} inputMode="text" pattern="[A-Z0-9]*">
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
                <Button onClick={verifyOtp} disabled={loading || !/^[A-Z0-9]{6}$/.test(otp.trim().toUpperCase())} isLoading={loading} noMotion className="w-full">
                  {!loading && <ShieldCheck className="mr-2 h-4 w-4" />}
                  Verify
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
