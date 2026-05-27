'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Server,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  AlertCircle,
  Globe,
  CreditCard,
  ListChecks,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useTranslation } from '@/hooks';
import { useServers } from '@/hooks/useServers';
import { useLaunchSite } from '@/hooks/useSiteStudio';
import type { SiteStudioTemplate } from '@/lib/api';
import { toast } from 'sonner';

interface LaunchWizardProps {
  isOpen: boolean;
  template: SiteStudioTemplate;
  onClose: () => void;
}

export default function LaunchWizard({ isOpen, template, onClose }: LaunchWizardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: servers, isLoading: serversLoading } = useServers();
  const launchMutation = useLaunchSite();

  const [step, setStep] = useState(1);
  const [siteName, setSiteName] = useState(
    template.id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
  const [domain, setDomain] = useState('');
  const [selectedServerId, setSelectedServerId] = useState('');
  const [launchFieldValues, setLaunchFieldValues] = useState<Record<string, string>>({});

  const readyServers =
    servers?.filter((s: { status: string; setupStatus: string }) =>
      s.status === 'running' && s.setupStatus === 'completed'
    ) ?? [];

  const totalSteps = 4;

  const launchFieldsValid = () =>
    (template.launchFields ?? []).every(
      (f) => !f.required || launchFieldValues[f.envKey]?.trim()
    );

  const canProceed = () => {
    if (step === 1) return siteName.trim().length >= 2 && launchFieldsValid();
    if (step === 2) return !!selectedServerId;
    return true;
  };

  const handleLaunch = async () => {
    try {
      const result = await launchMutation.mutateAsync({
        siteTemplateId: template.id,
        serverId: selectedServerId,
        name: siteName.trim(),
        domain: domain.trim() || undefined,
        envVars: Object.keys(launchFieldValues).length > 0 ? launchFieldValues : undefined,
      });
      toast.success(t('siteStudio', 'launchSuccessDetail'));
      onClose();
      if (result?.project?.id) {
        router.push(`/dashboard/projects/${result.project.id}?studio=1`);
      }
    } catch {
      // handled by mutation
    }
  };

  const fieldLabel = 'block text-sm font-medium mb-2';
  const fieldLabelStyle = { color: 'var(--ss-ink)' };
  const wizardInput =
    'w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-[border-color,box-shadow]';
  const wizardInputStyle = {
    fontFamily: 'var(--ss-font)',
    color: 'var(--ss-ink)',
    background: 'var(--ss-surface)',
    border: '1px solid var(--ss-line)',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('siteStudio', 'launchTitle')}
      description={`${t('siteStudio', 'step')} ${step} ${t('siteStudio', 'of')} ${totalSteps} — ${template.name}`}
      maxWidth="lg"
    >
      <div className="site-studio">
        <div className="flex gap-1.5 px-6 pt-5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="ss-wizard-progress"
              data-done={i < step}
            />
          ))}
        </div>

        <div className="px-6 py-6 min-h-[280px]">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className={fieldLabel} style={fieldLabelStyle}>
                  {t('siteStudio', 'siteName')}
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder={t('siteStudio', 'siteNamePlaceholder')}
                  className={wizardInput}
                  style={wizardInputStyle}
                />
              </div>
              <div>
                <label className={fieldLabel} style={fieldLabelStyle}>
                  {t('siteStudio', 'customDomain')}
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--ss-muted)' }}>
                    ({t('siteStudio', 'optional')})
                  </span>
                </label>
                <div className="relative">
                  <Globe
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--ss-muted)' }}
                    strokeWidth={1.75}
                  />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder={t('siteStudio', 'domainPlaceholder')}
                    className={`${wizardInput} pl-9`}
                    style={wizardInputStyle}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--ss-muted)' }}>
                  {t('siteStudio', 'domainHint')}
                </p>
              </div>

              {(template.launchFields ?? []).map((field) => (
                <div key={field.envKey}>
                  <label className={fieldLabel} style={fieldLabelStyle}>
                    {field.label}
                    {field.required && <span className="ml-1 opacity-50">*</span>}
                  </label>
                  <input
                    type={field.type === 'email' ? 'email' : 'text'}
                    value={launchFieldValues[field.envKey] ?? ''}
                    onChange={(e) =>
                      setLaunchFieldValues((prev) => ({
                        ...prev,
                        [field.envKey]: e.target.value,
                      }))
                    }
                    className={wizardInput}
                    style={wizardInputStyle}
                    required={field.required}
                  />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--ss-muted)' }}>
                    {field.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <label className={fieldLabel} style={fieldLabelStyle}>
                {t('siteStudio', 'selectServer')}
              </label>
              {serversLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--ss-muted)' }} />
                </div>
              ) : readyServers.length === 0 ? (
                <div
                  className="flex items-center gap-2 p-4 rounded-lg text-sm mt-2"
                  style={{
                    border: '1px solid var(--ss-line)',
                    color: 'var(--ss-body)',
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  {t('siteStudio', 'noServers')}
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto mt-2">
                  {readyServers.map((server: { id: string; name: string; ipAddress?: string }) => {
                    const selected = selectedServerId === server.id;
                    return (
                      <button
                        key={server.id}
                        type="button"
                        onClick={() => setSelectedServerId(server.id)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-lg text-left transition-colors"
                        style={{
                          fontFamily: 'var(--ss-font)',
                          background: selected ? 'var(--ss-btn)' : 'transparent',
                          color: selected ? 'var(--ss-btn-fg)' : 'var(--ss-ink)',
                          border: `1px solid ${selected ? 'var(--ss-btn)' : 'var(--ss-line)'}`,
                        }}
                      >
                        <Server className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{server.name}</p>
                          {server.ipAddress && (
                            <p
                              className="text-xs mt-0.5 truncate opacity-70"
                              style={{ fontFamily: 'var(--ss-mono)' }}
                            >
                              {server.ipAddress}
                            </p>
                          )}
                        </div>
                        {selected && <Check className="w-4 h-4 shrink-0" strokeWidth={2} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {template.paymentIntegrations && template.paymentIntegrations.length > 0 && (
                <div className="ss-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" style={{ color: 'var(--ss-muted)' }} strokeWidth={1.75} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--ss-ink)' }}>
                      {t('siteStudio', 'paymentIntegrations')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.paymentIntegrations.map((p) => (
                      <span key={p.id} className="ss-tag">
                        {p.name}
                        <span className="opacity-60 ml-1">
                          {p.region === 'tr' ? '· TR' : '· Global'}
                        </span>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs mt-3" style={{ color: 'var(--ss-muted)' }}>
                    {t('siteStudio', 'paymentNote')}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-4 h-4" style={{ color: 'var(--ss-muted)' }} strokeWidth={1.75} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--ss-ink)' }}>
                    {t('siteStudio', 'afterLaunch')}
                  </span>
                </div>
                <ol className="space-y-3">
                  {template.setupGuide.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-semibold"
                        style={{
                          background: 'var(--ss-btn)',
                          color: 'var(--ss-btn-fg)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--ss-ink)' }}>
                          {s.title}
                        </p>
                        <p className="mt-0.5" style={{ color: 'var(--ss-muted)' }}>
                          {s.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="ss-card p-5 space-y-3">
              <h4 className="text-sm font-semibold" style={{ color: 'var(--ss-ink)' }}>
                {t('siteStudio', 'reviewTitle')}
              </h4>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt style={{ color: 'var(--ss-muted)' }}>{t('siteStudio', 'template')}</dt>
                  <dd className="font-medium" style={{ color: 'var(--ss-ink)' }}>
                    {template.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt style={{ color: 'var(--ss-muted)' }}>{t('siteStudio', 'siteName')}</dt>
                  <dd className="font-medium" style={{ color: 'var(--ss-ink)' }}>
                    {siteName}
                  </dd>
                </div>
                {domain && (
                  <div className="flex justify-between gap-4">
                    <dt style={{ color: 'var(--ss-muted)' }}>{t('siteStudio', 'customDomain')}</dt>
                    <dd className="font-mono text-xs" style={{ color: 'var(--ss-ink)' }}>
                      {domain}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt style={{ color: 'var(--ss-muted)' }}>{t('siteStudio', 'estimatedTime')}</dt>
                  <dd style={{ color: 'var(--ss-ink)' }}>~{template.estimatedMinutes} min</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--ss-line)' }}
        >
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="ss-btn-ghost"
            disabled={launchMutation.isPending}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            {step === 1 ? t('common', 'cancel') : t('siteStudio', 'previous')}
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="ss-btn-primary"
            >
              {t('siteStudio', 'next')}
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              disabled={launchMutation.isPending || !canProceed()}
              className="ss-btn-primary"
            >
              {launchMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('siteStudio', 'launching')}
                </>
              ) : (
                t('siteStudio', 'launchNow')
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
