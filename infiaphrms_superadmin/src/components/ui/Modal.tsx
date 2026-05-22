"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.12 } },
};

export function Modal({ isOpen, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            style={{ willChange: "opacity" }}
          />
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 w-full rounded-xl border border-border bg-card shadow-2xl",
              size === "sm" && "max-w-sm",
              size === "md" && "max-w-lg",
              size === "lg" && "max-w-2xl",
              size === "xl" && "max-w-4xl"
            )}
            style={{ willChange: "opacity, transform" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="rounded-md p-1 hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 rounded-b-xl">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
