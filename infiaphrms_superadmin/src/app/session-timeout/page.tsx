"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function SessionTimeoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
        <Card>
          <CardContent className="p-6 text-center space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Session Timed Out</h1>
              <p className="mt-2 text-sm text-muted-foreground">Your session expired for security reasons.</p>
            </div>
            <Link href="/login" className="block">
              <Button noMotion className="w-full">Sign in again</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
