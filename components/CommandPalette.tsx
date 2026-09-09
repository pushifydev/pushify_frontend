'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Server,
  Database,
  Activity,
  Users,
  Receipt,
  Settings,
  BarChart3,
  Plus,
  FileText,
  ArrowRight,
  Rocket,
  ScrollText,
  TerminalSquare,
  Variable,
  Globe,
  History,
  RotateCcw,
  Table2,
  Loader2,
  CornerDownLeft,
} from 'lucide-react';
import {
  getProjects,
  listServers,
  getDatabases,
  createDeployment,
  rebootServer,
  restartDatabase,
} from '@/lib/api';
import type { Project, Server as ServerT, Database as DatabaseT } from '@/lib/api';
import { projectKeys } from '@/hooks/useProjects';
import { serverKeys } from '@/hooks/useServers';
import { databaseKeys } from '@/hooks/useDatabases';
import { deploymentKeys } from '@/hooks/useDeployments';
import { showSuccessToast } from '@/lib/toast-i18n';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  /** Executes instead of navigating. */
  run?: () => Promise<void>;
  /** Ask before running — for anything that touches a live resource. */
  confirm?: string;
  keywords?: string[];
  /** Action verb this item answers to (matched against VERBS). */
  verb?: Verb;
}

type Verb =
  | 'deploy'
  | 'logs'
  | 'shell'
  | 'env'
  | 'deployments'
  | 'domains'
  | 'settings'
  | 'terminal'
  | 'reboot'
  | 'studio'
  | 'restart';

/** Verb → the words a user might type for it (EN + TR). */
const VERBS: Record<Verb, string[]> = {
  deploy: ['deploy', 'yayınla', 'yayinla', 'dağıt', 'dagit', 'redeploy', 'ship'],
  logs: ['logs', 'log', 'loglar', 'kayıt', 'kayit'],
  shell: ['shell', 'exec', 'bash', 'kabuk'],
  env: ['env', 'environment', 'variables', 'secrets', 'ortam', 'değişken', 'degisken'],
  deployments: ['deployments', 'deploys', 'history', 'rollback', 'geçmiş', 'gecmis', 'dağıtımlar'],
  domains: ['domains', 'domain', 'dns', 'ssl', 'alan adı'],
  settings: ['settings', 'ayarlar', 'config'],
  terminal: ['terminal', 'ssh', 'console'],
  reboot: ['reboot', 'yeniden başlat', 'yeniden baslat', 'restart server'],
  studio: ['studio', 'query', 'sql', 'tables', 'tablo'],
  restart: ['restart', 'yeniden başlat', 'yeniden baslat'],
};

const NAVIGATION: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Overview & metrics', icon: <LayoutDashboard className="w-4 h-4" />, href: '/dashboard', keywords: ['home', 'overview', 'anasayfa'] },
  { id: 'projects', label: 'Projects', description: 'Manage deployments', icon: <FolderKanban className="w-4 h-4" />, href: '/dashboard/projects', keywords: ['app', 'proje'] },
  { id: 'servers', label: 'Servers', description: 'VPS & infrastructure', icon: <Server className="w-4 h-4" />, href: '/dashboard/servers', keywords: ['vps', 'infra', 'sunucu'] },
  { id: 'databases', label: 'Databases', description: 'PostgreSQL, MySQL, Redis', icon: <Database className="w-4 h-4" />, href: '/dashboard/databases', keywords: ['db', 'postgres', 'mysql', 'redis', 'veritabanı'] },
  { id: 'monitoring', label: 'Monitoring', description: 'Metrics & alerts', icon: <BarChart3 className="w-4 h-4" />, href: '/dashboard/monitoring', keywords: ['metrics', 'cpu', 'memory', 'izleme'] },
  { id: 'team', label: 'Team', description: 'Members & roles', icon: <Users className="w-4 h-4" />, href: '/dashboard/team', keywords: ['members', 'invite', 'takım', 'üye'] },
  { id: 'activity', label: 'Activity', description: 'Audit trail', icon: <Activity className="w-4 h-4" />, href: '/dashboard/activity', keywords: ['events', 'history', 'etkinlik'] },
  { id: 'billing', label: 'Billing', description: 'Plans & usage', icon: <Receipt className="w-4 h-4" />, href: '/dashboard/billing', keywords: ['payment', 'plan', 'subscription', 'fatura'] },
  { id: 'settings', label: 'Settings', description: 'Profile & preferences', icon: <Settings className="w-4 h-4" />, href: '/dashboard/settings', keywords: ['profile', 'account', 'ayarlar'] },
  { id: 'docs', label: 'Documentation', description: 'API reference', icon: <FileText className="w-4 h-4" />, href: '/docs', keywords: ['api', 'help', 'döküman'] },
];

