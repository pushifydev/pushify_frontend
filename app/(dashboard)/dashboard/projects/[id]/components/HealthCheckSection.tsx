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

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-[var(--bg-tertiary)] rounded" />
          <div className="h-4 w-64 bg-[var(--bg-tertiary)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold min-w-0">{t('healthChecks', 'title')}</h3>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggle}
            disabled={updateConfig.isPending || deleteConfig.isPending}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
              isEnabled || config?.isActive
                ? 'bg-[var(--accent-cyan)]'
                : 'bg-[var(--bg-tertiary)]'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isEnabled || config?.isActive ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        {t('healthChecks', 'description')}
      </p>

      {(isEnabled || config?.isActive) && (
        <div className="space-y-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Endpoint */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'endpoint')}
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => { setEndpoint(e.target.value); setHasChanges(true); }}
                placeholder={t('healthChecks', 'endpointPlaceholder')}
                className="input terminal-text text-sm"
              />
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'interval')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={intervalSeconds}
                  onChange={(e) => { setIntervalSeconds(Number(e.target.value)); setHasChanges(true); }}
                  min={10}
                  max={300}
                  className="input w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">{t('healthChecks', 'seconds')}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('healthChecks', 'intervalDesc')}</p>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'timeout')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={timeoutSeconds}
                  onChange={(e) => { setTimeoutSeconds(Number(e.target.value)); setHasChanges(true); }}
                  min={1}
                  max={60}
                  className="input w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">{t('healthChecks', 'seconds')}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('healthChecks', 'timeoutDesc')}</p>
            </div>

            {/* Unhealthy Threshold */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'unhealthyThreshold')}
              </label>
              <input
                type="number"
                value={unhealthyThreshold}
                onChange={(e) => { setUnhealthyThreshold(Number(e.target.value)); setHasChanges(true); }}
                min={1}
                max={10}
                className="input w-24 text-sm"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('healthChecks', 'unhealthyThresholdDesc')}</p>
            </div>
          </div>

          {/* Auto Restart Toggle */}
          <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium">{t('healthChecks', 'autoRestart')}</span>
              <p className="text-xs text-[var(--text-muted)]">{t('healthChecks', 'autoRestartDesc')}</p>
            </div>
            <button
              onClick={() => { setAutoRestart(!autoRestart); setHasChanges(true); }}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                autoRestart
                  ? 'bg-[var(--accent-cyan)]'
                  : 'bg-[var(--bg-secondary)]'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoRestart ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex justify-end">
              <button
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
            </div>
          )}

          {/* Recent Logs */}
          {logs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <h4 className="text-sm font-medium mb-3">{t('healthChecks', 'recentLogs')}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-2 rounded bg-[var(--bg-tertiary)] text-sm min-w-0"
                  >
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                      <span className={`badge ${getStatusBadge(log.status)}`}>
                        {t('healthChecks', log.status as 'healthy' | 'unhealthy' | 'unknown')}
                      </span>
                      {log.responseTimeMs && (
                        <span className="text-[var(--text-muted)]">
                          {log.responseTimeMs}ms
                        </span>
                      )}
                      {log.statusCode && (
                        <span className="text-[var(--text-muted)]">
                          HTTP {log.statusCode}
                        </span>
                      )}
                      {log.actionTaken && log.actionTaken !== 'none' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--status-warning)]/20 text-[var(--status-warning)]">
                          {t('healthChecks', log.actionTaken as 'restarted' | 'notified')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatTimeAgo(log.checkedAt, t)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
