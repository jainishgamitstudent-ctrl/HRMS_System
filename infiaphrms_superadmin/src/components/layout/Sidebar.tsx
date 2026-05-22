"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAV } from "@/lib/constants";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out will-change-transform backface-hidden flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Building2 className="h-6 w-6 shrink-0 text-primary" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="ml-2 text-sm font-bold tracking-tight truncate whitespace-nowrap overflow-hidden"
            >
              InfiAP HRMS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {SIDEBAR_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <motion.div whileHover={{ scale: isActive ? 1 : 1.1 }} transition={{ duration: 0.15 }}>
                  <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                </motion.div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.12 }}
                      className="truncate whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              {!collapsed && item.children && isActive && (
                <div className="ml-7 mt-0.5 space-y-0.5">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm transition-colors",
                          childActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-full items-center justify-center rounded-md hover:bg-accent"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={collapsed ? "right" : "left"}
              initial={{ opacity: 0, x: collapsed ? -4 : 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: collapsed ? 4 : -4 }}
              transition={{ duration: 0.12 }}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
    </aside>
  );
}
