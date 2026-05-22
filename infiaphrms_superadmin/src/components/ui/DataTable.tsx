"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

const MotionTr = motion.create("tr");
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const } },
};

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable,
  selectedIds = [],
  onSelect,
  onSelectAll,
  emptyState,
  isLoading,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(keyExtractor(row)));

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-border last:border-0">
              {Array.from({ length: columns.length }).map((_, j) => (
                <div key={j} className="h-4 bg-muted rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left font-medium text-muted-foreground",
                    col.sortable && "cursor-pointer select-none hover:text-foreground",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-border"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {data.map((row) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds.includes(id);
              return (
                <MotionTr
                  key={id}
                  variants={rowVariants}
                  className={cn(
                    "transition-colors duration-150 hover:bg-muted/30",
                    isSelected && "bg-blue-50/50"
                  )}
                  style={{ willChange: "opacity, transform" }}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect?.(id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </MotionTr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
