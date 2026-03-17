'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Server, Loader2, Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { useTranslation, useCreateServer, useProviderRegions, useProviderSizes, useProviderImages } from '@/hooks';
import type { ServerSize, CreateServerInput } from '@/lib/api';

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateServerModal({ isOpen, onClose }: CreateServerModalProps) {
  const { t } = useTranslation();
  const createServer = useCreateServer();

  const [formData, setFormData] = useState<CreateServerInput>({
    name: '',
    provider: 'hetzner',
    region: '',
    size: 'sm',
    image: '',
  });

  const { data: regions = [], isLoading: regionsLoading } = useProviderRegions('hetzner');
  const { data: providerSizes = [], isLoading: sizesLoading } = useProviderSizes('hetzner');
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
      await createServer.mutateAsync(formData);
      onClose();
      setFormData({
        name: '',
        provider: 'hetzner',
        region: '',
        size: 'sm',
        image: '',
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetAndClose = () => {
    setFormData({
      name: '',
      provider: 'hetzner',
      region: '',
      size: 'sm',
      image: '',
    });
    onClose();
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const isValid = formData.name.trim() && formData.region && formData.size && formData.image;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl rounded-xl animate-in fade-in zoom-in-95 duration-200 min-h-[600px] max-h-[90vh] flex flex-col"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20">
              <Server className="w-6 h-6 text-[var(--accent-cyan)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('servers', 'createServer')}</h2>
              <p className="text-sm text-[var(--text-muted)]">Hetzner Cloud</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
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
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="input w-full h-12"
                  >
                    <option value="">{t('servers', 'selectRegion')}</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
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
                  <select
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input w-full h-12"
                  >
                    <option value="">{t('servers', 'selectImage')}</option>
                    {images.map((image) => (
                      <option key={image.id} value={image.id}>
                        {image.name}
                      </option>
                    ))}
                  </select>
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
                  Loading sizes...
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {providerSizes.map((sizeOption) => (
                    <button
                      key={sizeOption.size}
                      type="button"
                      onClick={() => setFormData({ ...formData, size: sizeOption.size })}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        formData.size === sizeOption.size
                          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 ring-1 ring-[var(--accent-cyan)]/30'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-tertiary)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold uppercase tracking-wide">{sizeOption.size}</span>
                        <span className={`text-sm font-semibold ${formData.size === sizeOption.size ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>
                          €{sizeOption.specs.priceMonthly}/mo
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{
              borderTop: '1px solid var(--glass-border-md)',
              background: 'var(--bg-secondary)',
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isValid ? 'Ready to create' : 'Fill all fields to continue'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="btn btn-secondary px-5"
              >
                {t('common', 'cancel')}
              </button>
              <button
                type="submit"
                disabled={!isValid || createServer.isPending}
                className="btn btn-primary px-5"
              >
                {createServer.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
