import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/lib/i18n/locales/en';

const confirmMock = vi.fn<(opts: { title: string; description?: unknown; variant?: string }) => Promise<boolean>>();
const removeDns = vi.fn();
const removeForwarding = vi.fn();

const mutation = (mutate = vi.fn()) => ({ mutate, mutateAsync: vi.fn(), isPending: false });

// Outside a renderer, local state is just its initial value; tests override the page's tab via mockImplementationOnce.
const useStateMock = vi.fn(<S,>(init: S) => [init, vi.fn()]);
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, useState: (init: unknown) => useStateMock(init) };
});
vi.mock('next/navigation', () => ({ useParams: () => ({ domain: 'example.com' }) }));
vi.mock('@/hooks/useConfirm', () => ({ useConfirm: () => confirmMock }));
vi.mock('@/hooks', () => ({
  useTranslation: () => ({
    t: (ns: string, key: string) => (en as unknown as Record<string, Record<string, string>>)[ns][key],
    locale: 'en',
  }),
  useDomainDetails: () => ({
    data: { domain: { status: 'active', expiresAt: '2027-11-01T00:00:00Z' }, locked: true, nameservers: [] },
    isLoading: false,
  }),
  useDomainDns: () => ({
    data: [{ id: 'rec-1', host: '', fqdn: 'example.com', type: 'A', answer: '203.0.113.10', ttl: 300 }],
    isLoading: false,
  }),
  useDnsMutations: () => ({ create: mutation(), remove: mutation(removeDns) }),
  useDomainForwarding: () => ({ data: [{ emailBox: 'info', emailTo: 'me@inbox.test' }], isLoading: false }),
  useForwardingMutations: () => ({ add: mutation(), remove: mutation(removeForwarding) }),
  useDomainSettingsMutations: () => ({ lock: mutation(), nameservers: mutation(), authCode: mutation() }),
}));
vi.mock('@/components/ui/select', () => ({ Select: () => null }));

const { default: DomainDetailPage } = await import('./page');

type ButtonProps = { onClick?: () => unknown; 'aria-label'?: string; children?: ReactNode };

function findAll(node: ReactNode, match: (el: ReactElement) => boolean, out: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(node)) node.forEach((n) => findAll(n, match, out));
  else if (isValidElement(node)) {
    if (match(node)) out.push(node);
    findAll((node.props as { children?: ReactNode }).children, match, out);
  }
  return out;
}

/** Render the page on `tab`, expand that tab's component, and return its delete button. */
function deleteButton(tab: 'dns' | 'forwarding', component: string, label: string) {
  useStateMock.mockImplementationOnce(() => [tab, vi.fn()]);
  const page = (DomainDetailPage as () => ReactNode)();
  const [tabEl] = findAll(page, (el) => typeof el.type === 'function' && el.type.name === component);
  const tabTree = (tabEl.type as (p: unknown) => ReactNode)(tabEl.props);
  return findAll(tabTree, (el) => el.type === 'button' && (el.props as ButtonProps)['aria-label'] === label)[0] as
    | ReactElement<ButtonProps>
    | undefined;
}

describe('DomainDetailPage destructive actions', () => {
  beforeEach(() => {
    confirmMock.mockReset();
    removeDns.mockReset();
    removeForwarding.mockReset();
  });

  it('confirms a DNS record delete with its type, host and answer before removing it', async () => {
    confirmMock.mockResolvedValue(true);
    const button = deleteButton('dns', 'DnsTab', 'Delete A @');
    expect(button).toBeDefined();

    await button!.props.onClick!();

    const opts = confirmMock.mock.calls[0][0];
    expect(opts.variant).toBe('danger');
    expect(opts.title).toBe(en.domainSales.dnsDeleteTitle);
    expect(opts.description).toContain('A record for @');
    expect(opts.description).toContain('203.0.113.10');
    expect(removeDns).toHaveBeenCalledWith('rec-1');
  });

  it('keeps the DNS record when the confirmation is cancelled', async () => {
    confirmMock.mockResolvedValue(false);

    await deleteButton('dns', 'DnsTab', 'Delete A @')!.props.onClick!();

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(removeDns).not.toHaveBeenCalled();
  });

  it('confirms an email forwarding delete naming both addresses before removing it', async () => {
    confirmMock.mockResolvedValue(true);
    const button = deleteButton('forwarding', 'ForwardingTab', 'Delete info@example.com');
    expect(button).toBeDefined();

    await button!.props.onClick!();

    const opts = confirmMock.mock.calls[0][0];
    expect(opts.variant).toBe('danger');
    expect(opts.title).toBe(en.domainSales.fwdDeleteTitle);
    expect(opts.description).toContain('info@example.com');
    expect(opts.description).toContain('me@inbox.test');
    expect(removeForwarding).toHaveBeenCalledWith('info');
  });

  it('keeps the forwarding when the confirmation is cancelled', async () => {
    confirmMock.mockResolvedValue(false);

    await deleteButton('forwarding', 'ForwardingTab', 'Delete info@example.com')!.props.onClick!();

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(removeForwarding).not.toHaveBeenCalled();
  });
});
