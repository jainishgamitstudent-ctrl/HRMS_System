import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  noMotion?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, noMotion, children, disabled, ...props }, ref) => {
    const baseClass = cn(
      "inline-flex items-center justify-center rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && "bg-primary text-primary-foreground",
      variant === "secondary" && "bg-accent text-accent-foreground",
      variant === "outline" && "border border-input bg-card",
      variant === "ghost" && "",
      variant === "destructive" && "bg-red-600 text-white",
      size === "sm" && "h-8 px-3 text-xs",
      size === "md" && "h-9 px-4 text-sm",
      size === "lg" && "h-10 px-6 text-sm",
      className
    );

    const content = (
      <>
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </>
    );

    if (noMotion) {
      return (
        <button ref={ref} disabled={disabled || isLoading} className={baseClass} {...props}>
          {content}
        </button>
      );
    }

    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="inline-block"
        style={{ willChange: "transform" }}
      >
        <button ref={ref} disabled={disabled || isLoading} className={baseClass} {...props}>
          {content}
        </button>
      </motion.div>
    );
  }
);
Button.displayName = "Button";
