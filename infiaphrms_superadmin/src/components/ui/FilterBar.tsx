"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  children: React.ReactNode;
  activeFilters: FilterChip[];
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterBar({ children, activeFilters, onClearFilter, onClearAll, className }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
          <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
          Filters
        </Button>
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </div>

      {expanded && (
        <div className="rounded-lg border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {children}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
            >
              {filter.label}: {filter.value}
              <button onClick={() => onClearFilter(filter.key)} className="hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
