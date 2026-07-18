'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Copy,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  Mail,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  useDomainDetails,
  useDomainDns,
  useDnsMutations,
  useDomainForwarding,
  useForwardingMutations,
  useDomainSettingsMutations,
  useTranslation,
} from '@/hooks';
import type { DnsRecordType } from '@/lib/api';
import { toast } from 'sonner';

const DNS_TYPES: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS'];
type Tab = 'dns' | 'forwarding' | 'settings';

const inputCls =
  'h-9 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--accent-cyan)]';

export default function DomainDetailPage() {
  const params = useParams<{ domain: string }>();
  const domainName = decodeURIComponent(params.domain);
  const { t } = useTranslation();

  const { data: details, isLoading } = useDomainDetails(domainName);
  const active = details?.domain.status === 'active';
  const [tab, setTab] = useState<Tab>('dns');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dns', label: t('domainSales', 'tabDns'), icon: <Globe className="w-3.5 h-3.5" /> },
    {
      id: 'forwarding',
      label: t('domainSales', 'tabForwarding'),
      icon: <Mail className="w-3.5 h-3.5" />,
    },
    {
      id: 'settings',
      label: t('domainSales', 'tabSettings'),
      icon: <KeyRound className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/domains"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('domainSales', 'backToDomains')}
        </Link>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
          {domainName}
        </h1>
        {details && (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {details.domain.status === 'active'
              ? `${t('domainSales', 'expires')}: ${new Date(details.domain.expiresAt).toLocaleDateString()}`
              : details.domain.status === 'transfer_pending'
                ? t('domainSales', 'transferPendingChip')
                : details.domain.status === 'transfer_failed'
                  ? t('domainSales', 'transferFailedChip')
                  : t('domainSales', 'expired')}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : !active ? (
        <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)]">
          {t('domainSales', 'transferNote')}
        </div>
      ) : (
        <>
          <div className="flex gap-1 border-b border-[var(--border-subtle)]">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex items-center gap-1.5 px-4 h-10 text-sm font-medium -mb-px border-b-2 transition-colors"
                style={
                  tab === item.id
                    ? { borderColor: 'var(--accent-cyan)', color: 'var(--text-primary)' }
                    : { borderColor: 'transparent', color: 'var(--text-muted)' }
                }
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'dns' && <DnsTab domainName={domainName} />}
          {tab === 'forwarding' && <ForwardingTab domainName={domainName} />}
          {tab === 'settings' && (
            <SettingsTab domainName={domainName} locked={details?.locked ?? null} nameservers={details?.nameservers ?? []} />
          )}
        </>
      )}
    </div>
  );
}

