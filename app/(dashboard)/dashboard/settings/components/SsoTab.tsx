'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  deleteSsoConnection,
  getSsoConnection,
  saveSsoConnection,
  type SsoConnection,
} from '@/lib/api';
import { SettingsField, SettingsSection, SettingsSwitch } from '@/components/dashboard/SettingsParts';
import { Modal, ModalActions, AlertBox } from './Modal';

/**
 * The organization's identity provider (OpenID Connect). Owners only, because a connection
 * decides who gets into the organization: anyone the provider vouches for, in the domains
 * claimed here, becomes a member.
 */
export function SsoTab() {
  const { t, locale } = useTranslation();
  const [connection, setConnection] = useState<SsoConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyRedirect = async () => {
    await navigator.clipboard?.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SettingsSection
        id="sso"
        title={t('sso', 'title')}
        description={t('sso', 'description')}
        action={
          !loading && connection ? (
            <>
              <span className="badge badge-success">{locale === 'tr' ? 'Bağlı' : 'Connected'}</span>
              {connection.enforced && <span className="badge badge-neutral">{locale === 'tr' ? 'Zorunlu' : 'Required'}</span>}
            </>
          ) : undefined
        }
        footer={
          loading ? undefined : (
            <>
              <button onClick={save} disabled={saving} className="btn btn-primary">
                {saving ? t('common', 'loading') : t('common', 'save')}
              </button>
              {saved && (
                <span className="text-[13px] text-[var(--status-success)] inline-flex items-center gap-1" role="status">
                  <Check className="w-4 h-4" />
                  {t('sso', 'saved')}
                </span>
              )}
              {connection && (
                <button onClick={() => setConfirmRemove(true)} className="btn btn-secondary text-[var(--status-error)] sm:ml-auto">
                  <Trash2 className="w-4 h-4" />
                  {t('sso', 'remove')}
                </button>
              )}
            </>
          )
        }
      >
        {loading ? (
          [0, 1, 2].map((i) => (
            <SettingsField key={i} label={<span className="dash-skeleton inline-block h-3.5 w-24 rounded" aria-hidden />}>
              <div className="dash-skeleton h-10 w-full rounded-[10px]" aria-hidden />
            </SettingsField>
          ))
        ) : (
          <>
            {error && (
              <div className="pt-4">
                <AlertBox variant="error">{error}</AlertBox>
              </div>
            )}

            {redirectUri && (
              <SettingsField label={t('sso', 'redirectUri')}>
                <div className="flex items-center gap-1 h-10 pl-3 pr-1 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] min-w-0">
                  <code className="terminal-text text-[13px] flex-1 min-w-0 truncate text-[var(--text-primary)]" title={redirectUri}>
                    {redirectUri}
                  </code>
                  <button
                    type="button"
                    onClick={copyRedirect}
                    className="dash-icon-action w-8! h-8!"
                    aria-label={t('sso', 'copy')}
                  >
                    {copied ? <Check className="w-4 h-4 text-[var(--status-success)]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </SettingsField>
            )}

            <SettingsField label={t('sso', 'issuer')} hint={t('sso', 'issuerHint')} htmlFor="sso-issuer">
              <input
                id="sso-issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="https://acme.okta.com"
                className="input w-full terminal-text"
              />
            </SettingsField>

            <SettingsField label={t('sso', 'clientId')} htmlFor="sso-client-id">
              <input
                id="sso-client-id"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input w-full terminal-text"
              />
            </SettingsField>

            <SettingsField
              label={t('sso', 'clientSecret')}
              hint={connection ? t('sso', 'clientSecretKeep') : t('sso', 'clientSecretHint')}
              htmlFor="sso-client-secret"
            >
              <input
                id="sso-client-secret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                autoComplete="new-password"
                placeholder={connection ? '••••••••' : ''}
                className="input w-full terminal-text"
              />
            </SettingsField>

            <SettingsField label={t('sso', 'domains')} hint={t('sso', 'domainsHint')} htmlFor="sso-domains">
              <input
                id="sso-domains"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                placeholder="acme.com, acme.co.uk"
                className="input w-full terminal-text"
              />
            </SettingsField>

            <SettingsField label={t('sso', 'defaultRole')} hint={t('sso', 'defaultRoleHint')} htmlFor="sso-default-role">
              <select
                id="sso-default-role"
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
                className="select"
              >
                <option value="member">{t('sso', 'roleMember')}</option>
                <option value="admin">{t('sso', 'roleAdmin')}</option>
              </select>
            </SettingsField>

            <SettingsField label={t('sso', 'enforce')} hint={t('sso', 'enforceHint')} htmlFor="sso-enforce">
              <div className="md:pt-2">
                <SettingsSwitch id="sso-enforce" label={t('sso', 'enforce')} checked={enforced} onChange={setEnforced} />
              </div>
            </SettingsField>
          </>
        )}
      </SettingsSection>

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
    </>
  );
}
