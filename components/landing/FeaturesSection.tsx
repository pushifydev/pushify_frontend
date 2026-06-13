'use client';

import { motion } from 'framer-motion';
import {
  GitBranch, Server, Database, Globe, Activity, Users,
  Bot, ScrollText, HeartPulse, Eye, Lock, Terminal,
  Bell, Sun, Check, ArrowRight, Cpu, HardDrive, Wifi,
  Shield, GitCommit, GitPullRequest, Play, Clock, LayoutTemplate,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { SiteBuilderMockup } from './SiteBuilderSection';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ───────────────── Mockup: GitHub Deploy Flow ───────────────── */
function GitHubDeployMockup() {
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[var(--bg-primary)] border border-[var(--glass-border)] text-xs terminal-text">
      {/* Commit row */}
      <div className="px-4 py-3 border-b border-[var(--glass-border)] flex items-center gap-3">
        <GitCommit className="w-4 h-4 text-[var(--accent-cyan)]" />
        <span className="text-[var(--text-primary)] font-medium">feat: add user dashboard</span>
        <span className="ml-auto text-[var(--text-muted)]">2m ago</span>
      </div>

      {/* Pipeline steps */}
      {[
        { label: 'Build', status: 'done', duration: '32s' },
        { label: 'Deploy', status: 'done', duration: '8s' },
        { label: 'Health Check', status: 'done', duration: '3s' },
      ].map((step, i) => (
        <div key={i} className="px-4 py-2.5 flex items-center gap-3 border-b border-[var(--glass-divider)]">
          <div className="w-5 h-5 rounded-full bg-[var(--status-success)]/15 flex items-center justify-center">
            <Check className="w-3 h-3 text-[var(--status-success)]" />
          </div>
          <span className="text-[var(--text-secondary)]">{step.label}</span>
          <span className="ml-auto text-[var(--text-muted)]">{step.duration}</span>
        </div>
      ))}

      {/* Result */}
      <div className="px-4 py-3 bg-[var(--status-success)]/5 flex items-center gap-2">
        <Play className="w-3.5 h-3.5 text-[var(--status-success)]" />
        <span className="text-[var(--status-success)] font-medium">Live at</span>
        <span className="text-[var(--accent-cyan)] underline underline-offset-2">app.pushify.dev</span>
      </div>
    </div>
  );
}

