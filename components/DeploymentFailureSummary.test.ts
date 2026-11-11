import { isValidElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Server } from '@/lib/api';
import type { ServerHealthReport } from '@/lib/api/services/servers.service';
import { en } from '@/lib/i18n/locales/en';

const useServerMock = vi.fn<(id: string) => { data?: Partial<Server> }>();
const useServerHealthMock = vi.fn<(id: string, enabled?: boolean) => { data?: ServerHealthReport }>();

vi.mock('@/hooks', () => ({
  useTranslation: () => ({
    t: (ns: string, key: string) => (en as unknown as Record<string, Record<string, string>>)[ns][key],
    locale: 'en',
  }),
}));
vi.mock('@/hooks/useServers', () => ({
  useServer: (id: string) => useServerMock(id),
  useServerHealth: (id: string, enabled?: boolean) => useServerHealthMock(id, enabled),
}));
// Plain anchors so links can be read off the element tree
vi.mock('next/link', () => ({ default: 'a' }));

const { DeploymentFailureSummary, DiskSpaceFailureCard } = await import('./DeploymentFailureSummary');

type SummaryProps = Parameters<typeof DeploymentFailureSummary>[0];
type CardProps = Parameters<typeof DiskSpaceFailureCard>[0];

const DISK_LOGS = 'Step 4/9\n[Pushify] failureCategory=disk_space';
const DISK_ERROR = '[Server] Disk full: no space left on device';

const summary = (props: SummaryProps) => (DeploymentFailureSummary as (p: SummaryProps) => ReactNode)(props);
const card = (props: CardProps) => (DiskSpaceFailureCard as (p: CardProps) => ReactNode)(props);

/** All text in the tree (child components are not expanded). */
function text(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  if (isValidElement(node)) return text((node.props as { children?: ReactNode }).children);
  return '';
}

/** href of every link in the tree. */
function hrefs(node: ReactNode, out: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => hrefs(n, out));
  else if (isValidElement(node)) {
    const props = node.props as { href?: string; children?: ReactNode };
    if (props.href) out.push(props.href);
    hrefs(props.children, out);
  }
  return out;
}

const managedHetzner: Partial<Server> = {
  id: 'srv-1',
  name: 'prod-fsn1',
  provider: 'hetzner',
  isManaged: true,
  status: 'running',
  setupStatus: 'completed',
  diskUsedPercent: 95,
};

const health = (usedPercent: number, availGb: number) =>
  ({ disk: { usedPercent, availGb }, orphans: [], pushifyContainerCount: 1 }) as unknown as ServerHealthReport;

describe('DeploymentFailureSummary disk_space card', () => {
  beforeEach(() => {
    useServerMock.mockReset();
    useServerHealthMock.mockReset();
  });

  it('shows the disk-full card instead of the raw error when the server is known', () => {
    const tree = summary({ logs: DISK_LOGS, errorMessage: DISK_ERROR, serverId: 'srv-1' });

    expect(isValidElement(tree) && tree.type).toBe(DiskSpaceFailureCard);
    const props = (tree as { props: CardProps }).props;
    expect(props.serverId).toBe('srv-1');
    expect(props.blameLabel).toBe(en.projectDetail.failureBlameServer);
    expect(text(tree)).not.toContain('no space left');
  });

  it('names the server, shows usage and free space, and links to health and resize', () => {
    useServerMock.mockReturnValue({ data: managedHetzner });
    useServerHealthMock.mockReturnValue({ data: health(98, 0.6) });

    const tree = card({ serverId: 'srv-1', blameLabel: en.projectDetail.failureBlameServer });
    const content = text(tree);

    expect(useServerHealthMock).toHaveBeenCalledWith('srv-1', true);
    expect(content).toContain('The disk on prod-fsn1 is full');
    expect(content).toContain('98% used · 0.6 GB free');
    expect(content).toContain(en.projectDetail.diskFullOpenHealth);
    expect(content).toContain(en.projectDetail.diskFullResize);
    expect(hrefs(tree)).toEqual(['/dashboard/servers/srv-1', '/dashboard/servers/srv-1?resize=1']);
    // Nothing that could delete data is suggested
    expect(content).not.toMatch(/prune|--volumes/);
  });

  it('hides the resize action on a connected (BYOS) server', () => {
    useServerMock.mockReturnValue({
      data: { ...managedHetzner, provider: 'self_hosted', isManaged: false },
    });
    useServerHealthMock.mockReturnValue({ data: health(97, 1.2) });

    const tree = card({ serverId: 'srv-1', blameLabel: null });

    expect(hrefs(tree)).toEqual(['/dashboard/servers/srv-1']);
    expect(text(tree)).not.toContain(en.projectDetail.diskFullResize);
  });

  it('hides the resize action on a managed server outside Hetzner', () => {
    useServerMock.mockReturnValue({ data: { ...managedHetzner, provider: 'digitalocean' } });
    useServerHealthMock.mockReturnValue({ data: undefined });

    expect(hrefs(card({ serverId: 'srv-1', blameLabel: null }))).toEqual(['/dashboard/servers/srv-1']);
  });

  it('falls back to the hourly disk check when the server cannot be scanned', () => {
    useServerMock.mockReturnValue({ data: { ...managedHetzner, status: 'stopped' } });
    useServerHealthMock.mockReturnValue({ data: undefined });

    const content = text(card({ serverId: 'srv-1', blameLabel: null }));

    expect(useServerHealthMock).toHaveBeenCalledWith('srv-1', false);
    expect(content).toContain('95% used');
    expect(content).not.toContain('GB free');
  });

  it('still links to server health when the server has not loaded', () => {
    useServerMock.mockReturnValue({ data: undefined });
    useServerHealthMock.mockReturnValue({ data: undefined });

    const tree = card({ serverId: 'srv-1', blameLabel: null });

    expect(text(tree)).toContain(en.projectDetail.diskFullOnUnknownServer);
    expect(hrefs(tree)).toEqual(['/dashboard/servers/srv-1']);
  });
});

describe('DeploymentFailureSummary other cases', () => {
  beforeEach(() => {
    useServerMock.mockReset();
    useServerHealthMock.mockReset();
  });

  it('keeps the hint and raw error for other failure categories', () => {
    const errorMessage = '[Server] Killed: out of memory';
    const tree = summary({
      logs: '[Pushify] failureCategory=out_of_memory',
      errorMessage,
      serverId: 'srv-1',
    });
    const content = text(tree);

    expect(isValidElement(tree) && tree.type).toBe('div');
    expect(content).toContain(en.projectDetail.failureOutOfMemory);
    expect(content).toContain(errorMessage);
    expect(hrefs(tree)).toEqual([]);
  });

  it('keeps the plain disk_space hint when the project has no server', () => {
    const tree = summary({ logs: DISK_LOGS, errorMessage: DISK_ERROR, serverId: null });
    const content = text(tree);

    expect(isValidElement(tree) && tree.type).toBe('div');
    expect(content).toContain(en.projectDetail.failureDiskSpace);
    expect(content).toContain(DISK_ERROR);
  });

  it('renders nothing without an error or category', () => {
    expect(summary({ logs: 'all good', errorMessage: null, serverId: 'srv-1' })).toBeNull();
  });
});
