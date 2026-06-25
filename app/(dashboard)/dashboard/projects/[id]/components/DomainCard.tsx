'use client';

import {
  Activity,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  RefreshCw,
  Server,
  Sliders,
  Trash2,
} from 'lucide-react';
import { useDnsSetup, useDomains, useTranslation } from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';

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
  const { data: dnsSetup, isLoading: isDnsLoading } = useDnsSetup(
    projectId,
    isExpanded && !domain.verifiedAt ? domain.id : null
  );

  const sslBadge = getSslStatusBadge(domain.sslStatus);
  const isVerified = !!domain.verifiedAt;

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden min-w-0">
      <div className="p-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Globe className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider shrink-0">Custom Domain</span>
              <span className="terminal-text font-medium break-all">{domain.domain}</span>
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
            {!isVerified && (
              <button
                onClick={onToggleExpand}
                className="text-xs text-[var(--accent-cyan)] hover:underline mt-1 flex items-center gap-1"
              >
                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                {isExpanded ? 'Hide DNS setup' : 'Show DNS setup instructions'}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 w-full lg:w-auto">
          {isVerified ? (
            <>
              <a
                href={`https://${domain.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary h-8 text-xs inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                Visit
              </a>
              <button
                onClick={onOpenSettings}
                className="btn btn-secondary h-8 text-xs"
                title="Nginx Settings"
              >
                <Sliders className="w-3 h-3" />
                Settings
              </button>
            </>
          ) : (
            <button
              onClick={() => onVerify(domain.id)}
              disabled={isVerifying}
              className="btn btn-primary h-8 text-xs"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Verifying...
                </>
              ) : (
                t('projectDetail', 'verify')
              )}
            </button>
          )}
          {isVerified && !domain.isPrimary && (
            <button onClick={() => onSetPrimary(domain.id)} className="btn btn-secondary h-8 text-xs">
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
            className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DNS Setup Instructions Panel */}
      {isExpanded && !isVerified && (
        <div className="border-t border-[var(--border-subtle)] p-4 bg-[var(--bg-tertiary)]">
          {isDnsLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
              <span className="ml-2 text-sm text-[var(--text-muted)]">Loading DNS information...</span>
            </div>
          ) : dnsSetup ? (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">DNS Configuration</h4>

              {dnsSetup.serverIp ? (
                <>
                  <div className="text-sm text-[var(--text-secondary)]">
                    <p className="mb-3">
                      Add an <span className="font-semibold text-[var(--text-primary)]">A record</span> in your DNS provider pointing to your server:
                    </p>

                    <div className="bg-[var(--bg-primary)] rounded-lg p-4 border border-[var(--border-subtle)]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-3">
                        <div>
                          <span className="text-[var(--text-muted)] block mb-1">Type</span>
                          <span className="terminal-text font-medium">A</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block mb-1">Name</span>
                          <span className="terminal-text font-medium">
                            {domain.domain.split('.')[0] === domain.domain ? '@' : domain.domain.split('.')[0]}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block mb-1">Value</span>
                          <div className="flex items-center gap-2">
                            <span className="terminal-text font-medium">{dnsSetup.serverIp}</span>
                            <button
                              onClick={() => onCopyIp(dnsSetup.serverIp!)}
                              className="text-[var(--accent-cyan)] hover:text-[var(--text-primary)]"
                            >
                              {copiedIp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    dnsSetup.isConfigured
                      ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                      : dnsSetup.currentIp
                      ? 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                      : 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                  }`}>
                    {dnsSetup.isConfigured ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>DNS is correctly configured! Click "Verify" to complete setup.</span>
                      </>
                    ) : dnsSetup.currentIp ? (
                      <>
                        <Activity className="w-4 h-4" />
                        <span>
                          DNS currently points to <span className="font-mono">{dnsSetup.currentIp}</span>.
                          Update it to point to <span className="font-mono">{dnsSetup.serverIp}</span>.
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>DNS record not found. Add the A record above, then wait for propagation (may take a few minutes).</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--status-warning)]/10 text-[var(--status-warning)] text-sm">
                  <Server className="w-4 h-4" />
                  <span>No server assigned to this project. Please assign a server in project settings first.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-[var(--text-muted)]">
              Unable to load DNS setup information.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
