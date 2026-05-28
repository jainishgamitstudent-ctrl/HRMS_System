"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInactivityLock } from "@/hooks/useInactivityLock";
import { InactivityLockOverlay } from "@/components/security/InactivityLockOverlay";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const inactivity = useInactivityLock(isAuthenticated);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn(collapsed ? "lg:ml-16" : "lg:ml-64", "flex flex-col h-full")}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
      <InactivityLockOverlay locked={inactivity.locked} onUnlocked={inactivity.unlock} />
    </div>
  );
}
