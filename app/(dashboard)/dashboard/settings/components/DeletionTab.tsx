'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation, useOrganization } from '@/hooks';
import { use2FAStatus } from '@/hooks/use2FA';
import { organizationKeys } from '@/hooks/useOrganization';
import { useAuthStore } from '@/stores/auth';
import {
  getOrganizationDeletionPreview,
  requestAccountDeletion,
  requestOrganizationDeletion,
  restoreOrganization,
  isConfirmationSent,
  type DeletionScheduled,
} from '@/lib/api';
import { SettingsSection } from '@/components/dashboard/SettingsParts';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import { CommandLine } from '@/components/CommandLine';

/**
 * Deleting the organization (owner) or the account. Both lock everything at once and are purged
 * 30 days later; until then the organization can be restored here and the account at sign-in.
 * Copy is inline, next to what it describes (Privacy Policy §4).
 */
const copy = {
  en: {
    orgTitle: 'Delete organization',
    orgDesc: 'Removes the organization and everything in it after 30 days. You can restore it until then.',
    orgButton: 'Delete organization…',
    ownerOnly: 'Only the owner can delete this organization.',
    scheduled: (date: string) => `This organization will be permanently deleted on ${date}. It is read-only until then.`,
    restore: 'Restore organization',
    accountTitle: 'Delete account',
    accountDesc:
      'Removes your account after 30 days, with the organizations you own. If one of them has other members, delete that organization first.',
    accountButton: 'Delete account…',
    now: 'Right away',
    nowItems: [
      'This organization’s API keys stop working and its subscription is cancelled (the rest of the period is not refunded).',
      'Managed servers are powered off. They are deleted with everything else after 30 days.',
      'Sites on Pushify’s shared hosting go offline.',
      'Pushify’s SSH key is removed from servers you connected. Your apps keep running there.',
    ],
    later: 'After 30 days: projects, deployments, logs, databases and their backups are deleted. Backup copies are gone within a further 30 days.',
    wallet: (usd: string) => `Your remaining wallet balance is $${usd}. Write to support@pushify.dev to have it refunded.`,
    included: 'This month’s included server credit is not refunded; it is removed.',
    managedServers: 'Managed servers',
    connectedServers: 'Connected servers',
    domains: 'Domains',
    domainsNote:
      'They stay registered until they expire and are not renewed. To keep one, get its transfer code from Domains first.',
    backupsFirst: 'Download database backups first',
    confirmOrg: (name: string) => `Type ${name} to confirm`,
    confirmAccount: (email: string) => `Type ${email} to confirm`,
    password: 'Password',
    twoFactor: 'Two-factor code',
    cancel: 'Cancel',
    delete: 'Delete',
    deleting: 'Deleting…',
    doneTitle: 'Deletion scheduled',
    doneBody: (date: string) => `Permanent deletion on ${date}. We sent the details by email.`,
    manualTitle: 'These servers could not be reached. Run this as root on each to remove Pushify’s SSH key:',
    close: 'Close',
    signOut: 'Sign out',
    emailConfirmNote: 'Your account has no password or two-factor code, so we will email you a link to confirm. The deletion starts when you click it.',
    checkEmailTitle: 'Check your email',
    checkEmailBody: 'We sent a confirmation link to your email address. The deletion starts when you click it. The link works once, for one hour.',
    sendLink: 'Email me the link',
  },
  tr: {
    orgTitle: 'Organizasyonu sil',
    orgDesc: 'Organizasyonu ve içindeki her şeyi 30 gün sonra siler. O zamana kadar geri alabilirsiniz.',
    orgButton: 'Organizasyonu sil…',
    ownerOnly: 'Bu organizasyonu yalnızca sahibi silebilir.',
    scheduled: (date: string) => `Bu organizasyon ${date} tarihinde kalıcı olarak silinecek. O zamana kadar salt okunur.`,
    restore: 'Organizasyonu geri al',
    accountTitle: 'Hesabı sil',
    accountDesc:
      'Hesabınızı, sahibi olduğunuz organizasyonlarla birlikte 30 gün sonra siler. Birinde başka üyeler varsa önce o organizasyonu silin.',
    accountButton: 'Hesabı sil…',
    now: 'Hemen',
    nowItems: [
      'Bu organizasyonun API anahtarları iptal edilir ve abonelik iptal edilir (dönemin kalanı iade edilmez).',
      'Yönetilen sunucular kapatılır; 30 gün sonra diğer her şeyle birlikte silinir.',
      'Pushify’ın paylaşımlı barındırmasındaki siteler kapanır.',
      'Bağladığınız sunuculardan Pushify’ın SSH anahtarı kaldırılır. Uygulamalarınız orada çalışmaya devam eder.',
    ],
    later: '30 gün sonra: projeler, deploy’lar, loglar, veritabanları ve yedekleri silinir. Yedek kopyalar sonraki 30 gün içinde gider.',
    wallet: (usd: string) => `Kalan cüzdan bakiyeniz $${usd}. İade için support@pushify.dev adresine yazabilirsiniz.`,
    included: 'Bu ayın dahil sunucu kredisi iade edilmez; silinir.',
    managedServers: 'Yönetilen sunucular',
    connectedServers: 'Bağlı sunucular',
    domains: 'Domain’ler',
    domainsNote: 'Süreleri dolana kadar kayıtlı kalır ve yenilenmez. Birini tutmak için önce Domain’ler sayfasından transfer kodunu alın.',
    backupsFirst: 'Önce veritabanı yedeklerini indirin',
    confirmOrg: (name: string) => `Onaylamak için ${name} yazın`,
    confirmAccount: (email: string) => `Onaylamak için ${email} yazın`,
    password: 'Şifre',
    twoFactor: 'İki adımlı doğrulama kodu',
    cancel: 'Vazgeç',
    delete: 'Sil',
    deleting: 'Siliniyor…',
    doneTitle: 'Silme planlandı',
    doneBody: (date: string) => `Kalıcı silme ${date} tarihinde. Ayrıntıları e-postayla gönderdik.`,
    manualTitle: 'Bu sunuculara ulaşılamadı. Pushify’ın SSH anahtarını kaldırmak için her birinde root olarak çalıştırın:',
    close: 'Kapat',
    signOut: 'Çıkış yap',
    emailConfirmNote: 'Hesabınızda şifre ya da iki adımlı doğrulama olmadığı için onay bağlantısını e-postanıza göndereceğiz. Silme, bağlantıya tıkladığınızda başlar.',
    checkEmailTitle: 'E-postanızı kontrol edin',
    checkEmailBody: 'E-posta adresinize bir onay bağlantısı gönderdik. Silme, bağlantıya tıkladığınızda başlar. Bağlantı 1 saat geçerli ve bir kez kullanılabilir.',
    sendLink: 'Bağlantıyı gönder',
  },
};

