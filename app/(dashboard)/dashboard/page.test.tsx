import { isValidElement, type ReactElement, type ReactNode } from 'react';
import Link from 'next/link';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmptyState } from '@/components/EmptyState';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { FUNNEL_EVENTS } from '@/lib/analytics';

const pushMock = vi.fn();
const trackMock = vi.fn();
const state = {
  projects: { data: [] as unknown[], isLoading: false },
  servers: { data: [] as unknown[], isLoading: false },
};

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('@/hooks', () => ({
  useProjects: () => state.projects,
  useServers: () => state.servers,
  useMetricsOverview: () => ({ data: undefined, isLoading: false }),
  useTranslation: () => ({ t: (_ns: string, key: string) => key, locale: 'en' }),
}));
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ user: { name: 'Ada Lovelace' } }) }));
vi.mock('@/components/dashboard/DashboardAttentionZone', () => ({ DashboardAttentionZone: () => null }));
vi.mock('@/lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/analytics')>()),
  trackEvent: (...args: unknown[]) => trackMock(...args),
}));

const { default: DashboardPage } = await import('./page');

type EmptyStateProps = Parameters<typeof EmptyState>[0];
type LinkProps = { href: string; children?: ReactNode };

const project = {
  id: 'p1',
  name: 'web',
  status: 'active',
  framework: 'nextjs',
  updatedAt: '2026-10-01T00:00:00Z',
  productionUrl: null,
};

function render(): ReactNode {
  // The page only calls (mocked) hooks, so it can be called as a plain function;
  // child components stay unexpanded elements in the returned tree.
  return (DashboardPage as () => ReactNode)();
}

/** Every element in the tree (following children) that matches. */
function findAll(node: ReactNode, match: (el: ReactElement) => boolean, out: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(node)) node.forEach((n) => findAll(n, match, out));
  else if (isValidElement(node)) {
    if (match(node)) out.push(node);
    findAll((node.props as { children?: ReactNode }).children, match, out);
  }
  return out;
}

const emptyStates = (tree: ReactNode) =>
  findAll(tree, (el) => el.type === EmptyState) as ReactElement<EmptyStateProps>[];

/** The section that holds the first-deploy card. */
function firstDeploySection(tree: ReactNode): ReactElement {
  const [section] = findAll(tree, (el) => el.type === 'section' && emptyStates(el).length > 0);
  expect(section).toBeDefined();
  return section;
}

const linkHrefs = (node: ReactNode) =>
  (findAll(node, (el) => el.type === Link) as ReactElement<LinkProps>[]).map((el) => el.props.href);

describe('Dashboard first-deploy card', () => {
  beforeEach(() => {
    pushMock.mockReset();
    trackMock.mockReset();
    state.projects = { data: [], isLoading: false };
    state.servers = { data: [], isLoading: false };
  });

  it('shows one 3-step card (repo → server → deploy) when the user has no projects', () => {
    const cards = emptyStates(render());
    expect(cards).toHaveLength(1);
    const { label, title, description, action } = cards[0].props;
    expect(title).toBe('Deploy your first app');
    expect(label).toBe('Connect repo → Choose server → Deploy');
    expect(description).toContain('GitHub');
    expect(description).toContain('Hetzner');
    expect(description).toContain('BYOS');
    expect(action?.label).toBe('Connect your repo');
  });

  it('opens the new-project wizard from the CTA and tracks the click', () => {
    const [card] = emptyStates(render());
    card.props.action!.onClick!();
    expect(pushMock).toHaveBeenCalledWith('/dashboard/projects/new');
    expect(trackMock).toHaveBeenCalledWith(FUNNEL_EVENTS.connectRepoCtaClicked, { from: 'dashboard_empty' });
  });

  it('offers the marketplace as the only secondary link, without the site builder', () => {
    const hrefs = linkHrefs(firstDeploySection(render()));
    expect(hrefs).toEqual(['/dashboard/marketplace']);
  });

  it('does not show the onboarding checklist next to it', () => {
    state.servers = { data: [{ id: 's1' }], isLoading: false };
    const tree = render();
    expect(emptyStates(tree)).toHaveLength(1);
    expect(findAll(tree, (el) => el.type === OnboardingChecklist)).toHaveLength(0);
  });

  it('disappears once the first project exists', () => {
    state.projects = { data: [project], isLoading: false };
    const tree = render();
    expect(emptyStates(tree)).toHaveLength(0);
    expect(linkHrefs(tree)).not.toContain('/dashboard/marketplace');
    expect(linkHrefs(tree)).toContain('/dashboard/projects/p1');
    expect(findAll(tree, (el) => el.type === OnboardingChecklist)).toHaveLength(1);
  });

  it('is not shown while projects are still loading', () => {
    state.projects = { data: [], isLoading: true };
    const tree = render();
    expect(emptyStates(tree)).toHaveLength(0);
    expect(findAll(tree, (el) => el.type === OnboardingChecklist)).toHaveLength(0);
  });
});
