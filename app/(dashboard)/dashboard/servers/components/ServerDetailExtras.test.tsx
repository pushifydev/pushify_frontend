import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Server } from '@/lib/api';
import { en } from '@/lib/i18n/locales/en';

const confirmMock = vi.fn<(opts: { title: string; description?: unknown; variant?: string }) => Promise<boolean>>();
const deleteMutate = vi.fn();

const mutation = (mutate = vi.fn()) => ({ mutate, isPending: false });

// The panel keeps the restore target in local state; outside a renderer, hand back the initial value.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, useState: <S,>(init: S) => [init, vi.fn()] };
});
vi.mock('@/hooks/useConfirm', () => ({ useConfirm: () => confirmMock }));
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (ns: string, key: string) => (en as unknown as Record<string, Record<string, string>>)[ns][key],
    locale: 'en',
  }),
}));
vi.mock('@/hooks/useServers', () => ({
  useServerResizeOptions: () => ({ data: undefined, isLoading: false }),
  useResizeServer: () => mutation(),
  useUpdateServer: () => mutation(),
  useServerSnapshots: () => ({
    data: [{ id: 'snap-1', name: 'nightly-2026-11-01', status: 'available', sizeGb: 20, createdAt: '2026-11-01T00:00:00Z' }],
    isLoading: false,
  }),
  useCreateServerSnapshot: () => mutation(),
  useDeleteServerSnapshot: () => mutation(deleteMutate),
  useRestoreServerSnapshot: () => mutation(),
  useServerTimeline: () => ({ data: [], isLoading: false }),
  useServerSshInfo: () => ({ data: undefined, isLoading: false }),
  useDownloadServerSshKey: () => mutation(),
}));
vi.mock('@/components/Modal', () => ({ Modal: () => null, ModalActions: () => null }));

const { ServerSnapshotsPanel } = await import('./ServerDetailExtras');

type ButtonProps = { onClick?: () => unknown; 'aria-label'?: string; children?: ReactNode };

const server = {
  id: 'srv-1',
  isManaged: true,
  provider: 'hetzner',
  status: 'running',
  autoSnapshotEnabled: false,
  lastAutoSnapshotAt: null,
} as unknown as Server;

/** Host <button> elements in the tree (child components are not expanded). */
function buttons(node: ReactNode, out: ReactElement<ButtonProps>[] = []): ReactElement<ButtonProps>[] {
  if (Array.isArray(node)) node.forEach((n) => buttons(n, out));
  else if (isValidElement(node)) {
    if (node.type === 'button') out.push(node as ReactElement<ButtonProps>);
    buttons((node.props as { children?: ReactNode }).children, out);
  }
  return out;
}

function deleteButton() {
  const tree = (ServerSnapshotsPanel as (p: { server: Server }) => ReactNode)({ server });
  return buttons(tree).find((b) => b.props['aria-label'] === 'Delete: nightly-2026-11-01')!;
}

describe('ServerSnapshotsPanel delete', () => {
  beforeEach(() => {
    confirmMock.mockReset();
    deleteMutate.mockReset();
  });

  it('asks for a danger confirmation naming the snapshot before deleting it', async () => {
    confirmMock.mockResolvedValue(true);
    const button = deleteButton();
    expect(button).toBeDefined();

    await button.props.onClick!();

    expect(confirmMock).toHaveBeenCalledTimes(1);
    const opts = confirmMock.mock.calls[0][0];
    expect(opts.variant).toBe('danger');
    expect(opts.title).toBe(en.servers.snapshotDeleteTitle);
    expect(opts.description).toContain('"nightly-2026-11-01"');
    expect(deleteMutate).toHaveBeenCalledWith({ serverId: 'srv-1', snapshotId: 'snap-1' });
  });

  it('does not delete the snapshot when the confirmation is cancelled', async () => {
    confirmMock.mockResolvedValue(false);

    await deleteButton().props.onClick!();

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(deleteMutate).not.toHaveBeenCalled();
  });
});
