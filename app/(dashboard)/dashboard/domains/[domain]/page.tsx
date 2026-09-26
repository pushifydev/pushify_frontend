'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Check, Clock, Copy, KeyRound, Loader2, Lock, LockOpen, Plus, Trash2 } from 'lucide-react';
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
import { EmptyState } from '@/components/EmptyState';
import { MetaLabel, PageHeader, TabPanel, Tabs } from '@/components/dashboard/PageKit';
import { SettingsSection, SettingsSwitch } from '@/components/dashboard/SettingsParts';
import { Select } from '@/components/ui/select';

const DNS_TYPES: DnsRecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS'];
type Tab = 'dns' | 'forwarding' | 'settings';

const inputCls = 'input h-9! py-0! text-sm!';

export default function DomainDetailPage() {
  const params = useParams<{ domain: string }>();
  const domainName = decodeURIComponent(params.domain);
  const { t, locale } = useTranslation();

  const { data: details, isLoading } = useDomainDetails(domainName);
  const active = details?.domain.status === 'active';
  const [tab, setTab] = useState<Tab>('dns');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dns', label: t('domainSales', 'tabDns') },
    { id: 'forwarding', label: t('domainSales', 'tabForwarding') },
    { id: 'settings', label: t('domainSales', 'tabSettings') },
  ];

  const status = details?.domain.status;
  const badge = details ? (
    <span
      className={`badge shrink-0 ${
        status === 'active' ? 'badge-success' : status === 'transfer_pending' ? 'badge-warning' : 'badge-error'
      }`}
    >
      {status === 'active'
        ? (locale === 'tr' ? 'Aktif' : 'Active')
        : status === 'transfer_pending'
          ? t('domainSales', 'transferPendingChip')
          : status === 'transfer_failed'
            ? t('domainSales', 'transferFailedChip')
            : t('domainSales', 'expired')}
    </span>
  ) : undefined;

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <PageHeader
        back={{ href: '/dashboard/domains', label: t('domainSales', 'title') }}
        title={<span className="terminal-text">{domainName}</span>}
        crumb={domainName}
        badge={badge}
        meta={
          details && status === 'active'
            ? [
                <span key="exp" className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {t('domainSales', 'expires')} {new Date(details.domain.expiresAt).toLocaleDateString()}
                </span>,
                details.nameservers?.[0] ? <MetaLabel key="ns">{details.nameservers[0]}</MetaLabel> : null,
              ]
            : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-4" role="status" aria-label={t('common', 'loading')}>
          <div className="h-10 border-b border-[var(--border-subtle)]" />
          <div className="dash-skeleton h-48 rounded-[14px]" />
        </div>
      ) : !active ? (
        <div className="dash-callout text-sm text-[var(--text-secondary)]" role="note">
          {t('domainSales', 'transferNote')}
        </div>
      ) : (
        <>
          <Tabs items={tabs} active={tab} onChange={setTab} label={domainName} idPrefix="domain-tab" />
          <TabPanel idPrefix="domain-tab" active={tab}>
            {tab === 'dns' && <DnsTab domainName={domainName} />}
            {tab === 'forwarding' && <ForwardingTab domainName={domainName} />}
            {tab === 'settings' && (
              <SettingsTab domainName={domainName} locked={details?.locked ?? null} nameservers={details?.nameservers ?? []} />
            )}
          </TabPanel>
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
    <section className="dash-rows" aria-label={t('domainSales', 'tabDns')}>
      <form onSubmit={addRecord} className="dash-toolbar items-end! gap-2! px-4! py-3!">
        <label className="flex flex-col gap-1.5">
          <span className="dash-section-label">{t('domainSales', 'dnsHost')}</span>
          <input value={host} onChange={(e) => setHost(e.target.value)} className={`${inputCls} w-28 terminal-text`} />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="dash-section-label">{t('domainSales', 'dnsType')}</span>
          <Select
            value={type}
            onValueChange={(v) => setType(v as DnsRecordType)}
            className="w-24 h-9"
            mono
            aria-label={t('domainSales', 'dnsType')}
            options={DNS_TYPES.map((dt) => ({ value: dt, label: dt }))}
          />
        </div>
        <label className="flex flex-col gap-1.5 flex-1 min-w-40">
          <span className="dash-section-label">{t('domainSales', 'dnsValue')}</span>
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} required className={`${inputCls} w-full terminal-text`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="dash-section-label">{t('domainSales', 'dnsTtl')}</span>
          <input value={ttl} onChange={(e) => setTtl(e.target.value)} className={`${inputCls} w-20 terminal-text`} />
        </label>
        {needsPriority && (
          <label className="flex flex-col gap-1.5">
            <span className="dash-section-label">{t('domainSales', 'dnsPriority')}</span>
            <input value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputCls} w-20 terminal-text`} />
          </label>
        )}
        <button type="submit" disabled={create.isPending || !answer} className="btn btn-primary btn-sm h-9!">
          {create.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          {t('domainSales', 'dnsAdd')}
        </button>
      </form>

      {isLoading ? (
        <div className="dash-row flex justify-center py-8!" role="status" aria-label={t('common', 'loading')}>
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" aria-hidden />
        </div>
      ) : records.length === 0 ? (
        <EmptyState variant="bare" title={t('domainSales', 'dnsEmpty')} />
      ) : (
        records.map((r) => (
          <div key={r.id} className="dash-row flex items-center gap-3 min-w-0">
            <span className="badge badge-neutral terminal-text shrink-0 w-14 justify-center">{r.type}</span>
            <span className="terminal-text text-sm text-[var(--text-primary)] w-28 sm:w-40 truncate shrink-0">
              {r.host || '@'}
            </span>
            <span className="terminal-text text-[13px] text-[var(--text-secondary)] flex-1 min-w-0 truncate" title={r.answer}>
              {r.priority !== undefined && <span className="text-[var(--text-muted)]">{r.priority} </span>}
              {r.answer}
            </span>
            <span className="terminal-text text-xs text-[var(--text-muted)] shrink-0 hidden sm:inline">
              {t('domainSales', 'dnsTtl')} {r.ttl ?? 300}
            </span>
            <button
              type="button"
              onClick={() => remove.mutate(r.id)}
              disabled={remove.isPending}
              className="dash-icon-action hover:text-[var(--status-error)]!"
              aria-label={`${t('common', 'delete')} ${r.type} ${r.host || '@'}`}
              title={t('common', 'delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))
      )}
    </section>
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
    <div className="space-y-3 min-w-0">
      <p className="text-[13px] text-[var(--text-secondary)]">{t('domainSales', 'fwdDesc')}</p>
      <section className="dash-rows" aria-label={t('domainSales', 'tabForwarding')}>
        <form onSubmit={submit} className="dash-toolbar gap-2! px-4! py-3!">
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              value={emailBox}
              onChange={(e) => setEmailBox(e.target.value)}
              placeholder={t('domainSales', 'fwdAliasPh')}
              aria-label={t('domainSales', 'fwdAliasPh')}
              required
              className={`${inputCls} w-44 terminal-text`}
            />
            <span className="terminal-text text-[13px] text-[var(--text-muted)] truncate">@{domainName}</span>
          </div>
          <span className="text-[var(--text-muted)]" aria-hidden>→</span>
          <input
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder={t('domainSales', 'fwdDestPh')}
            aria-label={t('domainSales', 'fwdDestPh')}
            type="email"
            required
            className={`${inputCls} w-60 max-w-full terminal-text`}
          />
          <button type="submit" disabled={add.isPending} className="btn btn-primary btn-sm h-9!">
            {add.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {t('domainSales', 'fwdAdd')}
          </button>
        </form>

        {isLoading ? (
          <div className="dash-row flex justify-center py-8!" role="status" aria-label={t('common', 'loading')}>
            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" aria-hidden />
          </div>
        ) : forwardings.length === 0 ? (
          <EmptyState variant="bare" title={t('domainSales', 'fwdEmpty')} />
        ) : (
          forwardings.map((f) => (
            <div key={f.emailBox} className="dash-row flex items-center gap-3 min-w-0 terminal-text text-[13px]">
              <span className="text-[var(--text-primary)] truncate">{f.emailBox}@{domainName}</span>
              <span className="text-[var(--text-muted)] shrink-0" aria-hidden>→</span>
              <span className="text-[var(--text-secondary)] truncate flex-1 min-w-0">{f.emailTo}</span>
              <button
                type="button"
                onClick={() => remove.mutate(f.emailBox)}
                disabled={remove.isPending}
                className="dash-icon-action hover:text-[var(--status-error)]!"
                aria-label={`${t('common', 'delete')} ${f.emailBox}@${domainName}`}
                title={t('common', 'delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </section>
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
    <div className="dash-settings-stack max-w-4xl">
      <SettingsSection
        id="domain-lock"
        title={t('domainSales', 'lockTitle')}
        description={t('domainSales', 'lockDesc')}
        action={
          <>
            {locked !== null && (
              <span className={`badge ${locked ? 'badge-success' : 'badge-warning'}`}>
                {locked ? <Lock className="w-3 h-3" aria-hidden /> : <LockOpen className="w-3 h-3" aria-hidden />}
              </span>
            )}
            <SettingsSwitch
              checked={locked ?? false}
              disabled={lock.isPending || locked === null}
              onChange={(next) => lock.mutate(next)}
              label={t('domainSales', 'lockTitle')}
            />
          </>
        }
      />

      <SettingsSection
        id="domain-ns"
        title={t('domainSales', 'nsTitle')}
        description={t('domainSales', 'nsDesc')}
        padded
        footer={
          <button type="button" onClick={saveNs} disabled={nsMutation.isPending} className="btn btn-primary btn-sm ml-auto">
            {nsMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {t('domainSales', 'nsSave')}
          </button>
        }
      >
        <textarea
          value={nsText}
          onChange={(e) => setNsText(e.target.value)}
          rows={3}
          aria-label={t('domainSales', 'nsTitle')}
          className="input terminal-text max-w-xl"
          placeholder={'ns1.example.com\nns2.example.com'}
        />
      </SettingsSection>

      <SettingsSection
        id="domain-auth"
        title={t('domainSales', 'authTitle')}
        description={t('domainSales', 'authDesc')}
        padded
      >
        {revealedCode ? (
          <div className="flex items-center gap-2 min-w-0">
            <code className="terminal-text text-sm px-3 py-2 rounded-[10px] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] truncate">
              {revealedCode}
            </code>
            <button
              type="button"
              onClick={copyCode}
              className="btn btn-secondary btn-sm"
              aria-label={t('domainSales', 'copied')}
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[var(--status-success)]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? t('domainSales', 'copied') : ''}
            </button>
          </div>
        ) : (
          <button type="button" onClick={reveal} disabled={authCode.isPending} className="btn btn-secondary btn-sm">
            {authCode.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
            {t('domainSales', 'authShow')}
          </button>
        )}
        <p className="text-xs text-[var(--status-warning)] mt-3">{t('domainSales', 'authWarn')}</p>
      </SettingsSection>
    </div>
  );
}
