import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { en } from '@/lib/i18n/locales/en';

type ConfirmOptions = { title: string; description?: unknown; variant?: string; confirmText?: string };

const confirmMock = vi.fn<(opts: ConfirmOptions) => Promise<boolean>>();
const mutateAsync = vi.fn();
const push = vi.fn();
let org: { role: string; requireTwoFactor?: boolean } | undefined;
let twoFactorStatus: { enabled: boolean } | undefined;
let user: { twoFactorEnabled?: boolean } | null;

// The section keeps its error in local state; outside a renderer, hand back the initial value.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, useState: <S,>(init: S) => [init, vi.fn()] };
});
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/hooks/useConfirm', () => ({ useConfirm: () => confirmMock }));
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (ns: string, key: string) => (en as unknown as Record<string, Record<string, string>>)[ns][key],
    locale: 'en',
  }),
}));
vi.mock('@/hooks/useOrganization', () => ({
  useOrganization: () => ({ data: org }),
  useUpdateTwoFactorPolicy: () => ({ mutateAsync, isPending: false }),
}));
vi.mock('@/hooks/use2FA', () => ({ use2FAStatus: () => ({ data: twoFactorStatus }) }));
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ user }) }));

const { OrganizationSecuritySection } = await import('./OrganizationSecuritySection');
const { SettingsSwitch, SettingsField } = await import('@/components/dashboard/SettingsParts');

type SwitchProps = { checked: boolean; onChange: (next: boolean) => Promise<void>; disabled?: boolean };

/** Every element of the given component type in the tree (child components are not expanded). */
function find<P>(node: ReactNode, type: unknown, out: ReactElement<P>[] = []): ReactElement<P>[] {
  if (Array.isArray(node)) node.forEach((n) => find(n, type, out));
  else if (isValidElement(node)) {
    if (node.type === type) out.push(node as ReactElement<P>);
    find((node.props as { children?: ReactNode }).children, type, out);
  }
  return out;
}

function render() {
  return (OrganizationSecuritySection as (p: { id?: string }) => ReactNode)({ id: 'team-security' });
}

function toggle() {
  return find<SwitchProps>(render(), SettingsSwitch)[0];
}

/** Flattened text of the host elements in the tree. */
function text(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join(' ');
  if (isValidElement(node)) return text((node.props as { children?: ReactNode }).children);
  return '';
}

describe('OrganizationSecuritySection', () => {
  beforeEach(() => {
    confirmMock.mockReset();
    mutateAsync.mockReset();
    push.mockReset();
    org = { role: 'admin', requireTwoFactor: false };
    twoFactorStatus = { enabled: true };
    user = { twoFactorEnabled: true };
  });

  describe('who can change it', () => {
    it.each(['owner', 'admin'])('gives the %s a switch reflecting the policy', (role) => {
      org = { role, requireTwoFactor: true };
      const sw = toggle();
      expect(sw).toBeDefined();
      expect(sw.props.checked).toBe(true);
      expect(sw.props.disabled).toBe(false);
    });

    it.each(['member', 'viewer'])('shows the %s the state read-only, without a switch', (role) => {
      org = { role, requireTwoFactor: true };
      const tree = render();
      expect(find(tree, SettingsSwitch)).toHaveLength(0);

      const field = find<{ hint?: ReactNode; children?: ReactNode }>(tree, SettingsField)[0];
      expect(field.props.hint).toBe(en.team.requireTwoFactorReadOnly);
      expect(text(field.props.children)).toBe(en.team.requireTwoFactorOn);
    });

    it('reads a missing requireTwoFactor as off', () => {
      org = { role: 'viewer' };
      const field = find<{ children?: ReactNode }>(render(), SettingsField)[0];
      expect(text(field.props.children)).toBe(en.team.requireTwoFactorOff);
    });
  });

  describe('turning it on', () => {
    it('asks for confirmation that says members without 2FA lose access, then saves', async () => {
      confirmMock.mockResolvedValue(true);

      await toggle().props.onChange(true);

      expect(confirmMock).toHaveBeenCalledTimes(1);
      const opts = confirmMock.mock.calls[0][0];
      expect(opts.variant).toBe('warning');
      expect(opts.title).toBe(en.team.twoFactorConfirmTitle);
      expect(opts.description).toBe(en.team.twoFactorConfirmDesc);
      expect(String(opts.description)).toMatch(/haven't set up two-factor.*lose access/);
      expect(mutateAsync).toHaveBeenCalledWith(true);
    });

    it('does not save when the confirmation is cancelled', async () => {
      confirmMock.mockResolvedValue(false);

      await toggle().props.onChange(true);

      expect(mutateAsync).not.toHaveBeenCalled();
    });

    it('sends an admin without 2FA to set it up first instead of saving', async () => {
      twoFactorStatus = { enabled: false };
      confirmMock.mockResolvedValue(true);

      await toggle().props.onChange(true);

      const opts = confirmMock.mock.calls[0][0];
      expect(opts.title).toBe(en.team.twoFactorOwnFirstTitle);
      expect(opts.confirmText).toBe(en.team.twoFactorOwnFirstCta);
      expect(push).toHaveBeenCalledWith('/dashboard/settings?tab=security');
      expect(mutateAsync).not.toHaveBeenCalled();
    });

    it('stays on the page when the admin without 2FA cancels', async () => {
      twoFactorStatus = { enabled: false };
      confirmMock.mockResolvedValue(false);

      await toggle().props.onChange(true);

      expect(push).not.toHaveBeenCalled();
      expect(mutateAsync).not.toHaveBeenCalled();
    });

    it('uses the signed-in user while the 2FA status is still loading', async () => {
      twoFactorStatus = undefined;
      user = { twoFactorEnabled: false };
      confirmMock.mockResolvedValue(false);

      await toggle().props.onChange(true);

      expect(confirmMock.mock.calls[0][0].title).toBe(en.team.twoFactorOwnFirstTitle);
    });
  });

  it('turns it off without a confirmation', async () => {
    org = { role: 'owner', requireTwoFactor: true };

    await toggle().props.onChange(false);

    expect(confirmMock).not.toHaveBeenCalled();
    expect(mutateAsync).toHaveBeenCalledWith(false);
  });
});
