'use client';

import { useEffect, useState } from 'react';
import { Copy, KeyRound, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  deleteSsoConnection,
  getSsoConnection,
  saveSsoConnection,
  type SsoConnection,
} from '@/lib/api';
import { SettingsCard } from './SettingsCard';
import { Modal, ModalActions, AlertBox } from './Modal';

/**
 * The organization's identity provider (OpenID Connect). Owners only, because a connection
 * decides who gets into the organization: anyone the provider vouches for, in the domains
 * claimed here, becomes a member.
 */
export function SsoTab() {
  const { t } = useTranslation();
  const [connection, setConnection] = useState<SsoConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [issuer, setIssuer] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [domains, setDomains] = useState('');
  const [enforced, setEnforced] = useState(false);
  const [defaultRole, setDefaultRole] = useState('member');

  const apply = (value: SsoConnection | null) => {
    setConnection(value);
    setIssuer(value?.issuer ?? '');
    setClientId(value?.clientId ?? '');
    setClientSecret('');
    setDomains((value?.emailDomains ?? []).join(', '));
    setEnforced(value?.enforced ?? false);
    setDefaultRole(value?.defaultRole ?? 'member');
  };

  useEffect(() => {
    getSsoConnection().then((result) => {
      if (result.data !== undefined) apply(result.data);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    const result = await saveSsoConnection({
      issuer: issuer.trim(),
      clientId: clientId.trim(),
      clientSecret: clientSecret || undefined,
      emailDomains: domains
        .split(/[,\s]+/)
        .map((domain) => domain.trim())
        .filter(Boolean),
      enforced,
      defaultRole,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    if (result.data) apply(result.data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const remove = async () => {
    await deleteSsoConnection();
    apply(null);
    setConfirmRemove(false);
  };

  const redirectUri = connection?.redirectUri ?? '';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold mb-1">{t('sso', 'title')}</h2>
        <p className="text-[var(--text-secondary)]">{t('sso', 'description')}</p>
      </div>

      {loading ? (
        <SettingsCard title={t('sso', 'provider')}>
          <p className="text-[var(--text-muted)]">{t('common', 'loading')}</p>
        </SettingsCard>
      ) : (
        <>
          {redirectUri && (
            <div className="dash-panel px-4 py-3.5">
              <p className="text-sm mb-1.5 text-[var(--text-secondary)]">{t('sso', 'redirectUri')}</p>
              <div className="flex items-center gap-2">
                <code className="terminal-text text-sm break-all flex-1">{redirectUri}</code>
                <button
                  onClick={() => navigator.clipboard?.writeText(redirectUri)}
                  className="btn btn-ghost h-8 text-xs shrink-0"
                  aria-label={t('sso', 'copy')}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <SettingsCard title={t('sso', 'provider')}>
            <div className="space-y-4">
              {error && <AlertBox variant="error">{error}</AlertBox>}

              <label className="block">
                <span className="text-sm font-medium">{t('sso', 'issuer')}</span>
                <input
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="https://acme.okta.com"
                  className="input w-full mt-1 terminal-text"
                />
                <span className="text-xs text-[var(--text-muted)]">{t('sso', 'issuerHint')}</span>
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t('sso', 'clientId')}</span>
                <input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="input w-full mt-1 terminal-text"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t('sso', 'clientSecret')}</span>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  autoComplete="new-password"
                  placeholder={connection ? '••••••••' : ''}
                  className="input w-full mt-1 terminal-text"
                />
                <span className="text-xs text-[var(--text-muted)]">
                  {connection ? t('sso', 'clientSecretKeep') : t('sso', 'clientSecretHint')}
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t('sso', 'domains')}</span>
                <input
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                  placeholder="acme.com, acme.co.uk"
                  className="input w-full mt-1 terminal-text"
                />
                <span className="text-xs text-[var(--text-muted)]">{t('sso', 'domainsHint')}</span>
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t('sso', 'defaultRole')}</span>
                <select
                  value={defaultRole}
                  onChange={(e) => setDefaultRole(e.target.value)}
                  className="input w-full mt-1"
                >
                  <option value="member">{t('sso', 'roleMember')}</option>
                  <option value="admin">{t('sso', 'roleAdmin')}</option>
                </select>
                <span className="text-xs text-[var(--text-muted)]">{t('sso', 'defaultRoleHint')}</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforced}
                  onChange={(e) => setEnforced(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="text-sm font-medium block">{t('sso', 'enforce')}</span>
                  <span className="text-xs text-[var(--text-muted)]">{t('sso', 'enforceHint')}</span>
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1">
                <button onClick={save} disabled={saving} className="btn btn-primary">
                  <KeyRound className="w-4 h-4" />
                  {saving ? t('common', 'loading') : t('common', 'save')}
                </button>
                {saved && <span className="text-sm text-[var(--status-success)]">{t('sso', 'saved')}</span>}
                {connection && (
                  <button onClick={() => setConfirmRemove(true)} className="btn btn-ghost ml-auto">
                    <Trash2 className="w-4 h-4" />
                    {t('sso', 'remove')}
                  </button>
                )}
              </div>
            </div>
          </SettingsCard>
        </>
      )}

      <Modal isOpen={confirmRemove} onClose={() => setConfirmRemove(false)} title={t('sso', 'remove')}>
        <p className="text-[var(--text-secondary)]">{t('sso', 'removeConfirm')}</p>
        <ModalActions>
          <button onClick={() => setConfirmRemove(false)} className="btn btn-ghost">
            {t('common', 'cancel')}
          </button>
          <button onClick={remove} className="btn btn-danger">
            {t('sso', 'remove')}
          </button>
        </ModalActions>
      </Modal>
    </div>
  );
}
