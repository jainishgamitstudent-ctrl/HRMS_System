"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Bell, User, LogOut, Settings, Command } from "lucide-react";
import Link from "next/link";
import { mockNotifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { showConfirm } from "@/lib/sweetalert";
import { API_ORIGIN } from "@/lib/api";

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.97, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, scale: 0.98, y: -2, transition: { duration: 0.1 } },
};

const searchOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const searchPanelVariants = {
  hidden: { opacity: 0, scale: 0.97, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const } },
  exit: { opacity: 0, scale: 0.98, y: -6, transition: { duration: 0.12 } },
};

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [failedAvatarSrc, setFailedAvatarSrc] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const displayName = user?.name || "Super Admin";
  const displayEmail = user?.email || "superadmin@infiap.com";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SA";
  const rawAvatarSrc = user?.profileImage
    ? user.profileImage.startsWith("data:") || user.profileImage.startsWith("http")
      ? user.profileImage
      : `${API_ORIGIN}${user.profileImage}`
    : null;
  const avatarSrc = rawAvatarSrc && rawAvatarSrc !== failedAvatarSrc ? rawAvatarSrc : null;

  return (
    <header className="shrink-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 lg:px-6">
      <div className="flex items-center gap-4 flex-1">
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSearchOpen(true)}
          className="inline-flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-card px-1.5 text-[10px] font-medium">
            <Command className="h-3 w-3" /> K
          </kbd>
        </motion.button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          >
            <Bell className="h-4.5 w-4.5 text-muted-foreground" style={{ width: 18, height: 18 }} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-border bg-card shadow-lg origin-top-right"
                  style={{ willChange: "opacity, transform" }}
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mockNotifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link || "#"}
                        onClick={() => setNotifOpen(false)}
                        className={cn(
                          "flex gap-3 px-4 py-3 hover:bg-muted/50 border-b border-border last:border-0",
                          !n.read && "bg-blue-50/30"
                        )}
                      >
                        <div className={cn(
                          "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                          n.type === "success" && "bg-green-500",
                          n.type === "warning" && "bg-amber-500",
                          n.type === "error" && "bg-red-500",
                          n.type === "info" && "bg-blue-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={displayName}
                className="h-full w-full object-cover"
                onError={() => setFailedAvatarSrc(avatarSrc)}
              />
            ) : (
              initials
            )}
          </motion.button>
          <AnimatePresence>
            {userMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-border bg-card shadow-lg py-1 origin-top-right"
                  style={{ willChange: "opacity, transform" }}
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayEmail}</p>
                  </div>
                  <Link href="/settings/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <div className="border-t border-border my-1" />
                  <button onClick={async () => {
                    const result = await showConfirm("Log out?", "You will be signed out of the SuperAdmin dashboard.", "Log out", "Cancel");
                    if (result.isConfirmed) logout();
                  }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            variants={searchOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
            <motion.div
              variants={searchPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative z-10 w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl"
              style={{ willChange: "opacity, transform" }}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Search companies, admins, reports..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="inline-flex h-6 items-center rounded border bg-muted px-1.5 text-[10px] font-medium">ESC</kbd>
              </div>
              <div className="px-4 py-3 text-xs text-muted-foreground">
                <p>Try searching for &quot;Acme Corp&quot;, &quot;admin@example.com&quot;, or &quot;billing report&quot;</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