type Copy = (typeof copy)['en'];

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ScheduledResult({ result, c, locale, onClose, closeLabel }: { result: DeletionScheduled; c: Copy; locale: string; onClose: () => void; closeLabel: string }) {
  const manual = result.servers.filter((s) => !s.keyRemoved && s.manualCommand);
  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">{c.doneBody(formatDate(result.scheduledFor, locale))}</p>
        {manual.length > 0 && (
          <>
            <AlertBox variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
              {c.manualTitle}
            </AlertBox>
            {manual.map((s) => (
              <div key={s.serverId} className="space-y-1.5">
                <p className="text-xs font-medium text-[var(--text-primary)]">{s.name}{s.host ? ` · ${s.host}` : ''}</p>
                <CommandLine command={s.manualCommand!} />
              </div>
            ))}
          </>
        )}
        {result.walletBalanceCents > 0 && (
          <p className="text-sm text-[var(--text-secondary)]">{c.wallet((result.walletBalanceCents / 100).toFixed(2))}</p>
        )}
      </div>
      <ModalActions>
        <button type="button" onClick={onClose} className="btn btn-primary">
          {closeLabel}
        </button>
      </ModalActions>
    </>
  );
}

function CheckEmail({ c, onClose }: { c: Copy; onClose: () => void }) {
  return (
    <Modal isOpen onClose={onClose} title={c.checkEmailTitle}>
      <p className="text-sm text-[var(--text-secondary)]">{c.checkEmailBody}</p>
      <ModalActions>
        <button type="button" onClick={onClose} className="btn btn-primary">
          {c.close}
        </button>
      </ModalActions>
    </Modal>
  );
}

