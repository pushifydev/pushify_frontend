'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Server, Loader2, Cpu, HardDrive, MemoryStick, Globe, Key } from 'lucide-react';
import { useTranslation, useCreateServer, useProviderRegions, useProviderSizes, useProviderImages } from '@/hooks';
import type { ServerSize, CreateServerInput } from '@/lib/api';
import { ManagedCloudProviderBar } from '@/components/servers/ManagedCloudProviderBar';
import { Select } from '@/components/ui/select';

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateServerModal({ isOpen, onClose }: CreateServerModalProps) {
  const { t } = useTranslation();
  const createServer = useCreateServer();

  const [mode, setMode] = useState<'managed' | 'byos'>('managed');
  const [formData, setFormData] = useState<CreateServerInput>({
    name: '',
    provider: 'hetzner',
    region: '',
    size: 'sm',
    image: '',
  });
  const [byosData, setByosData] = useState({ name: '', ipv4: '', sshPrivateKey: '' });

  const { data: regions = [], isLoading: regionsLoading } = useProviderRegions('hetzner');
  const { data: providerSizes = [], isLoading: sizesLoading } = useProviderSizes('hetzner', formData.region);

  // Sizes are priced and stocked per region: the effective choice is one the region offers.
  const effectiveSize = providerSizes.some((s) => s.size === formData.size)
    ? formData.size
    : (providerSizes.find((s) => s.allowedByPlan) ?? providerSizes[0])?.size ?? formData.size;
  const { data: images = [], isLoading: imagesLoading } = useProviderImages('hetzner');

  // Auto-select first region
  useEffect(() => {
    if (regions.length > 0 && !formData.region) {
      setFormData((prev) => ({ ...prev, region: regions[0].id }));
    }
  }, [regions, formData.region]);

  // Auto-select Ubuntu image
  useEffect(() => {
    if (images.length > 0 && !formData.image) {
      const ubuntu = images.find((img) => img.name.toLowerCase().includes('ubuntu'));
      setFormData((prev) => ({ ...prev, image: ubuntu?.id || images[0].id }));
    }
  }, [images, formData.image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'byos') {
        await createServer.mutateAsync({
          name: byosData.name,
          provider: 'self_hosted' as any,
          region: 'custom',
          size: 'custom' as any,
          image: 'custom',
          ipv4: byosData.ipv4,
          sshPrivateKey: byosData.sshPrivateKey || undefined,
        });
      } else {
        await createServer.mutateAsync({ ...formData, size: effectiveSize });
      }
      resetAndClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetAndClose = () => {
    setFormData({ name: '', provider: 'hetzner', region: '', size: 'sm', image: '' });
    setByosData({ name: '', ipv4: '', sshPrivateKey: '' });
    setMode('managed');
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const isValid = mode === 'byos'
    ? byosData.name.trim() && byosData.ipv4.trim()
    : formData.name.trim() && formData.region && effectiveSize && formData.image;

  return createPortal(
    // dash-app: the portal renders outside the dashboard layout.
    <div className="dash-app dash-modal-root">
      {/* Backdrop */}
      <div className="dash-modal-overlay" onClick={resetAndClose} aria-hidden />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-server-title"
        className="dash-modal is-flush max-w-2xl min-h-[600px]"
      >
        {/* Header */}
        <div className="dash-modal-bar shrink-0" style={{ padding: '1.25rem 1.5rem', alignItems: 'flex-start' }}>
          <div className="min-w-0">
            <span className="dash-eyebrow block mb-2">{t('navigation', 'servers')}</span>
            <h2 id="create-server-title" className="dash-modal-title">{t('servers', 'createServer')}</h2>
            <p className="dash-modal-description">
              {mode === 'managed' ? t('servers', 'hetzner') : t('servers', 'byosTitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="dash-modal-close"
            aria-label={t('common', 'close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Mode Tabs */}
          <div className="px-6 pt-5 pb-2">
          <div className="dash-segmented" role="group">
            <button
              type="button"
              onClick={() => setMode('managed')}
              aria-pressed={mode === 'managed'}
            >
              <Globe className="w-3.5 h-3.5" />
              {t('servers', 'cloudProvider')}
            </button>
            <button
              type="button"
              onClick={() => setMode('byos')}
              aria-pressed={mode === 'byos'}
            >
              <Key className="w-3.5 h-3.5" />
              {t('servers', 'existingServer')}
            </button>
          </div>
          </div>

          {mode === 'managed' && (
            <div className="px-6 pb-2">
              <ManagedCloudProviderBar />
            </div>
          )}

          {mode === 'byos' ? (
            /* BYOS Form */
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('servers', 'serverName')}</label>
                <input
                  type="text"
                  value={byosData.name}
                  onChange={(e) => setByosData({ ...byosData, name: e.target.value })}
                  placeholder={t('servers', 'serverNamePlaceholder')}
                  className="input w-full h-12"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('servers', 'ipAddressLabel')}</label>
                <input
                  type="text"
                  value={byosData.ipv4}
                  onChange={(e) => setByosData({ ...byosData, ipv4: e.target.value })}
                  placeholder={t('servers', 'ipAddressPlaceholder')}
                  className="input w-full h-12"
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('servers', 'ipAddressHint')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('servers', 'sshKey')}{' '}
                  <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                    ({t('common', 'optional')})
                  </span>
                </label>
                <textarea
                  value={byosData.sshPrivateKey}
                  onChange={(e) => setByosData({ ...byosData, sshPrivateKey: e.target.value })}
                  placeholder={t('servers', 'sshKeyPlaceholder')}
                  className="input w-full font-mono text-xs"
                  rows={6}
                  style={{ resize: 'none', fontFamily: 'var(--font-mono)' }}
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('servers', 'sshKeyOptionalNote')}
                </p>
              </div>

              <div
                className="p-4 rounded-lg text-sm"
                style={{ background: 'var(--hover-overlay-lg)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('servers', 'byosInfoTitle')}
                </p>
                <ul className="space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <li>• {t('servers', 'byosStep1')}</li>
                  <li>• {t('servers', 'byosStep2')}</li>
                  <li>• {t('servers', 'byosStep3')}</li>
                  <li>• {t('servers', 'byosStep4')}</li>
                </ul>
              </div>
            </div>
          ) : (
          <div className="p-6 space-y-8">
            {/* Server Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('servers', 'serverName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('servers', 'serverNamePlaceholder')}
                className="input w-full h-12"
                autoFocus
              />
            </div>

            {/* Region & Image - Side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Region */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('servers', 'region')}
                </label>
                {regionsLoading ? (
                  <div className="input w-full h-12 flex items-center justify-center text-[var(--text-muted)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <Select
                    value={formData.region}
                    onValueChange={(v) => setFormData({ ...formData, region: v })}
                    className="w-full"
                    aria-label={t('servers', 'region')}
                    options={[
                      { value: '', label: t('servers', 'selectRegion') },
                      ...regions.map((region) => ({ value: region.id, label: region.name, disabled: region.available === false })),
                    ]}
                  />
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('servers', 'image')}
                </label>
                {imagesLoading ? (
                  <div className="input w-full h-12 flex items-center justify-center text-[var(--text-muted)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <Select
                    value={formData.image}
                    onValueChange={(v) => setFormData({ ...formData, image: v })}
                    className="w-full"
                    aria-label={t('servers', 'image')}
                    options={[
                      { value: '', label: t('servers', 'selectImage') },
                      ...images.map((image) => ({ value: image.id, label: image.name })),
                    ]}
                  />
                )}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium mb-3">
                {t('servers', 'size')}
              </label>
              {sizesLoading ? (
                <div className="flex items-center justify-center h-48 text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('servers', 'loadingSizes')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providerSizes.map((sizeOption) => {
                    const disabled = !sizeOption.allowedByPlan;
                    const monthlyUsd = (sizeOption.specs.customerPriceMonthlyCents / 100).toFixed(2);
                    return (
                    <button
                      key={sizeOption.size}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setFormData({ ...formData, size: sizeOption.size })}
                      className={`p-5 rounded-xl border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        effectiveSize === sizeOption.size
                          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 ring-1 ring-[var(--accent-cyan)]/30'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-tertiary)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold uppercase tracking-wide">{sizeOption.size}</span>
                        <span className={`text-sm font-semibold ${effectiveSize === sizeOption.size ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>
                          ${monthlyUsd}/mo
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Cpu className="w-4 h-4" />
                          <span>{sizeOption.specs.vcpus} vCPU</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <MemoryStick className="w-4 h-4" />
                          <span>{sizeOption.specs.memoryMb >= 1024 ? `${(sizeOption.specs.memoryMb / 1024).toFixed(0)} GB` : `${sizeOption.specs.memoryMb} MB`} RAM</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <HardDrive className="w-4 h-4" />
                          <span>{sizeOption.specs.diskGb} GB SSD</span>
                        </div>
                      </div>
                    </button>
                  );})}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Actions - Fixed at bottom */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isValid ? t('servers', 'readyToCreate') : t('servers', 'fillRequiredFields')}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="btn btn-secondary"
              >
                {t('common', 'cancel')}
              </button>
              <button
                type="submit"
                disabled={!isValid || createServer.isPending}
                className="btn btn-primary"
              >
                {createServer.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('servers', 'creating')}
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5" />
                    {t('servers', 'createServer')}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
