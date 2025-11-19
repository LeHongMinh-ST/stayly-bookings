"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useAdminNavigation } from "@/hooks/use-admin-navigation";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";
import { useAdminShellStore } from "@/store/admin-shell-store";

/**
 * AdminSidebar renders the hierarchical navigation with permission-aware sections.
 */
export function AdminSidebar() {
  const { groups } = useAdminNavigation();
  const pathname = usePathname();
  const { isSidebarCollapsed } = useAdminShellStore();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen border-r border-border bg-card px-4 py-6 transition-[width] duration-300 lg:flex lg:flex-col",
        isSidebarCollapsed ? "w-20" : "w-72"
      )}
      aria-label="Điều hướng admin"
      data-collapsed={isSidebarCollapsed}
    >
      <Logo compact={isSidebarCollapsed} />
      <div className="mt-8 flex-1 space-y-6 overflow-y-auto">
        {groups.map((group) => (
          <Fragment key={group.title}>
            <p
              className={cn(
                "px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                isSidebarCollapsed && "hidden"
              )}
            >
              {group.title}
            </p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      isSidebarCollapsed
                        ? "justify-center gap-0 px-2"
                        : "gap-3",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    <span className={cn(isSidebarCollapsed && "sr-only")}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </Fragment>
        ))}
      </div>
      <div className="space-y-3">
        <p
          className={cn(
            "text-center text-xs text-muted-foreground",
            isSidebarCollapsed && "hidden"
          )}
        >
          © {new Date().getFullYear()} Stayly Platform
        </p>
      </div>
    </aside>
  );
}