function CredentialFields({
  c,
  hasPassword,
  twoFactor,
  password,
  setPassword,
  code,
  setCode,
}: {
  c: Copy;
  hasPassword: boolean;
  twoFactor: boolean;
  password: string;
  setPassword: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
}) {
  return (
    <>
      {!hasPassword && !twoFactor && <p className="text-sm text-[var(--text-secondary)]">{c.emailConfirmNote}</p>}
      {hasPassword && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">{c.password}</span>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
      )}
      {twoFactor && (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">{c.twoFactor}</span>
          <input
            type="text"
            className="input font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
            autoComplete="one-time-code"
            maxLength={16}
          />
        </label>
      )}
    </>
  );
}

function DeleteOrganizationModal({ c, locale, onClose }: { c: Copy; locale: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: twoFactorStatus } = use2FAStatus();
  const { data: preview, isLoading } = useQuery({
    queryKey: ['organization', 'deletion-preview'],
    queryFn: async () => {
      const r = await getOrganizationDeletionPreview();
      if (r.error) throw new Error(r.error.message);
      return r.data!;
    },
  });
  const [confirm, setConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DeletionScheduled | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const hasPassword = user?.hasPassword ?? true;
  const twoFactor = !!twoFactorStatus?.enabled;
  const ready = !!preview && confirm.trim() === preview.name && (!hasPassword || password) && (!twoFactor || code.length >= 6);

  const submit = async () => {
    setError(null);
    setPending(true);
    const r = await requestOrganizationDeletion({ confirmName: confirm.trim(), password: password || undefined, twoFactorCode: code || undefined });
    setPending(false);
    if (r.error) return setError(r.error.message);
    if (isConfirmationSent(r.data!)) return setEmailSent(true);
    setResult(r.data!);
  };

  const finish = () => {
    queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    onClose();
  };

  if (emailSent) return <CheckEmail c={c} onClose={onClose} />;

  if (result) {
    return (
      <Modal isOpen onClose={finish} title={c.doneTitle}>
        <ScheduledResult result={result} c={c} locale={locale} onClose={finish} closeLabel={c.close} />
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title={c.orgTitle}>
      {isLoading || !preview ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : (
        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
          <AlertBox variant="error" icon={<AlertTriangle className="w-4 h-4" />}>
            <strong>{c.now}:</strong>
            <ul className="mt-1.5 list-disc pl-4 space-y-1">
              {c.nowItems.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </AlertBox>
          <p>{c.later}</p>
          {preview.managedServers.length > 0 && (
            <p>
              <strong className="text-[var(--text-primary)]">{c.managedServers}:</strong> {preview.managedServers.map((s) => s.name).join(', ')}
            </p>
          )}
          {preview.connectedServers.length > 0 && (
            <p>
              <strong className="text-[var(--text-primary)]">{c.connectedServers}:</strong> {preview.connectedServers.map((s) => s.name).join(', ')}
            </p>
          )}
          {preview.domains.length > 0 && (
            <p>
              <strong className="text-[var(--text-primary)]">{c.domains}:</strong> {preview.domains.map((d) => d.domainName).join(', ')}.{' '}
              {c.domainsNote}{' '}
              <Link href="/dashboard/domains" className="underline">
                {c.domains}
              </Link>
            </p>
          )}
          {preview.walletBalanceCents > 0 && <p>{c.wallet((preview.walletBalanceCents / 100).toFixed(2))}</p>}
          {preview.includedCreditCents > 0 && <p>{c.included}</p>}
          <p>
            <Link href="/dashboard/databases" className="underline">
              {c.backupsFirst}
            </Link>
          </p>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--text-primary)]">{c.confirmOrg(preview.name)}</span>
            <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
          </label>
          <CredentialFields c={c} hasPassword={hasPassword} twoFactor={twoFactor} password={password} setPassword={setPassword} code={code} setCode={setCode} />
          {error && <AlertBox variant="error">{error}</AlertBox>}
        </div>
      )}
      <ModalActions>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          {c.cancel}
        </button>
        <button type="button" onClick={submit} disabled={!ready || pending} className="btn btn-danger">
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {c.deleting}
            </>
          ) : !hasPassword && !twoFactor ? (
            c.sendLink
          ) : (
            c.delete
          )}
        </button>
      </ModalActions>
    </Modal>
  );
}

