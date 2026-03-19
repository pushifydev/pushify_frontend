'use client';

import { motion } from 'framer-motion';
import {
  GitBranch, Server, Database, Globe, Activity, Users,
  Bot, ScrollText, HeartPulse, Eye, Lock, Terminal,
  Bell, Sun, Check, ArrowRight, Cpu, HardDrive, Wifi,
  Shield, Zap, GitCommit, GitPullRequest, Play, Clock,
} from 'lucide-react';
import { useTranslation } from '@/hooks';

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/8 border border-[var(--accent-cyan)]/15 mb-4">
          <span className="text-[10px] text-[var(--accent-cyan)] terminal-text uppercase tracking-widest font-medium">{label}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-snug">{title}</h3>
        <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed max-w-md">{description}</p>
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
    <motion.div
      variants={fadeUp}
      className="group p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] hover:border-[var(--glass-border-strong)] transition-all duration-200"
    >
      <div className="w-9 h-9 rounded-lg bg-[var(--accent-cyan)]/8 flex items-center justify-center mb-3.5 text-[var(--accent-cyan)] group-hover:bg-[var(--accent-cyan)]/15 transition-colors">
        {icon}
      </div>
      <h4 className="text-sm font-semibold mb-1.5">{title}</h4>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ───────────────── Main Export ───────────────── */
export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <div className="relative">
      {/* ── Page Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[800px] h-[500px] bg-[var(--accent-cyan)] rounded-full blur-[280px] opacity-[0.05]" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 mb-6">
            <Zap className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-xs text-[var(--accent-cyan)] terminal-text uppercase tracking-wider">{t('landing', 'platform')}</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] leading-[1.1] mb-5">
            {t('landing', 'everythingYouNeedTo')}<br />
            <span className="gradient-text">{t('landing', 'shipWithConfidence')}</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {t('landing', 'featuresPageDescription')}
          </motion.p>
        </motion.div>
      </section>

      {/* ── Hero Features (alternating) ── */}
      <section className="max-w-6xl mx-auto px-6 space-y-28 pb-28">
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
          label={t('landing', 'cliLabel')}
          title={t('landing', 'deployFromTerminalTitle')}
          description={t('landing', 'deployFromTerminalDesc')}
          mockup={<TerminalMockup />}
          reverse
        />
      </section>

      {/* ── Mini Features Grid ── */}
      <section className="relative py-24 border-t border-[var(--glass-border)]">
        <div className="absolute inset-0 grid-pattern opacity-15" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {t('landing', 'andEverythingElse')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--text-secondary)] max-w-lg mx-auto">
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
