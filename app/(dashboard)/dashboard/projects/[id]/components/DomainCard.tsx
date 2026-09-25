'use client';

import {
  Activity,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  Sliders,
  Trash2,
} from 'lucide-react';
import { useDnsSetup, useDomains, useTranslation } from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import { dnsRecordName, wwwTwin } from '@/lib/dns-record';

export function DomainCard({
  projectId,
  domain,
  isExpanded,
  onToggleExpand,
  onVerify,
  onSetPrimary,
  onDelete,
  onOpenSettings,
  isVerifying,
  copiedIp,
  onCopyIp,
  getSslStatusBadge,
  t,
}: {
  projectId: string;
  domain: NonNullable<ReturnType<typeof useDomains>['data']>[number];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  isVerifying: boolean;
  copiedIp: boolean;
  onCopyIp: (text: string) => void;
  getSslStatusBadge: (sslStatus: string | null) => { class: string; text: string };
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const confirm = useConfirm();
  const { data: dnsSetup, isLoading: isDnsLoading } = useDnsSetup(projectId, isExpanded ? domain.id : null);

  const sslBadge = getSslStatusBadge(domain.sslStatus);
  const isVerified = !!domain.verifiedAt;
  // example.com ↔ www.example.com: served as a redirect once its DNS points here too
  const twin = wwwTwin(domain.domain);

  return (
    <div className="dash-row !p-0 min-w-0">
      <div className="px-4 py-3.5 sm:px-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span
            className={`dash-status-dot mt-[7px] ${isVerified ? (domain.sslStatus === 'failed' ? 'is-error' : domain.sslStatus === 'active' ? 'is-success' : 'is-warning') : 'is-warning'}`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <span className="terminal-text text-[13px] text-[var(--text-primary)] break-all">{domain.domain}</span>
              {domain.isPrimary && <span className="badge badge-info">{t('projectDetail', 'primary')}</span>}
              <span className={`badge ${isVerified ? 'badge-success' : 'badge-warning'}`}>
                {isVerified ? t('projectDetail', 'verified') : t('projectDetail', 'pending')}
              </span>
              {isVerified && (
                <span className={`badge ${sslBadge.class}`}>
                  {sslBadge.text}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={isExpanded}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-1.5 flex items-center gap-1 transition-colors"
            >
              <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              {isExpanded ? t('projectDetail', 'dnsHide') : t('projectDetail', 'dnsShow')}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 w-full lg:w-auto">
          {isVerified ? (
            <>
              <a
                href={`https://${domain.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                {t('projectDetail', 'visit')}
              </a>
              <button
                onClick={onOpenSettings}
                className="btn btn-ghost btn-sm"
                title="Nginx"
              >
                <Sliders className="w-3 h-3" />
                {t('projectDetail', 'settings')}
              </button>
              {/* Re-runs Nginx + SSL: picks up a www record added later, retries a failed certificate */}
              <button
                onClick={() => onVerify(domain.id)}
                disabled={isVerifying}
                className={`btn btn-sm ${domain.sslStatus === 'active' ? 'btn-ghost' : 'btn-secondary'}`}
                title={t('projectDetail', 'domainRecheckHint')}
              >
                <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
                {t('projectDetail', 'domainRecheck')}
              </button>
            </>
          ) : (
            <button
              onClick={() => onVerify(domain.id)}
              disabled={isVerifying}
              className="btn btn-primary btn-sm"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {t('projectDetail', 'verify')}…
                </>
              ) : (
                t('projectDetail', 'verify')
              )}
            </button>
          )}
          {isVerified && !domain.isPrimary && (
            <button onClick={() => onSetPrimary(domain.id)} className="btn btn-secondary btn-sm">
              {t('projectDetail', 'setPrimary')}
            </button>
          )}
          <button
            onClick={async () => {
              const ok = await confirm({
                variant: 'danger',
                title: `${t('common', 'delete')} ${domain.domain}`,
                description: t('projectDetail', 'removeDomainConfirm'),
                confirmText: t('common', 'delete'),
                cancelText: t('common', 'cancel'),
              });
              if (ok) onDelete(domain.id);
            }}
            aria-label={`${t('common', 'delete')} ${domain.domain}`}
            title={t('common', 'delete')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DNS Setup Instructions Panel */}
      {isExpanded && (
        <div className="border-t border-[var(--border-subtle)] px-4 py-4 sm:px-5 bg-[var(--bg-primary)]">
          {isDnsLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
              <span className="ml-2 text-sm text-[var(--text-muted)]">{t('projectDetail', 'dnsLoading')}</span>
            </div>
          ) : dnsSetup ? (
            <div className="space-y-4">
              <h4 className="dash-section-label">{t('projectDetail', 'dnsConfiguration')}</h4>

              {dnsSetup.serverIp ? (
                <>
                  <div className="text-sm text-[var(--text-secondary)]">
                    <p className="mb-3">{t('projectDetail', 'dnsAddRecord')}</p>

                    <div className="bg-[var(--bg-secondary)] rounded-[10px] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                      {[
                        { host: domain.domain, twin: false },
                        ...(twin ? [{ host: twin, twin: true }] : []),
                      ].map((record) => (
                        <div key={record.host} className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="dash-section-label block mb-1">{t('projectDetail', 'dnsType')}</span>
                              <span className="terminal-text font-medium">A</span>
                            </div>
                            <div>
                              <span className="dash-section-label block mb-1">{t('projectDetail', 'dnsName')}</span>
                              <span className="terminal-text font-medium">{dnsRecordName(record.host)}</span>
                            </div>
                            <div>
                              <span className="dash-section-label block mb-1">{t('projectDetail', 'dnsValue')}</span>
                              <div className="flex items-center gap-2">
                                <span className="terminal-text font-medium">{dnsSetup.serverIp}</span>
                                <button
                                  type="button"
                                  onClick={() => onCopyIp(dnsSetup.serverIp!)}
                                  aria-label={t('projectDetail', 'copyUrl')}
                                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                >
                                  {copiedIp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          {record.twin && (
                            <p className="text-xs text-[var(--text-muted)] mt-3">
                              {t('projectDetail', 'dnsTwinHint')
                                .replace('{twin}', record.host)
                                .replace('{domain}', domain.domain)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13px] ${
                    dnsSetup.isConfigured
                      ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                      : dnsSetup.currentIp
                      ? 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                      : 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                  }`}>
                    {dnsSetup.isConfigured ? (
                      <>
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{t('projectDetail', 'dnsReady')}</span>
                      </>
                    ) : dnsSetup.currentIp ? (
                      <>
                        <Activity className="w-4 h-4 shrink-0" />
                        <span>
                          {t('projectDetail', 'dnsPointsElsewhere')
                            .replace('{current}', dnsSetup.currentIp)
                            .replace('{server}', dnsSetup.serverIp)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>{t('projectDetail', 'dnsNotFound')}</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-[var(--status-warning)]/10 text-[var(--status-warning)] text-[13px]">
                  <Server className="w-4 h-4 shrink-0" />
                  <span>{t('projectDetail', 'dnsNoServer')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-[var(--text-muted)]">{t('projectDetail', 'dnsUnavailable')}</div>
          )}
        </div>
      )}
    </div>
  );
}