function DnsTab({ domainName }: { domainName: string }) {
  const { t } = useTranslation();
  const { data: records = [], isLoading } = useDomainDns(domainName);
  const { create, remove } = useDnsMutations(domainName);

  const [host, setHost] = useState('@');
  const [type, setType] = useState<DnsRecordType>('A');
  const [answer, setAnswer] = useState('');
  const [ttl, setTtl] = useState('300');
  const [priority, setPriority] = useState('10');
  const needsPriority = type === 'MX' || type === 'SRV';

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      host,
      type,
      answer,
      ttl: parseInt(ttl, 10) || 300,
      priority: needsPriority ? parseInt(priority, 10) || 10 : undefined,
    });
    setAnswer('');
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={addRecord}
        className="flex flex-wrap items-end gap-2 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
      >
        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
          {t('domainSales', 'dnsHost')}
          <input value={host} onChange={(e) => setHost(e.target.value)} className={`${inputCls} w-28`} style={{ fontFamily: 'var(--font-mono)' }} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
          {t('domainSales', 'dnsType')}
          <select value={type} onChange={(e) => setType(e.target.value as DnsRecordType)} className={`${inputCls} w-24`}>
            {DNS_TYPES.map((dt) => (
              <option key={dt} value={dt}>{dt}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)] flex-1 min-w-40">
          {t('domainSales', 'dnsValue')}
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} required className={`${inputCls} w-full`} style={{ fontFamily: 'var(--font-mono)' }} />
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
          {t('domainSales', 'dnsTtl')}
          <input value={ttl} onChange={(e) => setTtl(e.target.value)} className={`${inputCls} w-20`} />
        </label>
        {needsPriority && (
          <label className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
            {t('domainSales', 'dnsPriority')}
            <input value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputCls} w-20`} />
          </label>
        )}
        <button type="submit" disabled={create.isPending || !answer} className="btn btn-primary h-9 text-xs disabled:opacity-50">
          {create.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {t('domainSales', 'dnsAdd')}
        </button>
      </form>

      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
      ) : records.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('domainSales', 'dnsEmpty')}</p>
      ) : (
        <div className="rounded-lg border border-[var(--border-subtle)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                <th className="px-3 py-2 font-medium">{t('domainSales', 'dnsHost')}</th>
                <th className="px-3 py-2 font-medium">{t('domainSales', 'dnsType')}</th>
                <th className="px-3 py-2 font-medium">{t('domainSales', 'dnsValue')}</th>
                <th className="px-3 py-2 font-medium">{t('domainSales', 'dnsTtl')}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border-subtle)]">
                  <td className="px-3 py-2" style={{ fontFamily: 'var(--font-mono)' }}>{r.host || '@'}</td>
                  <td className="px-3 py-2 text-xs">{r.type}{r.priority !== undefined ? ` (${r.priority})` : ''}</td>
                  <td className="px-3 py-2 max-w-70 truncate" style={{ fontFamily: 'var(--font-mono)' }} title={r.answer}>{r.answer}</td>
                  <td className="px-3 py-2 text-xs text-[var(--text-muted)]">{r.ttl ?? 300}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => remove.mutate(r.id)}
                      disabled={remove.isPending}
                      className="btn btn-ghost h-7 w-7 p-0 text-[var(--text-muted)] hover:text-red-400"
                      aria-label="delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ForwardingTab({ domainName }: { domainName: string }) {
  const { t } = useTranslation();
  const { data: forwardings = [], isLoading } = useDomainForwarding(domainName);
  const { add, remove } = useForwardingMutations(domainName);
  const [emailBox, setEmailBox] = useState('');
  const [emailTo, setEmailTo] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await add.mutateAsync({ emailBox, emailTo });
    setEmailBox('');
    setEmailTo('');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">{t('domainSales', 'fwdDesc')}</p>
      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <input value={emailBox} onChange={(e) => setEmailBox(e.target.value)} placeholder={t('domainSales', 'fwdAliasPh')} required className={`${inputCls} w-36`} style={{ fontFamily: 'var(--font-mono)' }} />
          <span className="text-sm text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>@{domainName}</span>
        </div>
        <span className="text-[var(--text-muted)]">→</span>
        <input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder={t('domainSales', 'fwdDestPh')} type="email" required className={`${inputCls} w-60`} style={{ fontFamily: 'var(--font-mono)' }} />
        <button type="submit" disabled={add.isPending} className="btn btn-primary h-9 text-xs disabled:opacity-50">
          {add.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {t('domainSales', 'fwdAdd')}
        </button>
      </form>

      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
      ) : forwardings.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('domainSales', 'fwdEmpty')}</p>
      ) : (
        <div className="space-y-2">
          {forwardings.map((f) => (
            <div key={f.emailBox} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              <span>{f.emailBox}@{domainName}</span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="truncate">{f.emailTo}</span>
              <button
                onClick={() => remove.mutate(f.emailBox)}
                disabled={remove.isPending}
                className="ml-auto btn btn-ghost h-7 w-7 p-0 text-[var(--text-muted)] hover:text-red-400"
                aria-label="delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({
  domainName,
  locked,
  nameservers,
}: {
  domainName: string;
  locked: boolean | null;
  nameservers: string[];
}) {
  const { t } = useTranslation();
  const { lock, nameservers: nsMutation, authCode } = useDomainSettingsMutations(domainName);
  const [nsText, setNsText] = useState(nameservers.join('\n'));
  const [revealedCode, setRevealedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const saveNs = async () => {
    const list = nsText.split('\n').map((s) => s.trim()).filter(Boolean);
    await nsMutation.mutateAsync(list);
    toast.success(t('domainSales', 'nsTitle'));
  };

  const reveal = async () => {
    const result = await authCode.mutateAsync();
    setRevealedCode(result.authCode);
  };

  const copyCode = async () => {
    if (!revealedCode) return;
    await navigator.clipboard.writeText(revealedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Transfer lock */}
      <div className="p-5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-4">
        {locked ? <Lock className="w-4 h-4 mt-0.5 text-emerald-500" /> : <LockOpen className="w-4 h-4 mt-0.5 text-amber-500" />}
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{t('domainSales', 'lockTitle')}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('domainSales', 'lockDesc')}</p>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={locked ?? false}
            disabled={lock.isPending || locked === null}
            onChange={(e) => lock.mutate(e.target.checked)}
            className="accent-[var(--accent-cyan)]"
          />
        </label>
      </div>

      {/* Nameservers */}
      <div className="p-5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold">{t('domainSales', 'nsTitle')}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">{t('domainSales', 'nsDesc')}</p>
        <textarea
          value={nsText}
          onChange={(e) => setNsText(e.target.value)}
          rows={3}
          className="w-full p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--accent-cyan)]"
          style={{ fontFamily: 'var(--font-mono)' }}
          placeholder={'ns1.example.com\nns2.example.com'}
        />
        <div className="flex justify-end mt-2">
          <button onClick={saveNs} disabled={nsMutation.isPending} className="btn btn-primary h-9 text-xs disabled:opacity-50">
            {nsMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {t('domainSales', 'nsSave')}
          </button>
        </div>
      </div>

      {/* Transfer out */}
      <div className="p-5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold">{t('domainSales', 'authTitle')}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">{t('domainSales', 'authDesc')}</p>
        {revealedCode ? (
          <div className="flex items-center gap-2">
            <code className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              {revealedCode}
            </code>
            <button onClick={copyCode} className="btn btn-ghost h-9 text-xs">
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? t('domainSales', 'copied') : ''}
            </button>
          </div>
        ) : (
          <button onClick={reveal} disabled={authCode.isPending} className="btn btn-ghost h-9 text-xs disabled:opacity-50" style={{ border: '1px solid var(--border-subtle)' }}>
            {authCode.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
            {t('domainSales', 'authShow')}
          </button>
        )}
        <p className="text-[11px] text-amber-500 mt-2">{t('domainSales', 'authWarn')}</p>
      </div>
    </div>
  );
}
