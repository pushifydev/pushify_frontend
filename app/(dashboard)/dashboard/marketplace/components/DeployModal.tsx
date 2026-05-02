'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Server, ChevronRight, ChevronLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useTranslation } from '@/hooks';
import { useServers } from '@/hooks/useServers';
import { useDeployMarketplaceApp } from '@/hooks/useMarketplace';
import type { MarketplaceTemplate } from '@/lib/api';
import { toast } from 'sonner';

interface DeployModalProps {
  isOpen: boolean;
  template: MarketplaceTemplate;
  onClose: () => void;
}

export default function DeployModal({ isOpen, template, onClose }: DeployModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: servers, isLoading: serversLoading } = useServers();
  const deployMutation = useDeployMarketplaceApp();

  const [step, setStep] = useState(1);
  const [appName, setAppName] = useState(template.id);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const readyServers = servers?.filter((s: any) => s.status === 'running' && s.setupStatus === 'completed') ?? [];
  const totalSteps = 3;

  useEffect(() => {
    const defaults: Record<string, string> = {};
    template.envVars.forEach((v) => {
      if (v.default) defaults[v.key] = v.default;
    });
    setEnvVars(defaults);
  }, [template]);

  const canProceed = () => {
    if (step === 1) return appName.trim().length > 0 && selectedServerId;
    if (step === 2) {
      return template.envVars
        .filter((v) => v.required && !v.generate)
        .every((v) => envVars[v.key]?.trim());
    }
    return true;
  };

  const handleDeploy = async () => {
    try {
      const result = await deployMutation.mutateAsync({
        templateId: template.id,
        serverId: selectedServerId,
        name: appName,
        envVars,
      });
      toast.success(t('marketplace', 'deploySuccess'));
      onClose();
      if (result?.project?.id) {
        router.push(`/dashboard/projects/${result.project.id}`);
      }
    } catch {
      // Error handled by mutation onError
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('marketplace', 'deployTitle')}
      description={`${t('marketplace', 'step')} ${step} ${t('marketplace', 'of')} ${totalSteps}`}
      maxWidth="lg"
    >

        {/* Step indicator */}
        <div className="flex gap-1 px-6 pt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i < step ? 'var(--accent-cyan)' : 'var(--hover-overlay-lg)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5 min-h-[280px]">
          {/* Step 1: Name + Server */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('marketplace', 'appName')}
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder={t('marketplace', 'appNamePlaceholder')}
                  className="input"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('marketplace', 'selectServer')}
                </label>

                {serversLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                  </div>
                ) : readyServers.length === 0 ? (
                  <div
                    className="flex items-center gap-2 p-3 rounded-lg text-sm"
                    style={{
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#f59e0b',
                    }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {t('marketplace', 'noServers')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {readyServers.map((server: any) => (
                      <button
                        key={server.id}
                        onClick={() => setSelectedServerId(server.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                        style={{
                          background: selectedServerId === server.id
                            ? 'rgba(99,102,241,0.08)'
                            : 'var(--hover-overlay)',
                          border: `1px solid ${
                            selectedServerId === server.id
                              ? 'rgba(99,102,241,0.3)'
                              : 'var(--glass-border)'
                          }`,
                        }}
                      >
                        <Server className="w-4 h-4" style={{
                          color: selectedServerId === server.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {server.name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {server.ipAddress} &middot; {server.region}
                          </p>
                        </div>
                        {selectedServerId === server.id && (
                          <Check className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Environment Variables */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('marketplace', 'configureEnvVars')}
              </p>
              {template.envVars.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  No configuration needed.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {template.envVars.map((envVar) => (
                    <div key={envVar.key}>
                      <div className="flex items-center gap-2 mb-1">
                        <label
                          className="text-xs font-medium"
                          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                        >
                          {envVar.key}
                        </label>
                        {envVar.required && !envVar.generate && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: '#f87171',
                          }}>
                            {t('marketplace', 'required')}
                          </span>
                        )}
                        {envVar.generate && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                            background: 'rgba(99,102,241,0.1)',
                            color: 'var(--accent-cyan)',
                          }}>
                            {t('marketplace', 'envVarAutoGenerated')}
                          </span>
                        )}
                      </div>
                      <input
                        type={envVar.type === 'password' ? 'password' : 'text'}
                        value={envVars[envVar.key] || ''}
                        onChange={(e) => setEnvVars({ ...envVars, [envVar.key]: e.target.value })}
                        placeholder={envVar.description}
                        className="input text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {t('marketplace', 'reviewDeploy')}
              </p>
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: 'var(--hover-overlay)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Application</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{template.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>{t('marketplace', 'appName')}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{appName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>{t('marketplace', 'selectServer')}</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {readyServers.find((s: any) => s.id === selectedServerId)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>{t('marketplace', 'dockerImage')}</span>
                  <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {template.dockerImage}
                  </span>
                </div>
                {template.requiresDatabase && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{t('marketplace', 'requiresDatabase')}</span>
                    <span style={{ color: '#f59e0b' }}>{template.requiresDatabase.type}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--glass-divider)' }}
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--hover-overlay)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {step > 1 ? t('marketplace', 'previous') : t('common', 'cancel')}
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40"
              style={{
                background: 'var(--accent-cyan)',
                color: '#020206',
              }}
            >
              {t('marketplace', 'next')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={deployMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-60"
              style={{
                background: 'var(--accent-cyan)',
                color: '#020206',
              }}
            >
              {deployMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('marketplace', 'deploying')}
                </>
              ) : (
                t('marketplace', 'confirmDeploy')
              )}
            </button>
          )}
        </div>
    </Modal>
  );
}