/* ───────────────── Mockup: Server Dashboard ───────────────── */
function ServerMockup() {
  const bars = [72, 45, 88, 34, 61, 52, 78, 40, 65, 55, 82, 48];
  return (
    <div className="w-full rounded-xl overflow-hidden bg-[var(--bg-primary)] border border-[var(--glass-border)] text-xs">
      <div className="px-4 py-2.5 border-b border-[var(--glass-border)] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
        <span className="terminal-text text-[var(--text-secondary)]">prod-server-01</span>
        <span className="ml-auto text-[var(--text-muted)] terminal-text">Frankfurt, DE</span>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 divide-x divide-[var(--glass-divider)]">
        {[
          { label: 'CPU', value: '24%', color: 'var(--accent-cyan)' },
          { label: 'RAM', value: '1.2 GB', color: 'var(--accent-purple)' },
          { label: 'Disk', value: '18 GB', color: 'var(--accent-green)' },
        ].map((m, i) => (
          <div key={i} className="px-3 py-3 text-center">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{m.label}</div>
            <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Mini chart */}
      <div className="px-4 py-3 border-t border-[var(--glass-divider)]">
        <div className="flex items-end gap-[3px] h-8">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-[var(--accent-cyan)]"
              style={{ height: `${h}%`, opacity: 0.3 + (i / bars.length) * 0.7 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Mockup: Database Panel ───────────────── */
function DatabaseMockup() {
  const dbs = [
    { name: 'main-postgres', type: 'PostgreSQL', status: 'Running', size: '2.4 GB' },
    { name: 'cache-redis', type: 'Redis', status: 'Running', size: '128 MB' },
    { name: 'analytics-db', type: 'MySQL', status: 'Running', size: '890 MB' },
  ];
  return (
    <div className="w-full rounded-xl overflow-hidden bg-[var(--bg-primary)] border border-[var(--glass-border)] text-xs">
      <div className="px-4 py-2.5 border-b border-[var(--glass-border)] flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
        <span className="terminal-text text-[var(--text-secondary)]">Databases</span>
      </div>
      {dbs.map((db, i) => (
        <div key={i} className={`px-4 py-2.5 flex items-center gap-3 ${i < dbs.length - 1 ? 'border-b border-[var(--glass-divider)]' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-[var(--status-success)]" />
          <div className="flex-1 min-w-0">
            <span className="text-[var(--text-primary)] font-medium terminal-text">{db.name}</span>
            <span className="text-[var(--text-muted)] ml-2">{db.type}</span>
          </div>
          <span className="text-[var(--text-muted)]">{db.size}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────────────── Mockup: Terminal CLI ───────────────── */
function TerminalMockup() {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-[var(--bg-primary)] border border-[var(--glass-border)]">
      <div className="px-4 py-2 border-b border-[var(--glass-border)] flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] text-[var(--text-muted)] terminal-text">terminal</span>
      </div>
      <div className="p-4 terminal-text text-xs leading-5 space-y-0.5">
        <div><span className="text-[var(--text-primary)]">$ pushify deploy --prod</span></div>
        <div className="text-[var(--accent-purple)]">◆ Detected: Next.js 15</div>
        <div className="text-[var(--accent-cyan)]">▸ Building bundle...</div>
        <div className="text-[var(--accent-cyan)]">▸ Uploading artifacts...</div>
        <div className="text-[var(--accent-cyan)]">▸ Starting containers...</div>
        <div className="text-[var(--status-success)]">✓ Deployed in 41s</div>
        <div className="mt-1"><span className="text-[var(--text-muted)]">→</span> <span className="text-[var(--accent-cyan)] underline">https://app.pushify.dev</span></div>
      </div>
    </div>
  );
}

/* ───────────────── Hero Feature Block ───────────────── */
function HeroFeature({
  label,
  title,
  description,
  mockup,
  reverse = false,
}: {
  label: string;
  title: string;
  description: string;
  mockup: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reverse ? 'lg:direction-rtl' : ''}`}
    >
      <div className={reverse ? 'lg:direction-ltr lg:order-2' : ''}>
        <p className="lp-label mb-4">{label}</p>
        <h3 className="lp-section-title mb-4">{title}</h3>
        <p className="lp-body max-w-md">{description}</p>
      </div>
      <div className={reverse ? 'lg:direction-ltr lg:order-1' : ''}>
        {mockup}
      </div>
    </motion.div>
  );
}

/* ───────────────── Mini Feature Card ───────────────── */
function MiniFeature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div variants={fadeUp} className="lp-card p-5 hover:border-[var(--lp-muted)] transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3.5"
        style={{ color: 'var(--lp-ink)', background: 'var(--lp-border)' }}
      >
        {icon}
      </div>
      <h4 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>
        {title}
      </h4>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
        {desc}
      </p>
    </motion.div>
  );
}

/* ───────────────── Main Export ───────────────── */
export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <div>
      <header className="lp-container pt-20 md:pt-24 pb-12 md:pb-14 text-center mx-auto max-w-3xl">
        <p className="lp-label mb-4">{t('landing', 'platform')}</p>
        <h1 className="lp-hero-title">
          {t('landing', 'everythingYouNeedTo')}
          <br />
          {t('landing', 'shipWithConfidence')}
        </h1>
        <p className="lp-lead mt-5">{t('landing', 'featuresPageDescription')}</p>
      </header>

      <section className="lp-container space-y-28 pb-28">
        <HeroFeature
          label={t('landing', 'deployLabel')}
          title={t('landing', 'pushToDeployTitle')}
          description={t('landing', 'pushToDeployDesc')}
          mockup={<GitHubDeployMockup />}
        />

        <HeroFeature
          label={t('landing', 'infrastructureLabel')}
          title={t('landing', 'serversFullyManagedTitle')}
          description={t('landing', 'serversFullyManagedDesc')}
          mockup={<ServerMockup />}
          reverse
        />

        <HeroFeature
          label={t('landing', 'dataLabel')}
          title={t('landing', 'databasesOneClickTitle')}
          description={t('landing', 'databasesOneClickDesc')}
          mockup={<DatabaseMockup />}
        />

        <HeroFeature
          label={t('landing', 'siteBuilderLabel')}
          title={t('landing', 'siteBuilderTitle')}
          description={t('landing', 'siteBuilderDesc')}
          mockup={<SiteBuilderMockup />}
          reverse
        />

        <HeroFeature
          label={t('landing', 'cliLabel')}
          title={t('landing', 'deployFromTerminalTitle')}
          description={t('landing', 'deployFromTerminalDesc')}
          mockup={<TerminalMockup />}
        />
      </section>

      <section className="lp-section border-t" style={{ borderColor: 'var(--lp-border)' }}>
        <div className="lp-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14 mx-auto max-w-2xl"
          >
            <motion.h2 variants={fadeUp} className="lp-section-title mb-3">
              {t('landing', 'andEverythingElse')}
            </motion.h2>
            <motion.p variants={fadeUp} className="lp-lead">
              {t('landing', 'everyFeatureBuiltIn')}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <MiniFeature
              icon={<Globe className="w-4 h-4" />}
              title={t('landing', 'customDomainsAndSsl')}
              desc={t('landing', 'customDomainsAndSslDesc')}
            />
            <MiniFeature
              icon={<Users className="w-4 h-4" />}
              title={t('landing', 'teamCollaboration')}
              desc={t('landing', 'teamCollaborationDesc')}
            />
            <MiniFeature
              icon={<Bot className="w-4 h-4" />}
              title={t('landing', 'aiAssistant')}
              desc={t('landing', 'aiAssistantDesc')}
            />
            <MiniFeature
              icon={<ScrollText className="w-4 h-4" />}
              title={t('landing', 'activityLogs')}
              desc={t('landing', 'activityLogsDesc')}
            />
            <MiniFeature
              icon={<HeartPulse className="w-4 h-4" />}
              title={t('landing', 'healthChecks')}
              desc={t('landing', 'healthChecksDesc')}
            />
            <MiniFeature
              icon={<Eye className="w-4 h-4" />}
              title={t('landing', 'previewDeployments')}
              desc={t('landing', 'previewDeploymentsDesc')}
            />
            <MiniFeature
              icon={<Lock className="w-4 h-4" />}
              title={t('landing', 'environmentVariables')}
              desc={t('landing', 'environmentVariablesDesc')}
            />
            <MiniFeature
              icon={<Bell className="w-4 h-4" />}
              title={t('landing', 'notifications')}
              desc={t('landing', 'notificationsDesc')}
            />
            <MiniFeature
              icon={<LayoutTemplate className="w-4 h-4" />}
              title={t('landing', 'noCodeSiteBuilder')}
              desc={t('landing', 'noCodeSiteBuilderDesc')}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
