import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Deployment } from '@/lib/api/types';

const confirmMock = vi.fn<(opts: unknown) => Promise<boolean>>();

vi.mock('@/hooks/useConfirm', () => ({ useConfirm: () => confirmMock }));
vi.mock('@/hooks', () => ({}));
vi.mock('@/components/DeploymentFailureSummary', () => ({ DeploymentFailureSummary: () => null }));
vi.mock('@/components/DeploymentTimeline', () => ({ DeploymentTimeline: () => null }));

const { DeploymentsTab } = await import('./DeploymentsTab');

type Props = Parameters<typeof DeploymentsTab>[0];
type ButtonProps = { onClick?: () => unknown; disabled?: boolean; 'aria-busy'?: boolean; children?: ReactNode };

const t = ((_ns: string, key: string) => key) as unknown as Props['t'];

function dep(id: string, status: Deployment['status']): Deployment {
  return {
    id,
    status,
    branch: 'main',
    commitHash: `${id}abcdef0`,
    commitMessage: null,
    createdAt: '2026-10-01T00:00:00Z',
  } as unknown as Deployment;
}

function render(overrides: Partial<Props> = {}) {
  const onRollback = vi.fn();
  const props: Props = {
    deployments: [dep('b', 'failed'), dep('a', 'running')],
    formatTimeAgo: () => 'now',
    getStatusBadge: () => '',
    onCancel: vi.fn(),
    onRollback,
    onViewLogs: vi.fn(),
    onViewContainerLogs: vi.fn(),
    onViewHistoricalLogs: vi.fn(),
    t,
    ...overrides,
  };
  // The component only uses useConfirm (mocked), so it can be called as a plain function.
  const tree = (DeploymentsTab as (p: Props) => ReactNode)(props);
  return { tree, onRollback: props.onRollback as ReturnType<typeof vi.fn> };
}

function text(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  if (isValidElement(node)) return text((node.props as { children?: ReactNode }).children);
  return '';
}

/** Host <button> elements in the tree (child components are not expanded). */
function buttons(node: ReactNode, out: ReactElement<ButtonProps>[] = []): ReactElement<ButtonProps>[] {
  if (Array.isArray(node)) node.forEach((n) => buttons(n, out));
  else if (isValidElement(node)) {
    if (node.type === 'button') out.push(node as ReactElement<ButtonProps>);
    buttons((node.props as { children?: ReactNode }).children, out);
  }
  return out;
}

const rollbackButtons = (tree: ReactNode) =>
  buttons(tree).filter((b) => /rollbackToVersion|rollbackToLastGood/.test(text(b)));

describe('DeploymentsTab rollback', () => {
  beforeEach(() => confirmMock.mockReset());

  it('shows rollback on the successful deploy and asks for confirmation before calling the endpoint', async () => {
    confirmMock.mockResolvedValue(true);
    const { tree, onRollback } = render();
    const restore = rollbackButtons(tree).find((b) => text(b).includes('rollbackToVersion'))!;
    expect(restore).toBeDefined();

    await restore.props.onClick!();

    expect(confirmMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'rollbackConfirmTitle', variant: 'warning' }),
    );
    expect(onRollback).toHaveBeenCalledWith('a');
  });

  it('offers "rollback to last good" on a failed latest deploy', async () => {
    confirmMock.mockResolvedValue(true);
    const { tree, onRollback } = render();
    const lastGood = rollbackButtons(tree).find((b) => text(b).includes('rollbackToLastGood'))!;
    await lastGood.props.onClick!();
    expect(onRollback).toHaveBeenCalledWith('a');
  });

  it('does not call the endpoint when the dialog is cancelled', async () => {
    confirmMock.mockResolvedValue(false);
    const { tree, onRollback } = render();
    await rollbackButtons(tree)[0].props.onClick!();
    expect(onRollback).not.toHaveBeenCalled();
  });

  it('hides rollback when there is no successful deploy', () => {
    const { tree } = render({ deployments: [dep('c', 'failed'), dep('d', 'failed')] });
    expect(rollbackButtons(tree)).toHaveLength(0);
  });

  it('hides rollback for roles that cannot deploy', () => {
    const { tree } = render({ canRollback: false });
    expect(rollbackButtons(tree)).toHaveLength(0);
  });

  it('disables rollback buttons while a rollback is in flight', async () => {
    const { tree, onRollback } = render({ rollbackPendingId: 'a' });
    const btns = rollbackButtons(tree);
    expect(btns.length).toBeGreaterThan(0);
    for (const b of btns) {
      expect(b.props.disabled).toBe(true);
      expect(b.props['aria-busy']).toBe(true);
    }
    await btns[0].props.onClick!();
    expect(confirmMock).not.toHaveBeenCalled();
    expect(onRollback).not.toHaveBeenCalled();
  });
});
