"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
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
import { HeaderAlertsMenu } from "./header/HeaderAlertsMenu";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/servers": "Servers",
  "/dashboard/databases": "Databases",
  "/dashboard/sites": "Site Studio",
  "/dashboard/marketplace": "Marketplace",
  "/dashboard/monitoring": "Monitoring",
  "/dashboard/alerts": "Alerts",
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
    <header className="h-14 sticky top-0 z-40 flex items-center border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <div className="flex items-center w-full px-4 md:px-5 gap-3">
        <button
          type="button"
          onClick={openMobile}
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-1.5 shrink-0 select-none">
          <span className="text-xs text-[var(--text-muted)]">pushify</span>
          <ChevronRight className="w-3 h-3 shrink-0 text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{pageLabel}</span>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          className="flex items-center gap-2.5 h-9 px-3 rounded-lg flex-1 max-w-xs ml-0 md:ml-2 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--border-default)] transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[13px] hidden sm:inline">{t("header", "searchPlaceholder")}</span>
          <span className="text-[13px] sm:hidden">{t("common", "search")}</span>
          <div className="ml-auto hidden md:flex items-center gap-1">
            <kbd className="flex items-center justify-center w-5 h-5 rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] font-mono text-[10px]">
              <Command className="w-2.5 h-2.5" />
            </kbd>
            <kbd className="flex items-center justify-center w-5 h-5 rounded border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] font-mono text-[10px]">
              K
            </kbd>
          </div>
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
            className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-medium border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--hover-overlay-md)] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("header", "aiHelp")}
          </button>

          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <LanguageSwitcher />

          <Link
            href="/dashboard/projects/new"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold dash-accent-fill transition-opacity hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("header", "deploy")}
          </Link>

          <HeaderAlertsMenu />
        </div>
      </div>
    </header>
  );
}
