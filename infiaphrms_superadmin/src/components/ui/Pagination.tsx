import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-4">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-card px-2 text-sm"
        >
          {[10, 20, 50, 100].map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;
            const isNear = Math.abs(page - currentPage) <= 1;
            const isEdge = page === 1 || page === totalPages;
            if (!isNear && !isEdge) {
              if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="px-1">...</span>;
              return null;
            }
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted"
                )}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
