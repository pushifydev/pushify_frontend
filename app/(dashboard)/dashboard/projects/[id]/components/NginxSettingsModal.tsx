'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import {
  useNginxSettings,
  useUpdateNginxSettings,
  useTranslation,
} from '@/hooks';
import { ToggleOption } from './ToggleOption';

// Nginx Settings Modal Component
export function NginxSettingsModal({
  projectId,
  domainId,
  domainName,
  onClose,
  t,
}: {
  projectId: string;
  domainId: string;
  domainName: string;
  onClose: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: settings, isLoading } = useNginxSettings(projectId, domainId);
  const updateSettings = useUpdateNginxSettings(projectId, domainId);

  // Form state
  const [proxyPort, setProxyPort] = useState<number | ''>('');
  const [proxyTimeout, setProxyTimeout] = useState<number>(86400);
  const [clientMaxBodySize, setClientMaxBodySize] = useState('100m');
  const [enableWebsocket, setEnableWebsocket] = useState(true);
  const [enableGzip, setEnableGzip] = useState(true);
  const [forceHttps, setForceHttps] = useState(true);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);
  const [rateLimitRps, setRateLimitRps] = useState(10);
  const [rateLimitBurst, setRateLimitBurst] = useState(20);
  const [cachingEnabled, setCachingEnabled] = useState(false);
  const [cachingMaxAge, setCachingMaxAge] = useState(3600);
  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [customLocationBlocks, setCustomLocationBlocks] = useState('');

  // Load settings when data arrives
  useEffect(() => {
    if (settings) {
      setProxyPort(settings.proxyPort ?? '');
      setProxyTimeout(settings.proxyTimeout ?? 86400);
      setClientMaxBodySize(settings.clientMaxBodySize ?? '100m');
      setEnableWebsocket(settings.enableWebsocket ?? true);
      setEnableGzip(settings.enableGzip ?? true);
      setForceHttps(settings.forceHttps ?? true);
      setRateLimitEnabled(settings.rateLimit?.enabled ?? false);
      setRateLimitRps(settings.rateLimit?.requestsPerSecond ?? 10);
      setRateLimitBurst(settings.rateLimit?.burst ?? 20);
      setCachingEnabled(settings.caching?.enabled ?? false);
      setCachingMaxAge(settings.caching?.maxAge ?? 3600);
      setCustomLocationBlocks(settings.customLocationBlocks ?? '');
      if (settings.customHeaders) {
        setCustomHeaders(
          Object.entries(settings.customHeaders).map(([key, value]) => ({ key, value }))
        );
      }
    }
  }, [settings]);

  const handleSave = async () => {
    const headersObj: Record<string, string> = {};
    customHeaders.forEach(h => {
      if (h.key.trim()) {
        headersObj[h.key.trim()] = h.value;
      }
    });

    await updateSettings.mutateAsync({
      proxyPort: proxyPort ? Number(proxyPort) : undefined,
      proxyTimeout,
      clientMaxBodySize,
      enableWebsocket,
      enableGzip,
      forceHttps,
      rateLimit: rateLimitEnabled ? {
        enabled: true,
        requestsPerSecond: rateLimitRps,
        burst: rateLimitBurst,
      } : undefined,
      caching: cachingEnabled ? {
        enabled: true,
        maxAge: cachingMaxAge,
      } : undefined,
      customHeaders: Object.keys(headersObj).length > 0 ? headersObj : undefined,
      customLocationBlocks: customLocationBlocks.trim() || undefined,
    });
    onClose();
  };

  const addCustomHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const removeCustomHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const updateCustomHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customHeaders];
    updated[index][field] = value;
    setCustomHeaders(updated);
  };

  // Use portal to render modal at document body level
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div
        className="relative rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-lg font-semibold">Nginx Settings</h2>
            <p className="text-sm text-[var(--text-secondary)]">{domainName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : (
            <>
              {/* Port Configuration */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Port Configuration</h3>
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Proxy Port
                      </label>
                      <input
                        type="number"
                        value={proxyPort}
                        onChange={(e) => setProxyPort(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="Use project default"
                        min={1}
                        max={65535}
                        className="input terminal-text w-48"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Leave empty to use the project&apos;s default port. Override if this domain should route to a different port.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Basic Settings */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Basic Settings</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Proxy Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={proxyTimeout}
                      onChange={(e) => setProxyTimeout(parseInt(e.target.value) || 60)}
                      min={1}
                      max={86400}
                      className="input terminal-text w-full"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">Max: 86400 (24 hours)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Max Body Size
                    </label>
                    <input
                      type="text"
                      value={clientMaxBodySize}
                      onChange={(e) => setClientMaxBodySize(e.target.value)}
                      placeholder="100m"
                      className="input terminal-text w-full"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">e.g., 100m, 1g</p>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  <ToggleOption
                    label="Enable WebSocket Support"
                    description="Allow WebSocket connections through the proxy"
                    enabled={enableWebsocket}
                    onChange={setEnableWebsocket}
                  />
                  <ToggleOption
                    label="Enable Gzip Compression"
                    description="Compress responses to reduce bandwidth"
                    enabled={enableGzip}
                    onChange={setEnableGzip}
                  />
                  <ToggleOption
                    label="Force HTTPS"
                    description="Redirect all HTTP requests to HTTPS"
                    enabled={forceHttps}
                    onChange={setForceHttps}
                  />
                </div>
              </section>

              {/* Rate Limiting */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Rate Limiting</h3>

                <ToggleOption
                  label="Enable Rate Limiting"
                  description="Limit requests per IP address"
                  enabled={rateLimitEnabled}
                  onChange={setRateLimitEnabled}
                />

                {rateLimitEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-[var(--border-subtle)]">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Requests per Second
                      </label>
                      <input
                        type="number"
                        value={rateLimitRps}
                        onChange={(e) => setRateLimitRps(parseInt(e.target.value) || 1)}
                        min={1}
                        max={1000}
                        className="input terminal-text w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Burst Size
                      </label>
                      <input
                        type="number"
                        value={rateLimitBurst}
                        onChange={(e) => setRateLimitBurst(parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                        className="input terminal-text w-full"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Caching */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Caching</h3>

                <ToggleOption
                  label="Enable Proxy Caching"
                  description="Cache responses from your application"
                  enabled={cachingEnabled}
                  onChange={setCachingEnabled}
                />

                {cachingEnabled && (
                  <div className="pl-4 border-l-2 border-[var(--border-subtle)]">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Cache Max Age (seconds)
                    </label>
                    <input
                      type="number"
                      value={cachingMaxAge}
                      onChange={(e) => setCachingMaxAge(parseInt(e.target.value) || 60)}
                      min={1}
                      max={31536000}
                      className="input terminal-text w-48"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">How long to cache successful responses</p>
                  </div>
                )}
              </section>

              {/* Custom Headers */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Custom Headers</h3>
                  <button
                    onClick={addCustomHeader}
                    className="btn btn-secondary h-7 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add Header
                  </button>
                </div>

                {customHeaders.length > 0 ? (
                  <div className="space-y-2">
                    {customHeaders.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => updateCustomHeader(index, 'key', e.target.value)}
                          placeholder="Header Name"
                          className="input terminal-text flex-1"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateCustomHeader(index, 'value', e.target.value)}
                          placeholder="Header Value"
                          className="input terminal-text flex-1"
                        />
                        <button
                          onClick={() => removeCustomHeader(index)}
                          className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No custom headers configured</p>
                )}
              </section>

              {/* Custom Location Blocks */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Custom Location Blocks</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Advanced: Add custom Nginx location blocks. Use with caution.
                </p>
                <textarea
                  value={customLocationBlocks}
                  onChange={(e) => setCustomLocationBlocks(e.target.value)}
                  placeholder={`location /api/special {\n    proxy_pass http://special-service;\n}`}
                  rows={5}
                  className="input terminal-text w-full font-mono text-sm"
                />
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mb-3 pt-2 px-4 border-t border-[var(--border-subtle)]">
          <button onClick={onClose} className="btn btn-ghost">
            {t('common', 'cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending || isLoading}
            className="btn btn-primary"
          >
            {updateSettings.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
