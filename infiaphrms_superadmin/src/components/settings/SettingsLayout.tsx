"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Shield, Bell, Megaphone, Wrench, Settings } from "lucide-react";

const settingsNav = [
  { id: "profile", label: "Profile", href: "/settings/profile", icon: User },
  { id: "security", label: "Security", href: "/settings/security", icon: Shield },
  { id: "notifications", label: "Notifications", href: "/settings/notifications", icon: Bell },
  { id: "announcements", label: "Announcements", href: "/settings/announcements", icon: Megaphone },
  { id: "maintenance", label: "Maintenance", href: "/settings/maintenance", icon: Wrench },
  { id: "platform", label: "Platform Config", href: "/settings/platform", icon: Settings },
];

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <nav className="lg:w-56 shrink-0">
        <div className="sticky top-20 space-y-0.5">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
