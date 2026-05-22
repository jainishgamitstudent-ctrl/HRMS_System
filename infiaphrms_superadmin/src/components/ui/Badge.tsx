import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary";
  className?: string;
  animate?: boolean;
}

const MotionSpan = motion.create("span");

export function Badge({ children, variant = "default", className, animate }: BadgeProps) {
  return (
    <MotionSpan
      initial={animate ? { scale: 0.85, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        variant === "default" && "bg-muted text-muted-foreground border-border",
        variant === "success" && "bg-green-50 text-green-700 border-green-200",
        variant === "warning" && "bg-amber-50 text-amber-700 border-amber-200",
        variant === "error" && "bg-red-50 text-red-700 border-red-200",
        variant === "info" && "bg-blue-50 text-blue-700 border-blue-200",
        variant === "secondary" && "bg-slate-50 text-slate-700 border-slate-200",
        className
      )}
    >
      {children}
    </MotionSpan>
  );
}
