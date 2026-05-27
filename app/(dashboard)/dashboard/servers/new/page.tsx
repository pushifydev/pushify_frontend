'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Server, Loader2, Cpu, HardDrive, MemoryStick,
  Globe, Key, Lock, Eye, EyeOff, Info, CheckCircle,
} from 'lucide-react';
import { useTranslation, useCreateServer, useProviderRegions, useProviderSizes, useProviderImages } from '@/hooks';
import type { CreateServerInput } from '@/lib/api';
import { toast } from 'sonner';

type Mode = 'managed' | 'byos';
type AuthMethod = 'ssh_key' | 'password';

export default function NewServerPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const createServer = useCreateServer();

  const [mode, setMode] = useState<Mode>('managed');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [showPassword, setShowPassword] = useState(false);

  // Managed form
  const [managedData, setManagedData] = useState({
    name: '',
    region: '',
    size: 'sm' as string,
    image: '',
  });

  // BYOS form
  const [byosData, setByosData] = useState({
    name: '',
    ipv4: '',
    sshPrivateKey: '',
    rootPassword: '',
  });

  const { data: regions = [], isLoading: regionsLoading } = useProviderRegions('hetzner');
  const { data: providerSizes = [], isLoading: sizesLoading } = useProviderSizes('hetzner');
  const { data: images = [], isLoading: imagesLoading } = useProviderImages('hetzner');

  useEffect(() => {
    if (regions.length > 0 && !managedData.region) {
      setManagedData((prev) => ({ ...prev, region: regions[0].id }));
    }
  }, [regions, managedData.region]);

  useEffect(() => {
    if (images.length > 0 && !managedData.image) {
      const ubuntu = images.find((img) => img.name.toLowerCase().includes('ubuntu'));
      setManagedData((prev) => ({ ...prev, image: ubuntu?.id || images[0].id }));
    }
  }, [images, managedData.image]);

  const isValid = mode === 'byos'
    ? byosData.name.trim() && byosData.ipv4.trim() && (authMethod === 'ssh_key' ? byosData.sshPrivateKey.trim() : byosData.rootPassword.trim())
    : managedData.name.trim() && managedData.region && managedData.size && managedData.image;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'byos') {
        await createServer.mutateAsync({
          name: byosData.name,
          provider: 'self_hosted',
          region: 'custom',
          size: 'custom',
          image: 'custom',
          ipv4: byosData.ipv4,
          authMethod,
          sshPrivateKey: authMethod === 'ssh_key' ? byosData.sshPrivateKey : undefined,
          rootPassword: authMethod === 'password' ? byosData.rootPassword : undefined,
        } as CreateServerInput);
      } else {
        await createServer.mutateAsync({
          name: managedData.name,
          provider: 'hetzner',
          region: managedData.region,
          size: managedData.size as any,
          image: managedData.image,
        });
      }
      toast.success(t('servers', 'created'));
      router.push('/dashboard/servers');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/servers"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('servers', 'title')}
        </Link>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {t('servers', 'createServer')}
        </h1>
      </div>

      {/* Mode Tabs */}
      <div
        className="inline-flex rounded-lg p-1 gap-1"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}
      >
        {[
          { key: 'managed' as Mode, icon: Globe, label: t('servers', 'cloudProvider') },
          { key: 'byos' as Mode, icon: Key, label: t('servers', 'existingServer') },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMode(tab.key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              background: mode === tab.key ? 'var(--bg-secondary)' : 'transparent',
              color: mode === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: mode === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'managed' ? (
          /* ─── Cloud Provider Form ─── */
          <>
            {/* Server Name */}
            <div
              className="rounded-xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
            >
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('servers', 'serverName')}
              </label>
              <input
                type="text"
                value={managedData.name}
                onChange={(e) => setManagedData({ ...managedData, name: e.target.value })}
                placeholder={t('servers', 'serverNamePlaceholder')}
                className="input w-full"
                autoFocus
              />
            </div>

            {/* Region & Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="rounded-xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('servers', 'region')}
                </label>
                {regionsLoading ? (
                  <div className="input w-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <select
                    value={managedData.region}
                    onChange={(e) => setManagedData({ ...managedData, region: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">{t('servers', 'selectRegion')}</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div
                className="rounded-xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('servers', 'image')}
                </label>
                {imagesLoading ? (
                  <div className="input w-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <select
                    value={managedData.image}
                    onChange={(e) => setManagedData({ ...managedData, image: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">{t('servers', 'selectImage')}</option>
                    {images.map((image) => (
                      <option key={image.id} value={image.id}>{image.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Size Grid */}
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                {t('servers', 'size')}
              </h3>
              {sizesLoading ? (
                <div
                  className="flex items-center justify-center h-48 rounded-xl"
                  style={{ border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
                >
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {providerSizes.map((sizeOption) => {
                    const isSelected = managedData.size === sizeOption.size;
                    return (
                      <button
                        key={sizeOption.size}
                        type="button"
                        onClick={() => setManagedData({ ...managedData, size: sizeOption.size })}
                        className="p-4 rounded-xl text-left transition-all duration-200"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--glass-border)'}`,
                          boxShadow: isSelected ? '0 0 0 3px var(--dash-accent-bg)' : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-sm font-bold uppercase tracking-wider"
                            style={{ color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                          >
                            {sizeOption.size}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                            €{sizeOption.specs.priceMonthly}/mo
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Cpu className="w-3 h-3" /> {sizeOption.specs.vcpus} vCPU
                          </div>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <MemoryStick className="w-3 h-3" /> {sizeOption.specs.memoryMb >= 1024 ? `${(sizeOption.specs.memoryMb / 1024).toFixed(0)} GB` : `${sizeOption.specs.memoryMb} MB`} RAM
                          </div>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <HardDrive className="w-3 h-3" /> {sizeOption.specs.diskGb} GB SSD
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ─── BYOS Form ─── */
          <>
            {/* Name + IP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="rounded-xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('servers', 'serverName')}
                </label>
                <input
                  type="text"
                  value={byosData.name}
                  onChange={(e) => setByosData({ ...byosData, name: e.target.value })}
                  placeholder={t('servers', 'serverNamePlaceholder')}
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div
                className="rounded-xl p-6"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('servers', 'ipAddressLabel')}
                </label>
                <input
                  type="text"
                  value={byosData.ipv4}
                  onChange={(e) => setByosData({ ...byosData, ipv4: e.target.value })}
                  placeholder={t('servers', 'ipAddressPlaceholder')}
                  className="input w-full"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('servers', 'ipAddressHint')}
                </p>
              </div>
            </div>

            {/* Auth Method */}
            <div
              className="rounded-xl p-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
            >
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                {t('servers', 'authMethod')}
              </label>

              {/* Auth selector */}
              <div className="flex gap-2 mb-4">
                {[
                  { key: 'password' as AuthMethod, icon: Lock, label: t('servers', 'rootPassword') },
                  { key: 'ssh_key' as AuthMethod, icon: Key, label: t('servers', 'sshKey') },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setAuthMethod(opt.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      authMethod === opt.key
                        ? 'dash-accent-fill'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--glass-border)]'
                    }`}
                  >
                    <opt.icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                ))}
              </div>

              {authMethod === 'password' ? (
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={byosData.rootPassword}
                      onChange={(e) => setByosData({ ...byosData, rootPassword: e.target.value })}
                      placeholder={t('servers', 'rootPasswordPlaceholder')}
                      className="input w-full pr-10!"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('servers', 'rootPasswordHint')}
                  </p>
                </div>
              ) : (
                <div>
                  <textarea
                    value={byosData.sshPrivateKey}
                    onChange={(e) => setByosData({ ...byosData, sshPrivateKey: e.target.value })}
                    placeholder={t('servers', 'sshKeyPlaceholder')}
                    className="input w-full text-xs"
                    rows={5}
                    style={{ resize: 'none', fontFamily: 'var(--font-mono)', lineHeight: '1.6' }}
                  />
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {t('servers', 'sshKeyHint')}
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div
              className="rounded-xl p-5 flex gap-4"
              style={{ background: 'var(--dash-accent-bg)', border: '1px solid var(--dash-accent-border)' }}
            >
              <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('servers', 'byosInfoTitle')}
                </p>
                <ul className="space-y-1.5">
                  {[
                    t('servers', 'byosStep1'),
                    t('servers', 'byosStep2'),
                    t('servers', 'byosStep3'),
                    t('servers', 'byosStep4'),
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Submit */}
        <div
          className="flex items-center justify-between rounded-xl p-5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isValid ? t('servers', 'readyToCreate') : t('servers', 'fillRequiredFields')}
          </p>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/servers" className="btn btn-secondary px-5">
              {t('common', 'cancel')}
            </Link>
            <button
              type="submit"
              disabled={!isValid || createServer.isPending}
              className="btn btn-primary px-6"
            >
              {createServer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('servers', 'creating')}
                </>
              ) : (
                <>
                  <Server className="w-4 h-4" />
                  {t('servers', 'createServer')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
