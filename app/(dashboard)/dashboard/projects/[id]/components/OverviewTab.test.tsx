import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Deployment } from '@/lib/api/types';
import { findLastGoodDeployment } from '@/lib/deployment-utils';

const confirmMock = vi.fn<(opts: unknown) => Promise<boolean>>();

vi.mock('@/hooks/useConfirm', () => ({ useConfirm: () => confirmMock }));
vi.mock('@/hooks', () => ({}));
vi.mock('@/lib/api', () => ({}));
vi.mock('@/components/DeploymentFailureSummary', () => ({ DeploymentFailureSummary: () => null }));
vi.mock('@/components/DeploymentTimeline', () => ({ DeploymentTimeline: () => null }));
vi.mock('./MetricsSection', () => ({ MetricsSection: () => null }));

const { LastGoodRollback } = await import('./OverviewTab');

type Props = Parameters<typeof LastGoodRollback>[0];
type ButtonProps = {
  onClick?: () => unknown;
  disabled?: boolean;
  title?: string;
  'aria-busy'?: boolean;
  children?: ReactNode;
};

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
    lastGood: dep('a', 'running'),
    canRollback: true,
    pending: false,
    onRollback,
    t,
    ...overrides,
  };
  // The component only uses useConfirm (mocked), so it can be called as a plain function.
  const tree = (LastGoodRollback as (p: Props) => ReactNode)(props);
  return { tree, onRollback: props.onRollback as ReturnType<typeof vi.fn> };
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

describe('OverviewTab rollback to last working deploy', () => {
  beforeEach(() => confirmMock.mockReset());

  it('asks for confirmation before calling the rollback endpoint', async () => {
    confirmMock.mockResolvedValue(true);
    const { tree, onRollback } = render();
    const [button] = buttons(tree);
    expect(button.props.disabled).toBe(false);

    await button.props.onClick!();

    expect(confirmMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'rollbackConfirmTitle', variant: 'warning' }),
    );
    expect(onRollback).toHaveBeenCalledWith('a');
  });

  it('does not call the endpoint when the dialog is cancelled', async () => {
    confirmMock.mockResolvedValue(false);
    const { tree, onRollback } = render();
    await buttons(tree)[0].props.onClick!();
    expect(onRollback).not.toHaveBeenCalled();
  });

  it('stays visible but disabled for roles that cannot deploy', async () => {
    const { tree, onRollback } = render({ canRollback: false });
    const btns = buttons(tree);
    expect(btns).toHaveLength(1);
    expect(btns[0].props.disabled).toBe(true);
    expect(btns[0].props.title).toBe('viewerDesc');

    await btns[0].props.onClick!();
    expect(confirmMock).not.toHaveBeenCalled();
    expect(onRollback).not.toHaveBeenCalled();
  });

  it('is disabled while a rollback is in flight', async () => {
    const { tree, onRollback } = render({ pending: true });
    const [button] = buttons(tree);
    expect(button.props.disabled).toBe(true);
    expect(button.props['aria-busy']).toBe(true);

    await button.props.onClick!();
    expect(confirmMock).not.toHaveBeenCalled();
    expect(onRollback).not.toHaveBeenCalled();
  });

  it('is only offered when an earlier deploy succeeded', () => {
    // OverviewTab renders LastGoodRollback only when findLastGoodDeployment finds one.
    expect(findLastGoodDeployment([dep('b', 'failed'), dep('a', 'running')])?.id).toBe('a');
    expect(findLastGoodDeployment([dep('c', 'failed'), dep('d', 'failed')])).toBeNull();
    expect(findLastGoodDeployment([dep('a', 'running'), dep('b', 'failed')])).toBeNull();
  });
});
