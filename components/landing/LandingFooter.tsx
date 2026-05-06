"use client";

import { useTranslation } from "@/hooks";
import { LogoMark } from "@/components/logo";
import { useThemeStore } from "@/stores/theme";
import { Github, Twitter, Mail, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function LandingFooter() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (theme === "system") {
      setResolvedTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      setResolvedTheme(theme === "light" ? "light" : "dark");
    }
  }, [theme]);

  const links = {
    [t("landing", "product")]: [
      { label: t("landing", "features"), href: "/features" },
      { label: t("landing", "pricing"), href: "/pricing" },
      {
        label: t("landing", "cli"),
        href: "https://www.npmjs.com/package/pushify-cli",
        external: true,
      },
    ],
    [t("landing", "resources")]: [
      { label: t("branding", "documentation"), href: "/docs", external: true },
      {
        label: t("branding", "github"),
        href: "https://github.com/pushifydev",
        external: true,
      },
      { label: t("landing", "changelog"), href: "#" },
    ],
    [t("landing", "company")]: [
      { label: t("legal", "about"), href: "/about" },
      { label: t("landing", "blog"), href: "#" },
      { label: t("landing", "contact"), href: "mailto:hello@pushify.dev" },
    ],
    [t("legal", "legal")]: [
      { label: t("legal", "privacy"), href: "/privacy" },
      { label: t("legal", "terms"), href: "/terms" },
      { label: t("legal", "refund"), href: "/refund" },
    ],
  };

  const socials = [
    {
      icon: <Github className="w-4 h-4" />,
      href: "https://github.com/pushifydev",
      label: "GitHub",
    },
    { icon: <Twitter className="w-4 h-4" />, href: "#", label: "Twitter" },
    {
      icon: <Mail className="w-4 h-4" />,
      href: "mailto:hello@pushify.dev",
      label: "Email",
    },
  ];

  const iyzicoLogo =
    resolvedTheme === "dark"
      ? "/iyzico-logo-pack/footer_iyzico_ile_ode/White/logo_band_white.svg"
      : "/iyzico-logo-pack/footer_iyzico_ile_ode/Colored/logo_band_colored.svg";

  return (
    <footer className="border-t border-[var(--glass-border)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark size={32} />
              <span className="font-bold text-lg">Pushify</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5 max-w-xs">
              {t("landing", "footerDescription")}
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay-md)] transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      {link.external && (
                        <ArrowUpRight className="w-3 h-3 opacity-40" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-12 pt-8 border-t border-[var(--glass-divider)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                {t("legal", "securePayment")}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {/* iyzico ile öde */}
                <a
                  href="https://www.iyzico.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[var(--glass-border-strong)] transition-colors"
                  aria-label="iyzico ile Öde"
                >
                  <Image
                    src={iyzicoLogo}
                    alt="iyzico ile Öde"
                    width={120}
                    height={28}
                    className="h-7 w-auto"
                    priority={false}
                    unoptimized
                  />
                </a>

                {/* Visa */}
                <div className="h-9 px-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center" aria-label="Visa">
                  <svg viewBox="0 0 60 20" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                    <text
                      x="0"
                      y="16"
                      fontFamily="Arial Black, Arial, sans-serif"
                      fontSize="18"
                      fontWeight="900"
                      fontStyle="italic"
                      fill="#1a1f71"
                    >
                      VISA
                    </text>
                  </svg>
                </div>

                {/* Mastercard */}
                <div className="h-9 px-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center" aria-label="Mastercard">
                  <svg viewBox="0 0 40 24" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="12" r="10" fill="#EB001B" />
                    <circle cx="26" cy="12" r="10" fill="#F79E1B" />
                    <path
                      d="M20 5.2a9.95 9.95 0 0 1 0 13.6 9.95 9.95 0 0 1 0-13.6z"
                      fill="#FF5F00"
                    />
                  </svg>
                </div>

                {/* Amex */}
                <div className="h-9 px-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center" aria-label="American Express">
                  <svg viewBox="0 0 60 20" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="20" rx="2" fill="#1F72CD" />
                    <text
                      x="30"
                      y="14"
                      textAnchor="middle"
                      fontFamily="Arial Black, Arial, sans-serif"
                      fontSize="9"
                      fontWeight="900"
                      fill="#fff"
                    >
                      AMEX
                    </text>
                  </svg>
                </div>

                {/* Troy (Türk kart sistemi) */}
                <div className="h-9 px-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] flex items-center" aria-label="Troy">
                  <svg viewBox="0 0 60 20" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
                    <text
                      x="0"
                      y="16"
                      fontFamily="Arial Black, Arial, sans-serif"
                      fontSize="16"
                      fontWeight="900"
                      fill="#00aeef"
                    >
                      tr
                    </text>
                    <text
                      x="22"
                      y="16"
                      fontFamily="Arial Black, Arial, sans-serif"
                      fontSize="16"
                      fontWeight="900"
                      fill="#e30613"
                    >
                      o
                    </text>
                    <text
                      x="36"
                      y="16"
                      fontFamily="Arial Black, Arial, sans-serif"
                      fontSize="16"
                      fontWeight="900"
                      fill="#00aeef"
                    >
                      y
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            {/* SSL badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
              <svg
                className="w-4 h-4 text-[#22c55e]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {t("legal", "ssl")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--glass-divider)] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Pushify.{" "}
            {t("landing", "openSourceUnderMit")}.
          </p>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <span>{t("landing", "builtWithLove")}</span>
            <span className="text-[var(--accent-red)]">&#9829;</span>
            <span>{t("landing", "forDevelopers")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
