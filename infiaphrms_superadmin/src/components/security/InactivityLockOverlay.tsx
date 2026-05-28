"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function InactivityLockOverlay({ locked, onUnlocked }: { locked: boolean; onUnlocked: () => void }) {
  if (!locked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-4 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[380px]">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Locked due to inactivity</h1>
              <p className="mt-2 text-sm text-muted-foreground">Your session was paused after a period of inactivity.</p>
            </div>
            <Button onClick={onUnlocked} noMotion className="w-full">
              Go back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
