'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  useHealthCheckConfig,
  useHealthCheckLogs,
  useUpdateHealthCheckConfig,
  useDeleteHealthCheckConfig,
} from '@/hooks/useHealthCheck';
import { formatTimeAgo } from '@/lib/formatters';
import { SettingsField, SettingsSection, SettingsSwitch } from './SettingsParts';

export function HealthCheckSection({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: config, isLoading } = useHealthCheckConfig(projectId);
  const { data: logs = [] } = useHealthCheckLogs(projectId);
  const updateConfig = useUpdateHealthCheckConfig(projectId);
  const deleteConfig = useDeleteHealthCheckConfig(projectId);

  const [isEnabled, setIsEnabled] = useState(false);
  const [endpoint, setEndpoint] = useState('/health');
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [timeoutSeconds, setTimeoutSeconds] = useState(10);
  const [unhealthyThreshold, setUnhealthyThreshold] = useState(3);
  const [autoRestart, setAutoRestart] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form with config data
  if (config && !initialized) {
    setIsEnabled(config.isActive);
    setEndpoint(config.endpoint);
    setIntervalSeconds(config.intervalSeconds);
    setTimeoutSeconds(config.timeoutSeconds);
    setUnhealthyThreshold(config.unhealthyThreshold);
    setAutoRestart(config.autoRestart);
    setInitialized(true);
  }

  const handleSave = async () => {
    await updateConfig.mutateAsync({
      endpoint,
      intervalSeconds,
      timeoutSeconds,
      unhealthyThreshold,
      autoRestart,
      isActive: isEnabled,
    });
    setHasChanges(false);
  };

  const handleDisable = async () => {
    await deleteConfig.mutateAsync();
    setIsEnabled(false);
    setHasChanges(false);
    setInitialized(false);
  };

  const handleToggle = () => {
    if (config && isEnabled) {
      handleDisable();
    } else {
      setIsEnabled(true);
      setHasChanges(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'badge-success';
      case 'unhealthy':
      case 'timeout':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  };

  const active = isEnabled || !!config?.isActive;

  if (isLoading) {
    return (
      <SettingsSection id="settings-health" title={t('healthChecks', 'title')} padded>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-64 bg-[var(--bg-tertiary)] rounded" />
          <div className="h-4 w-40 bg-[var(--bg-tertiary)] rounded" />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      id="settings-health"
      title={t('healthChecks', 'title')}
      description={t('healthChecks', 'description')}
      action={
        <SettingsSwitch
          checked={active}
          onChange={() => handleToggle()}
          disabled={updateConfig.isPending || deleteConfig.isPending}
          label={t('healthChecks', 'title')}
        />
      }
      footer={
        active && hasChanges ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={updateConfig.isPending}
            className="btn btn-primary"
          >
            {updateConfig.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              t('common', 'save')
            )}
          </button>
        ) : undefined
      }
    >
      {active && (
        <>
          <SettingsField label={t('healthChecks', 'endpoint')} htmlFor="health-endpoint">
            <input
              id="health-endpoint"
              type="text"
              value={endpoint}
              onChange={(e) => { setEndpoint(e.target.value); setHasChanges(true); }}
              placeholder={t('healthChecks', 'endpointPlaceholder')}
              className="input terminal-text"
            />
          </SettingsField>
          <SettingsField label={t('healthChecks', 'interval')} hint={t('healthChecks', 'intervalDesc')} htmlFor="health-interval">
            <div className="flex items-center gap-2">
              <input
                id="health-interval"
                type="number"
                value={intervalSeconds}
                onChange={(e) => { setIntervalSeconds(Math.max(0, Number(e.target.value) || 0)); setHasChanges(true); }}
                min={10}
                max={300}
                className="input w-28 terminal-text"
              />
              <span className="text-[13px] text-[var(--text-muted)]">{t('healthChecks', 'seconds')}</span>
            </div>
          </SettingsField>
          <SettingsField label={t('healthChecks', 'timeout')} hint={t('healthChecks', 'timeoutDesc')} htmlFor="health-timeout">
            <div className="flex items-center gap-2">
              <input
                id="health-timeout"
                type="number"
                value={timeoutSeconds}
                onChange={(e) => { setTimeoutSeconds(Math.max(0, Number(e.target.value) || 0)); setHasChanges(true); }}
                min={1}
                max={60}
                className="input w-28 terminal-text"
              />
              <span className="text-[13px] text-[var(--text-muted)]">{t('healthChecks', 'seconds')}</span>
            </div>
          </SettingsField>
          <SettingsField
            label={t('healthChecks', 'unhealthyThreshold')}
            hint={t('healthChecks', 'unhealthyThresholdDesc')}
            htmlFor="health-threshold"
          >
            <input
              id="health-threshold"
              type="number"
              value={unhealthyThreshold}
              onChange={(e) => { setUnhealthyThreshold(Math.max(0, Number(e.target.value) || 0)); setHasChanges(true); }}
              min={1}
              max={10}
              className="input w-28 terminal-text"
            />
          </SettingsField>
          <SettingsField label={t('healthChecks', 'autoRestart')} hint={t('healthChecks', 'autoRestartDesc')}>
            <div className="md:pt-2">
              <SettingsSwitch
                checked={autoRestart}
                onChange={(next) => { setAutoRestart(next); setHasChanges(true); }}
                label={t('healthChecks', 'autoRestart')}
              />
            </div>
          </SettingsField>

          {/* Recent Logs */}
          {logs.length > 0 && (
            <div className="dash-field">
              <span className="dash-field-label">{t('healthChecks', 'recentLogs')}</span>
              <div className="dash-field-control !max-w-none rounded-[10px] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] max-h-56 overflow-y-auto">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between px-3 py-2 text-[13px] min-w-0"
                  >
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                      <span className={`badge ${getStatusBadge(log.status)}`}>
                        {t('healthChecks', log.status as 'healthy' | 'unhealthy' | 'unknown')}
                      </span>
                      {log.responseTimeMs && (
                        <span className="terminal-text text-xs text-[var(--text-muted)]">
                          {log.responseTimeMs}ms
                        </span>
                      )}
                      {log.statusCode && (
                        <span className="terminal-text text-xs text-[var(--text-muted)]">
                          HTTP {log.statusCode}
                        </span>
                      )}
                      {log.actionTaken && log.actionTaken !== 'none' && (
                        <span className="badge badge-warning">
                          {t('healthChecks', log.actionTaken as 'restarted' | 'notified')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] shrink-0">
                      {formatTimeAgo(log.checkedAt, t)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </SettingsSection>
  );
}
