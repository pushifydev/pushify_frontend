"use client";

import { useTranslation } from "@/hooks";
import { LogoMark } from "@/components/logo";
import { Github, Twitter, Mail, ArrowUpRight } from "lucide-react";

export function LandingFooter() {
  const { t } = useTranslation();

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
      { label: t("landing", "blog"), href: "#" },
      { label: t("landing", "twitter"), href: "#" },
      { label: t("landing", "contact"), href: "mailto:hello@pushify.dev" },
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

  return (
    <footer className="border-t border-[var(--glass-border)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
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

        <div className="mt-12 pt-6 border-t border-[var(--glass-divider)] flex flex-col md:flex-row items-center justify-between gap-3">
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