const ACTIONS: CommandItem[] = [
  { id: 'new-project', label: 'New project', description: 'Deploy a new app', icon: <Plus className="w-4 h-4" />, href: '/dashboard/projects/new', keywords: ['create', 'deploy', 'yeni'] },
];

const MAX_ENTITY_RESULTS = 6;
const MAX_ACTION_RESULTS = 8;

function matches(item: CommandItem, q: string): boolean {
  return (
    item.label.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q) ||
    item.keywords?.some((k) => k.includes(q)) ||
    false
  );
}

/** Which verb (if any) the query starts with, and the remainder used to match an entity. */
function parseVerb(q: string): { verb: Verb | null; rest: string } {
  for (const [verb, words] of Object.entries(VERBS) as [Verb, string[]][]) {
    for (const w of words) {
      if (q === w || q.startsWith(`${w} `)) {
        return { verb, rest: q.slice(w.length).trim() };
      }
    }
  }
  return { verb: null, rest: q };
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [pending, setPending] = useState<CommandItem | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<CommandItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  // Entity data — fetched only while the palette is open, shares the app's query cache.
  const { data: projects = [] } = useQuery({
    queryKey: projectKeys.list(),
    queryFn: async () => (await getProjects()).data ?? [],
    enabled: open,
    staleTime: 30_000,
  });
  const { data: servers = [] } = useQuery({
    queryKey: serverKeys.list(),
    queryFn: async () => (await listServers()).data ?? [],
    enabled: open,
    staleTime: 30_000,
  });
  const { data: databases = [] } = useQuery({
    queryKey: databaseKeys.list(),
    queryFn: async () => (await getDatabases()).data ?? [],
    enabled: open,
    staleTime: 30_000,
  });

  // ── Navigate-to-entity items ────────────────────────────────────────────
  const projectItems = useMemo<CommandItem[]>(
    () =>
      projects.map((p) => ({
        id: `project-${p.id}`,
        label: p.name,
        description: p.framework || p.slug,
        icon: <FolderKanban className="w-4 h-4" />,
        href: `/dashboard/projects/${p.id}`,
        keywords: [p.slug],
      })),
    [projects],
  );
  const serverItems = useMemo<CommandItem[]>(
    () =>
      servers.map((s) => ({
        id: `server-${s.id}`,
        label: s.name,
        description: s.ipv4 || s.region,
        icon: <Server className="w-4 h-4" />,
        href: `/dashboard/servers/${s.id}`,
        keywords: [s.ipv4 || ''],
      })),
    [servers],
  );
  const databaseItems = useMemo<CommandItem[]>(
    () =>
      databases.map((d) => ({
        id: `database-${d.id}`,
        label: d.name,
        description: d.type,
        icon: <Database className="w-4 h-4" />,
        href: `/dashboard/databases/${d.id}`,
        keywords: [d.type],
      })),
    [databases],
  );

  // ── Per-entity actions ──────────────────────────────────────────────────
  const projectActions = useCallback(
    (p: Project): CommandItem[] => {
      const base = `/dashboard/projects/${p.id}`;
      const kw = [p.name.toLowerCase(), p.slug];
      return [
        {
          id: `deploy-${p.id}`,
          verb: 'deploy',
          label: `Deploy ${p.name}`,
          description: p.gitBranch ? `Build & release ${p.gitBranch}` : 'Build & release',
          icon: <Rocket className="w-4 h-4" />,
          keywords: kw,
          confirm: `Deploy ${p.name} now?`,
          run: async () => {
            const result = await createDeployment(p.id);
            if (result.error) throw new Error(result.error.message);
            queryClient.invalidateQueries({ queryKey: deploymentKeys.list(p.id) });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(p.id) });
            showSuccessToast('deploymentStartedTitle', 'deploymentStartedDesc');
            router.push(`${base}?tab=deployments`);
          },
        },
        { id: `logs-${p.id}`, verb: 'logs', label: `Logs · ${p.name}`, description: 'Live tail & search', icon: <ScrollText className="w-4 h-4" />, href: `${base}?tab=logs`, keywords: kw },
        { id: `shell-${p.id}`, verb: 'shell', label: `Shell · ${p.name}`, description: 'Exec into the app container', icon: <TerminalSquare className="w-4 h-4" />, href: `${base}/shell`, keywords: kw },
        { id: `env-${p.id}`, verb: 'env', label: `Environment · ${p.name}`, description: 'Variables & secrets', icon: <Variable className="w-4 h-4" />, href: `${base}?tab=environment`, keywords: kw },
        { id: `deployments-${p.id}`, verb: 'deployments', label: `Deployments · ${p.name}`, description: 'History & rollback', icon: <History className="w-4 h-4" />, href: `${base}?tab=deployments`, keywords: kw },
        { id: `domains-${p.id}`, verb: 'domains', label: `Domains · ${p.name}`, description: 'Custom domains & SSL', icon: <Globe className="w-4 h-4" />, href: `${base}?tab=domains`, keywords: kw },
        { id: `settings-${p.id}`, verb: 'settings', label: `Settings · ${p.name}`, description: 'Build, scaling, danger zone', icon: <Settings className="w-4 h-4" />, href: `${base}?tab=settings`, keywords: kw },
      ];
    },
    [queryClient, router],
  );

  const serverActions = useCallback(
    (s: ServerT): CommandItem[] => {
      const kw = [s.name.toLowerCase(), s.ipv4 || ''];
      return [
        { id: `terminal-${s.id}`, verb: 'terminal', label: `Terminal · ${s.name}`, description: s.ipv4 || s.region, icon: <TerminalSquare className="w-4 h-4" />, href: `/dashboard/servers/${s.id}/terminal`, keywords: kw },
        {
          id: `reboot-${s.id}`,
          verb: 'reboot',
          label: `Reboot ${s.name}`,
          description: 'Restarts the machine — apps come back after boot',
          icon: <RotateCcw className="w-4 h-4" />,
          keywords: kw,
          confirm: `Reboot ${s.name}? Apps on it go down until it boots.`,
          run: async () => {
            const result = await rebootServer(s.id);
            if (result.error) throw new Error(result.error.message);
            queryClient.invalidateQueries({ queryKey: serverKeys.list() });
            showSuccessToast('serverRebootingTitle', 'serverRebootingDesc', { name: s.name });
          },
        },
      ];
    },
    [queryClient],
  );

  const databaseActions = useCallback(
    (d: DatabaseT): CommandItem[] => {
      const kw = [d.name.toLowerCase(), d.type];
      return [
        { id: `studio-${d.id}`, verb: 'studio', label: `Studio · ${d.name}`, description: `Browse & query ${d.type}`, icon: <Table2 className="w-4 h-4" />, href: `/dashboard/databases/${d.id}/studio`, keywords: kw },
        {
          id: `restart-${d.id}`,
          verb: 'restart',
          label: `Restart ${d.name}`,
          description: 'Brief interruption for connected apps',
          icon: <RotateCcw className="w-4 h-4" />,
          keywords: kw,
          confirm: `Restart ${d.name}? Connected apps drop for a few seconds.`,
          run: async () => {
            const result = await restartDatabase(d.id);
            if (result.error) throw new Error(result.error.message);
            queryClient.invalidateQueries({ queryKey: databaseKeys.all });
            toast.success(`Restarting ${d.name}`);
          },
        },
      ];
    },
    [queryClient],
  );

  const allEntityActions = useMemo<CommandItem[]>(
    () => [
      ...projects.flatMap(projectActions),
      ...servers.flatMap(serverActions),
      ...databases.flatMap(databaseActions),
    ],
    [projects, servers, databases, projectActions, serverActions, databaseActions],
  );

  // The project the user is currently looking at, if any — its actions lead the empty state.
  const currentProject = useMemo(() => {
    const m = pathname?.match(/^\/dashboard\/projects\/([^/?]+)/);
    if (!m || m[1] === 'new') return null;
    return projects.find((p) => p.id === m[1]) ?? null;
  }, [pathname, projects]);

  // ── Sections drive both rendering and keyboard order ────────────────────
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      const here = currentProject
        ? [{ title: `This project · ${currentProject.name}`, accent: true, items: projectActions(currentProject).slice(0, 4) }]
        : [];
      return [
        ...here,
        { title: 'Actions', accent: true, items: ACTIONS },
        { title: 'Pages', accent: false, items: NAVIGATION },
      ].filter((s) => s.items.length > 0);
    }

    const { verb, rest } = parseVerb(q);
    const matchedProjects = projectItems.filter((i) => matches(i, q));

    let actionItems: CommandItem[];
    if (verb) {
      // "deploy api" → every entity action for that verb, narrowed by the remainder.
      actionItems = allEntityActions.filter(
        (a) => a.verb === verb && (!rest || a.keywords?.some((k) => k.includes(rest))),
      );
    } else if (matchedProjects.length > 0) {
      // Plain entity search → quick actions for the best-matching project.
      const top = projects.find((p) => `project-${p.id}` === matchedProjects[0].id);
      actionItems = top ? projectActions(top).slice(0, 3) : [];
    } else {
      actionItems = allEntityActions.filter((a) => matches(a, q));
    }

    return [
      { title: 'Projects', accent: true, items: verb ? [] : matchedProjects.slice(0, MAX_ENTITY_RESULTS) },
      { title: 'Actions', accent: true, items: [...actionItems.slice(0, MAX_ACTION_RESULTS), ...ACTIONS.filter((i) => matches(i, q))] },
      { title: 'Servers', accent: true, items: verb ? [] : serverItems.filter((i) => matches(i, q)).slice(0, MAX_ENTITY_RESULTS) },
      { title: 'Databases', accent: true, items: verb ? [] : databaseItems.filter((i) => matches(i, q)).slice(0, MAX_ENTITY_RESULTS) },
      { title: 'Pages', accent: false, items: verb ? [] : NAVIGATION.filter((i) => matches(i, q)) },
    ].filter((s) => s.items.length > 0);
  }, [query, currentProject, projectActions, projectItems, serverItems, databaseItems, allEntityActions, projects]);

  const flatList = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const onQueryChange = useCallback((val: string) => {
    setQuery(val);
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setPending(null);
    setBusy(false);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setPending(null);
    setBusy(false);
  }, []);

  // ⌘K listener. Escape backs out of a confirmation before it closes the palette.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) close(); else openPalette();
      }
      if (e.key === 'Escape' && open) {
        if (pendingRef.current) {
          setPending(null);
          setTimeout(() => inputRef.current?.focus(), 0);
        } else {
          close();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, openPalette, close]);

  useEffect(() => {
    const handler = () => openPalette();
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, [openPalette]);

  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]') as HTMLElement;
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const execute = useCallback(
    async (item: CommandItem) => {
      if (!item.run) return;
      setBusy(true);
      try {
        await item.run();
        close();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Action failed');
        setBusy(false);
        setPending(null);
      }
    },
    [close],
  );

  const select = useCallback(
    (item: CommandItem) => {
      if (item.run) {
        if (item.confirm) {
          setPending(item);
          return;
        }
        void execute(item);
        return;
      }
      if (item.href) {
        close();
        router.push(item.href);
      }
    },
    [router, close, execute],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (pending) {
        if (e.key === 'Enter' && !busy) {
          e.preventDefault();
          void execute(pending);
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(flatList.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + flatList.length) % Math.max(flatList.length, 1));
      } else if (e.key === 'Enter' && flatList[activeIndex]) {
        e.preventDefault();
        select(flatList[activeIndex]);
      }
    },
    [flatList, activeIndex, select, pending, busy, execute],
  );

  if (!open) return null;

  const kbdStyle: React.CSSProperties = {
    background: 'var(--hover-overlay-md)',
    border: '1px solid var(--glass-border)',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100]"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={close}
      />

      <div
        className="fixed z-[101] left-1/2 top-[20%] -translate-x-1/2 w-full max-w-[540px] rounded-xl overflow-hidden animate-slide-in"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Input row — becomes the confirmation bar while an action is pending */}
        <div
          className="flex items-center gap-3 px-4 h-12"
          style={{ borderBottom: '1px solid var(--glass-border-md)' }}
        >
          {pending ? (
            <>
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'var(--dash-accent-bg)', color: 'var(--accent-cyan)' }}
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : pending.icon}
              </span>
              <span className="flex-1 truncate" style={{ color: 'var(--text-primary)', fontSize: 14 }}>
                {pending.confirm}
              </span>
              {/* Hidden input keeps keyboard focus so ↵ / esc keep working */}
              <input
                ref={inputRef}
                className="sr-only"
                onKeyDown={handleKeyDown}
                autoFocus
                readOnly
                aria-label="Confirm action"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => void execute(pending)}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium shrink-0"
                style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}
              >
                <CornerDownLeft className="w-3 h-3" />
                Confirm
              </button>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search, or type an action — “deploy api”, “logs web”, “reboot”…"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none"
                style={{ color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-display)' }}
              />
              <kbd className="flex items-center justify-center h-5 px-1.5 rounded" style={{ ...kbdStyle, fontSize: 10 }}>
                ESC
              </kbd>
            </>
          )}
        </div>

        {/* Results */}
        {!pending && (
          <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2 px-2">
            {flatList.length === 0 && (
              <div className="px-3 py-8 text-center" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                No results for &quot;{query}&quot;
              </div>
            )}

            {sections.map((section) => (
              <div key={section.title}>
                <div
                  className="px-3 pt-2 pb-1.5"
                  style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
                >
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const idx = flatList.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      data-active={idx === activeIndex}
                      onClick={() => select(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors"
                      style={{
                        background: idx === activeIndex ? 'var(--hover-overlay-lg)' : 'transparent',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={
                          section.accent
                            ? { background: 'var(--dash-accent-bg)', color: 'var(--accent-cyan)' }
                            : { background: 'var(--hover-overlay-lg)', color: 'var(--text-secondary)' }
                        }
                      >
                        {item.icon}
                      </span>
                      <div className="flex-1 text-left min-w-0">
                        <div className="truncate" style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</div>
                        {item.description && (
                          <div className="truncate" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.description}</div>
                        )}
                      </div>
                      {item.run ? (
                        <kbd
                          className="hidden sm:inline-flex items-center h-4 px-1 rounded shrink-0"
                          style={{ ...kbdStyle, fontSize: 9, opacity: idx === activeIndex ? 1 : 0 }}
                        >
                          {item.confirm ? 'run' : '↵'}
                        </kbd>
                      ) : (
                        <ArrowRight
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--text-muted)', opacity: idx === activeIndex ? 1 : 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 h-9"
          style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: 11 }}
        >
          {pending ? (
            <>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center h-4 px-1 rounded" style={{ ...kbdStyle, fontSize: 9 }}>↵</kbd>
                confirm
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center h-4 px-1 rounded" style={{ ...kbdStyle, fontSize: 9 }}>esc</kbd>
                back
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center w-4 h-4 rounded" style={{ ...kbdStyle, fontSize: 9 }}>↑</kbd>
                <kbd className="inline-flex items-center justify-center w-4 h-4 rounded" style={{ ...kbdStyle, fontSize: 9 }}>↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center h-4 px-1 rounded" style={{ ...kbdStyle, fontSize: 9 }}>↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center h-4 px-1 rounded" style={{ ...kbdStyle, fontSize: 9 }}>esc</kbd>
                close
              </span>
              <span className="ml-auto hidden sm:inline" style={{ opacity: 0.7 }}>
                try “deploy”, “logs”, “shell”
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