function DeleteAccountModal({ c, locale, onClose }: { c: Copy; locale: string; onClose: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: twoFactorStatus } = use2FAStatus();
  const [confirm, setConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<DeletionScheduled | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const email = user?.email ?? '';
  const hasPassword = user?.hasPassword ?? true;
  const twoFactor = !!twoFactorStatus?.enabled;
  const ready = !!email && confirm.trim().toLowerCase() === email.toLowerCase() && (!hasPassword || password) && (!twoFactor || code.length >= 6);

  const submit = async () => {
    setError(null);
    setPending(true);
    const r = await requestAccountDeletion({ confirmEmail: confirm.trim(), password: password || undefined, twoFactorCode: code || undefined });
    setPending(false);
    if (r.error) return setError(r.error.message);
    if (isConfirmationSent(r.data!)) return setEmailSent(true);
    setResult(r.data!);
  };

  // The account has no sessions any more: leave the dashboard.
  const signOut = async () => {
    await logout().catch(() => undefined);
    router.replace('/login');
  };

  if (emailSent) return <CheckEmail c={c} onClose={onClose} />;

  if (result) {
    return (
      <Modal isOpen onClose={signOut} title={c.doneTitle}>
        <ScheduledResult result={result} c={c} locale={locale} onClose={signOut} closeLabel={c.signOut} />
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title={c.accountTitle}>
      <div className="space-y-4 text-sm text-[var(--text-secondary)]">
        <AlertBox variant="error" icon={<AlertTriangle className="w-4 h-4" />}>
          {c.accountDesc}
        </AlertBox>
        <p>{c.later}</p>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--text-primary)]">{c.confirmAccount(email)}</span>
          <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        </label>
        <CredentialFields c={c} hasPassword={hasPassword} twoFactor={twoFactor} password={password} setPassword={setPassword} code={code} setCode={setCode} />
        {error && <AlertBox variant="error">{error}</AlertBox>}
      </div>
      <ModalActions>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          {c.cancel}
        </button>
        <button type="button" onClick={submit} disabled={!ready || pending} className="btn btn-danger">
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {c.deleting}
            </>
          ) : !hasPassword && !twoFactor ? (
            c.sendLink
          ) : (
            c.delete
          )}
        </button>
      </ModalActions>
    </Modal>
  );
}

export function DeletionTab() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const queryClient = useQueryClient();
  const { data: org } = useOrganization();
  const [open, setOpen] = useState<'org' | 'account' | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const isOwner = org?.role === 'owner';
  const scheduledFor = org?.deletionScheduledFor ?? null;

  const restore = async () => {
    setRestoreError(null);
    setRestoring(true);
    const r = await restoreOrganization();
    setRestoring(false);
    if (r.error) return setRestoreError(r.error.message);
    queryClient.invalidateQueries();
  };

  return (
    <>
      <SettingsSection
        danger
        padded
        title={c.orgTitle}
        description={scheduledFor ? c.scheduled(formatDate(scheduledFor, locale)) : c.orgDesc}
        action={
          isOwner ? (
            scheduledFor ? (
              <button type="button" onClick={restore} disabled={restoring} className="btn btn-primary btn-sm">
                {restoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {c.restore}
              </button>
            ) : (
              <button type="button" onClick={() => setOpen('org')} className="btn btn-danger btn-sm">
                {c.orgButton}
              </button>
            )
          ) : undefined
        }
      >
        {!isOwner && <p className="text-sm text-[var(--text-muted)]">{c.ownerOnly}</p>}
        {restoreError && <AlertBox variant="error">{restoreError}</AlertBox>}
      </SettingsSection>

      <SettingsSection
        danger
        title={c.accountTitle}
        description={c.accountDesc}
        action={
          <button type="button" onClick={() => setOpen('account')} className="btn btn-danger btn-sm">
            {c.accountButton}
          </button>
        }
      />

      {open === 'org' && <DeleteOrganizationModal c={c} locale={locale} onClose={() => setOpen(null)} />}
      {open === 'account' && <DeleteAccountModal c={c} locale={locale} onClose={() => setOpen(null)} />}
    </>
  );
}
