"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function EmailChangeConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            router.push("/login");
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, router]);

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        {isSuccess ? (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight">Email changed</h1>
              <p className="text-sm text-muted-foreground">
                Your primary email address has been updated successfully. All active sessions have been revoked for security.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to login in {countdown}s...
            </div>
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Go to login now
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight">Invalid or expired link</h1>
              <p className="text-sm text-muted-foreground">
                This confirmation link is invalid or has expired. Please start the email change process again from your settings.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Go to login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
