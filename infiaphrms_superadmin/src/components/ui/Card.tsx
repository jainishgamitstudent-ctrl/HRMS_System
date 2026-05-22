import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

const MotionDiv = motion.create("div");

export function Card({ children, className, interactive }: CardProps) {
  return (
    <MotionDiv
      className={cn("rounded-xl border border-border bg-card shadow-sm", className)}
      whileHover={interactive ? { y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </MotionDiv>
  );
}

export function CardHeader({ children, className }: Omit<CardProps, "interactive">) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}

export function CardTitle({ children, className }: Omit<CardProps, "interactive">) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: Omit<CardProps, "interactive">) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function CardContent({ children, className }: Omit<CardProps, "interactive">) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
