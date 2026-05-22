"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence } from "framer-motion";

export type DatePickerProps = {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={popoverRef} className={cn("relative inline-block", className)}>
      <Button
        variant="outline"
        noMotion
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : placeholder}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 rounded-lg border border-input bg-card p-3 shadow-lg"
          >
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(selected) => {
                onSelect?.(selected);
                if (selected) setOpen(false);
              }}
              disabled={disabled}
              className={cn(
                "p-0",
                "[&_.rdp-day_button]:h-9 [&_.rdp-day_button]:w-9 [&_.rdp-day_button]:rounded-md [&_.rdp-day_button]:text-sm",
                "[&_.rdp-day_button:hover]:bg-muted",
                "[&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-day_button.rdp-day_selected]:text-primary-foreground",
                "[&_.rdp-day_button.rdp-day_selected:hover]:bg-primary [&_.rdp-day_button.rdp-day_selected:hover]:text-primary-foreground",
                "[&_.rdp-day_button.rdp-day_today]:bg-accent [&_.rdp-day_button.rdp-day_today]:text-accent-foreground",
                "[&_.rdp-caption]:flex [&_.rdp-caption]:items-center [&_.rdp-caption]:justify-between [&_.rdp-caption]:px-1 [&_.rdp-caption]:pb-2",
                "[&_.rdp-caption_label]:text-sm [&_.rdp-caption_label]:font-medium",
                "[&_.rdp-nav_button]:inline-flex [&_.rdp-nav_button]:h-7 [&_.rdp-nav_button]:w-7 [&_.rdp-nav_button]:items-center [&_.rdp-nav_button]:justify-center [&_.rdp-nav_button]:rounded-md [&_.rdp-nav_button]:text-muted-foreground [&_.rdp-nav_button:hover]:bg-muted",
                "[&_.rdp-head_cell]:w-9 [&_.rdp-head_cell]:pb-1 [&_.rdp-head_cell]:text-xs [&_.rdp-head_cell]:font-normal [&_.rdp-head_cell]:text-muted-foreground",
                "[&_.rdp-month]:w-full [&_.rdp-month]:space-y-2",
                "[&_.rdp-table]:w-full [&_.rdp-table]:border-collapse",
                "[&_.rdp-cell]:px-0 [&_.rdp-cell]:py-0.5 [&_.rdp-cell]:text-center"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
