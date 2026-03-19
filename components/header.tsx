"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  Sparkles,
  Menu,
  Command,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTranslation } from "@/hooks";
import { useSidebarStore } from "@/stores/sidebar";
import { useThemeStore } from "@/stores/theme";
import { LanguageSwitcher } from "./LanguageSwitcher";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/servers": "Servers",
  "/dashboard/databases": "Databases",
  "/dashboard/monitoring": "Monitoring",
  "/dashboard/team": "Team",
  "/dashboard/activity": "Activity",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
};

function getPageLabel(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  for (const [path, label] of Object.entries(PAGE_LABELS)) {
    if (path !== "/dashboard" && pathname.startsWith(path)) return label;
  }
  return "Dashboard";
}

export function Header() {
  const { t } = useTranslation();
  const { openMobile } = useSidebarStore();
  const { theme, setTheme } = useThemeStore();
  const pathname = usePathname();
  const pageLabel = getPageLabel(pathname);
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header
      className="h-14 sticky top-0 z-40 flex items-center"
      style={{
        background: "var(--bg-header-glass)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--glass-border)",
      }}
    >
      <div className="flex items-center w-full px-4 md:px-5 gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={openMobile}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--text-secondary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
          }
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb — desktop only */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 select-none">
          <span
            style={{
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              letterSpacing: "-0.01em",
            }}
          >
            pushify
          </span>
          <ChevronRight
            className="w-3 h-3 shrink-0"
            style={{ color: "var(--text-muted)" }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            {pageLabel}
          </span>
        </div>

        {/* Search bar */}
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-command-palette"))
          }
          className="flex items-center gap-2.5 h-9 px-3 rounded-lg transition-all flex-1 max-w-xs"
          style={{
            background: "var(--hover-overlay-md)",
            border: "1px solid var(--glass-border-md)",
            color: "var(--text-muted)",
            marginLeft: 8,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor =
              "var(--glass-border-xl)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor =
              "var(--glass-border-md)")
          }
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span
            className="text-sm hidden sm:inline"
            style={{ fontSize: 13, color: "var(--text-muted)" }}
          >
            {t("header", "searchPlaceholder")}
          </span>
          <span className="text-sm sm:hidden" style={{ fontSize: 13 }}>
            {t("common", "search")}
          </span>
          <div className="ml-auto hidden md:flex items-center gap-1">
            <kbd
              className="flex items-center justify-center w-5 h-5 rounded"
              style={{
                background: "var(--hover-overlay-md)",
                border: "1px solid var(--glass-border-md)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
              }}
            >
              <Command className="w-2.5 h-2.5" />
            </kbd>
            <kbd
              className="flex items-center justify-center w-5 h-5 rounded"
              style={{
                background: "var(--hover-overlay-md)",
                border: "1px solid var(--glass-border-md)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
              }}
            >
              K
            </kbd>
          </div>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* AI Assistant */}
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-ai-assistant"))
            }
            className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg transition-all"
            style={{
              background: "rgba(167,139,250,0.07)",
              border: "1px solid rgba(167,139,250,0.18)",
              color: "var(--accent-purple)",
              fontSize: 12.5,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(167,139,250,0.12)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(167,139,250,0.07)")
            }
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="gradient-text font-medium">
              {t("header", "aiHelp")}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-muted)" }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-secondary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-muted)")
            }
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Deploy */}
          <Link
            href="/dashboard/projects/new"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg font-medium transition-all"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.18)",
              color: "var(--accent-cyan)",
              fontSize: 12.5,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(34,211,238,0.13)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(34,211,238,0.08)")
            }
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("header", "deploy")}</span>
          </Link>

          {/* Notifications */}
          <button
            className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-secondary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-muted)")
            }
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full status-pulse"
              style={{ background: "var(--accent-cyan)" }}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
