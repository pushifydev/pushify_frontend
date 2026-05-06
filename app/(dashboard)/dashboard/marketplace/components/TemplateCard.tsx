'use client';

import Link from 'next/link';
import {
  ArrowUpRight, Star, Database, Cpu,
  FileText, Zap, Activity, Pen, Layers,
  HardDrive, GitBranch, Container, BarChart3,
  Package, type LucideIcon,
} from 'lucide-react';
import type { MarketplaceTemplate } from '@/lib/api';

const CATEGORY_ACCENTS: Record<string, string> = {
  cms: '#6366f1',
  automation: '#a78bfa',
  monitoring: '#22c55e',
  storage: '#f59e0b',
  devtools: '#3b82f6',
  analytics: '#ec4899',
  database: '#f97316',
};

const ICON_MAP: Record<string, LucideIcon> = {
  FileText, Zap, Activity, Pen, Layers,
  HardDrive, GitBranch, Container, BarChart3,
  Database, Package,
};

const CATEGORY_LABELS: Record<string, string> = {
  cms: 'CMS',
  automation: 'Automation',
  monitoring: 'Monitoring',
  storage: 'Storage',
  devtools: 'Dev Tools',
  analytics: 'Analytics',
  database: 'Database',
};

interface TemplateCardProps {
  template: MarketplaceTemplate;
  index: number;
  deployLabel: string;
}

export default function TemplateCard({ template, index, deployLabel }: TemplateCardProps) {
  const accent = CATEGORY_ACCENTS[template.category] || '#6366f1';
  const IconComponent = ICON_MAP[template.icon] || Package;

  return (
    <Link
      href={`/dashboard/marketplace/${template.id}`}
      className="group relative block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-300 h-full"
        style={{
          background: 'var(--bg-secondary)',
          borderWidth: '2px 1px 1px 1px',
          borderStyle: 'solid',
          borderColor: `${accent} var(--glass-border) var(--glass-border) var(--glass-border)`,
          borderRadius: 12,
        }}
      >
        {/* Featured badge */}
        {template.featured && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider z-10"
            style={{
              background: `${accent}18`,
              color: accent,
              border: `1px solid ${accent}30`,
            }}
          >
            <Star className="w-2.5 h-2.5 fill-current" />
            Featured
          </div>
        )}

        {/* Ambient glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${accent}08 0%, transparent 70%)`,
          }}
        />

        <div className="p-5 flex flex-col h-full">
          {/* Header: icon + meta */}
          <div className="flex items-start gap-3.5 mb-3.5">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `${accent}12`,
                border: `1px solid ${accent}20`,
              }}
            >
              <IconComponent className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-[15px] font-semibold leading-tight truncate"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
              >
                {template.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: `${accent}14`,
                    color: accent,
                  }}
                >
                  {CATEGORY_LABELS[template.category] || template.category}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  v{template.appVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-[13px] leading-relaxed mb-4 flex-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {template.description}
          </p>

          {/* Requirements */}
          <div
            className="flex items-center gap-3 mb-4 text-[11px]"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {template.minMemoryMb}MB
            </span>
            {template.requiresDatabase && (
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                {template.requiresDatabase.type}
              </span>
            )}
          </div>

          {/* Footer: tags + deploy */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--glass-divider)' }}
          >
            <div className="flex gap-1.5 overflow-hidden">
              {template.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full truncate"
                  style={{
                    background: 'var(--hover-overlay-md)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <span
              className="flex items-center gap-1 text-[12px] font-medium transition-colors duration-200"
              style={{ color: accent }}
            >
              {deployLabel}
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
