"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useGeolocationGate } from "@/hooks/useGeolocationGate";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "sonner";

type PunchType = "in" | "out";

export interface CheckInOutPanelProps {
  onPunch: (payload: {
    type: PunchType;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    address: string;
    city: string;
    state: string;
    country: string;
  }) => Promise<void>;
  disabled?: boolean;
}

export function CheckInOutPanel({ onPunch, disabled }: CheckInOutPanelProps) {
  const [submitting, setSubmitting] = useState<PunchType | null>(null);
  const {
    status,
    permissionState,
    coords,
    error,
    attempts,
    elapsed,
    requestLocation,
    isReady,
    isBlocked,
    address,
    addressError,
    addressLoading,
  } = useGeolocationGate();

  const handlePunch = async (type: PunchType) => {
    if (disabled || submitting) return;

    if (!isReady || !coords) {
      requestLocation();
      return;
    }

    setSubmitting(type);

    try {
      await onPunch({
        type,
        latitude: coords.lat,
        longitude: coords.lng,
        accuracy: coords.accuracy,
        timestamp: coords.ts,
        address: address?.formatted || "",
        city: address?.city || "",
        state: address?.state || "",
        country: address?.country || "",
      });
      toast.success(type === "in" ? "Checked in successfully" : "Checked out successfully");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Attendance Failed",
        text: err?.message || `Unable to record ${type === "in" ? "check-in" : "check-out"}.`,
        confirmButtonText: "Retry",
        showCancelButton: true,
        cancelButtonText: "Close",
        customClass: {
          confirmButton: "bg-primary text-primary-foreground px-4 py-2 rounded-md",
          cancelButton: "px-4 py-2 rounded-md",
        },
        buttonsStyling: false,
      }).then((result) => {
        if (result.isConfirmed) {
          handlePunch(type);
        }
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-5">
        {/* Location Status Indicator */}
        <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Location Status
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                permissionState === "granted"
                  ? "bg-green-100 text-green-700"
                  : permissionState === "denied"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {permissionState}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-amber-700"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>
                  Detecting… {attempts > 0 ? `attempt ${attempts}` : ""} {" "}
                  {(elapsed / 1000).toFixed(1)}s
                </span>
              </motion.div>
            )}

            {isBlocked && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 text-xs text-red-700"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{error?.message}</p>
                  <button
                    onClick={() => requestLocation()}
                    className="font-medium underline hover:text-red-800"
                  >
                    Retry location
                  </button>
                </div>
              </motion.div>
            )}

            {isReady && coords && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>Accuracy: ±{Math.round(coords.accuracy)}m</span>
                  <span>•</span>
                  <span>Updated {new Date(coords.ts).toLocaleTimeString()}</span>
                </div>

                {/* Address */}
                {addressLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Fetching address…
                  </div>
                )}
                {address && !addressLoading && (
                  <div className="rounded-md bg-green-50/40 border border-green-100 px-2.5 py-1.5">
                    <p className="text-[10px] text-green-800 font-medium leading-relaxed">
                      {address.formatted}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {address.city && (
                        <span className="text-[9px] text-green-700 bg-green-100 px-1 py-0.5 rounded">
                          {address.city}
                        </span>
                      )}
                      {address.state && (
                        <span className="text-[9px] text-green-700 bg-green-100 px-1 py-0.5 rounded">
                          {address.state}
                        </span>
                      )}
                      {address.country && (
                        <span className="text-[9px] text-green-700 bg-green-100 px-1 py-0.5 rounded">
                          {address.country}
                        </span>
                      )}
                    </div>
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
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handlePunch("in")}
            disabled={disabled || !!submitting || status === "loading"}
            isLoading={submitting === "in" || (status === "loading" && !submitting)}
            className="w-full"
          >
            {status === "loading" && !submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Locating…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Check In
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => handlePunch("out")}
            disabled={disabled || !!submitting || status === "loading"}
            isLoading={submitting === "out" || (status === "loading" && !submitting)}
            className="w-full"
          >
            {status === "loading" && !submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Locating…
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4 mr-2" />
                Check Out
              </>
            )}
          </Button>
        </div>

        {isBlocked && (
          <p className="text-[10px] text-muted-foreground text-center">
            Location permission is required for attendance verification.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
