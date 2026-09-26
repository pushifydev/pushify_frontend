'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Server, Loader2, Eye, EyeOff } from 'lucide-react';
import { PageHeader, Tabs, TabPanel } from '@/components/dashboard/PageKit';
import { SettingsSection, SettingsField } from '@/components/dashboard/SettingsParts';
import { useTranslation, useCreateServer, useProviderRegions, useProviderSizes, useProviderImages, useInfraBilling, useBillingInfo } from '@/hooks';
import type { CreateServerInput } from '@/lib/api';
import { toast } from 'sonner';
import { ManagedCloudProviderBar } from '@/components/servers/ManagedCloudProviderBar';
import { getSizeDisallowLabel } from '@/lib/servers/size-disallow';
import { Select } from '@/components/ui/select';

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
  const { data: providerSizes = [], isLoading: sizesLoading } = useProviderSizes('hetzner', managedData.region);
  const { data: infraBilling } = useInfraBilling();
  const { data: billingInfo } = useBillingInfo();
  const { data: images = [], isLoading: imagesLoading } = useProviderImages('hetzner');

  // Plan server quota (the backend enforces this and returns 403 when exceeded).
  const serverUsage = billingInfo?.usage.servers;
  const atServerLimit = !!serverUsage && !serverUsage.unlimited && serverUsage.used >= serverUsage.limit;

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

  // Sizes are priced and stocked per region. If the chosen size isn't offered in the current
  // region, the effective choice is the cheapest one the plan allows — never a size that can't exist.
  const effectiveSize = providerSizes.some((s) => s.size === managedData.size)
    ? managedData.size
    : (providerSizes.find((s) => s.allowedByPlan) ?? providerSizes[0])?.size ?? managedData.size;
  const selectedSize = providerSizes.find((s) => s.size === effectiveSize);
  const walletBalance = infraBilling?.wallet.balanceCents ?? 0;
  const requiredCents = selectedSize?.specs.customerPriceMonthlyCents ?? 0;
  const hasEnoughCredits = walletBalance >= requiredCents || requiredCents === 0;

  const isValid = mode === 'byos'
    ? byosData.name.trim() && byosData.ipv4.trim() && (authMethod === 'ssh_key' ? byosData.sshPrivateKey.trim() : byosData.rootPassword.trim())
    : managedData.name.trim() &&
      managedData.region &&
      effectiveSize &&
      managedData.image &&
      (selectedSize?.allowedByPlan ?? false) &&
      hasEnoughCredits;

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
          size: effectiveSize as any,
          image: managedData.image,
        });
      }
      toast.success(t('servers', 'created'));
      router.push('/dashboard/servers');
    } catch {
      // Error handled by mutation
    }
  };

  const limitText = serverUsage
    ? (atServerLimit ? t('servers', 'serverLimitReached') : t('servers', 'planServersUsage'))
        .replace('{used}', String(serverUsage.used))
        .replace('{limit}', String(serverUsage.limit))
        .replace('{plan}', billingInfo?.planName ?? '')
    : '';
  const formatMb = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`);

  return (
    <div className="dash-page max-w-5xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <PageHeader
        back={{ href: '/dashboard/servers', label: t('servers', 'title') }}
        title={t('servers', 'createServer')}
        meta={
          serverUsage && !serverUsage.unlimited
            ? [
                <span key="quota" className="inline-flex items-center gap-1.5">
                  <span className={`dash-status-dot ${atServerLimit ? 'is-warning' : ''}`} aria-hidden />
                  {limitText}
                </span>,
              ]
            : undefined
        }
      />

      <Tabs
        label={t('servers', 'createServer')}
        idPrefix="new-server"
        active={mode}
        onChange={setMode}
        items={[
          { id: 'managed', label: t('servers', 'cloudProvider') },
          { id: 'byos', label: t('servers', 'existingServer') },
        ]}
      />

      <TabPanel idPrefix="new-server" active={mode}>
      <div className="space-y-5">
      {atServerLimit && (
        <div className="dash-callout dash-callout-attention items-center justify-between gap-3 text-sm" role="status">
          <span className="text-[var(--text-primary)]">{limitText}</span>
          <Link href="/dashboard/billing/plans" className="btn btn-secondary btn-sm shrink-0">
            {t('billing', 'comparePlans')}
          </Link>
        </div>
      )}

      {mode === 'managed' && infraBilling && walletBalance < requiredCents && requiredCents > 0 && (
        <div className="dash-callout dash-callout-attention items-center justify-between gap-3 text-sm" role="status">
          <span className="text-[var(--text-primary)]">{t('servers', 'infraWalletBanner')}</span>
          <Link href="/dashboard/billing" className="btn btn-secondary btn-sm shrink-0">
            {t('billing', 'infraTopUp')}
          </Link>
        </div>
      )}

      {mode === 'managed' && <ManagedCloudProviderBar />}

      <form onSubmit={handleSubmit} className="dash-settings-stack">
        {mode === 'managed' ? (
          <>
            <SettingsSection id="ns-server" title={t('servers', 'serverName')}>
              <SettingsField label={t('servers', 'serverName')} htmlFor="ns-name">
                <input
                  id="ns-name"
                  type="text"
                  value={managedData.name}
                  onChange={(e) => setManagedData({ ...managedData, name: e.target.value })}
                  placeholder={t('servers', 'serverNamePlaceholder')}
                  className="input w-full"
                  autoFocus
                />
              </SettingsField>
              <SettingsField label={t('servers', 'region')} htmlFor="ns-region">
                {regionsLoading ? (
                  <div className="input w-full flex items-center text-[var(--text-muted)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <Select
                    id="ns-region"
                    value={managedData.region}
                    onValueChange={(v) => setManagedData({ ...managedData, region: v })}
                    className="w-full"
                    options={[
                      { value: '', label: t('servers', 'selectRegion') },
                      ...regions.map((region) => ({ value: region.id, label: region.name, disabled: region.available === false })),
                    ]}
                  />
                )}
              </SettingsField>
              <SettingsField label={t('servers', 'image')} htmlFor="ns-image">
                {imagesLoading ? (
                  <div className="input w-full flex items-center text-[var(--text-muted)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <Select
                    id="ns-image"
                    value={managedData.image}
                    onValueChange={(v) => setManagedData({ ...managedData, image: v })}
                    className="w-full"
                    options={[
                      { value: '', label: t('servers', 'selectImage') },
                      ...images.map((image) => ({ value: image.id, label: image.name })),
                    ]}
                  />
                )}
              </SettingsField>
            </SettingsSection>

            <section className="min-w-0" aria-labelledby="ns-size-title">
              <h2 id="ns-size-title" className="dash-section-label mb-2.5">{t('servers', 'size')}</h2>
              {sizesLoading ? (
                <div className="dash-rows">
                  <div className="dash-row flex items-center justify-center h-40 text-[var(--text-muted)]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              ) : (
                <div className="dash-rows" role="radiogroup" aria-labelledby="ns-size-title">
                  {providerSizes.map((sizeOption) => {
                    const isSelected = effectiveSize === sizeOption.size;
                    const disabled = !sizeOption.allowedByPlan;
                    const monthlyUsd = (sizeOption.specs.customerPriceMonthlyCents / 100).toFixed(2);
                    return (
                      <button
                        key={sizeOption.size}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={disabled}
                        onClick={() => !disabled && setManagedData({ ...managedData, size: sizeOption.size })}
                        className={`dash-row w-full flex items-center gap-3 text-left transition-colors disabled:cursor-not-allowed ${
                          isSelected ? 'bg-[var(--hover-overlay-lg)]' : 'hover:bg-[var(--hover-overlay)]'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-[var(--text-primary)]' : 'border-[var(--border-default)]'
                          }`}
                          aria-hidden
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />}
                        </span>
                        <span className={`flex-1 min-w-0 ${disabled ? 'opacity-50' : ''}`}>
                          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span className="terminal-text text-sm font-medium uppercase text-[var(--text-primary)] w-10">
                              {sizeOption.size}
                            </span>
                            <span className="terminal-text text-xs text-[var(--text-muted)] tabular-nums">
                              {sizeOption.specs.vcpus} vCPU · {formatMb(sizeOption.specs.memoryMb)} RAM · {sizeOption.specs.diskGb} GB SSD
                            </span>
                          </span>
                          {disabled && (
                            <span className="block text-xs mt-1 text-[var(--status-warning)]">
                              {getSizeDisallowLabel(t, sizeOption)}
                            </span>
                          )}
                        </span>
                        <span className={`terminal-text text-xs tabular-nums shrink-0 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          ${monthlyUsd}{t('billing', 'infraPerMonth')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <SettingsSection id="ns-byos" title={t('servers', 'existingServer')}>
              <SettingsField label={t('servers', 'serverName')} htmlFor="ns-byos-name">
                <input
                  id="ns-byos-name"
                  type="text"
                  value={byosData.name}
                  onChange={(e) => setByosData({ ...byosData, name: e.target.value })}
                  placeholder={t('servers', 'serverNamePlaceholder')}
                  className="input w-full"
                  autoFocus
                />
              </SettingsField>
              <SettingsField
                label={t('servers', 'ipAddressLabel')}
                hint={t('servers', 'ipAddressHint')}
                htmlFor="ns-byos-ip"
              >
                <input
                  id="ns-byos-ip"
                  type="text"
                  value={byosData.ipv4}
                  onChange={(e) => setByosData({ ...byosData, ipv4: e.target.value })}
                  placeholder={t('servers', 'ipAddressPlaceholder')}
                  className="input w-full terminal-text"
                />
              </SettingsField>
              <SettingsField label={t('servers', 'authMethod')}>
                <div className="dash-segmented" role="group" aria-label={t('servers', 'authMethod')}>
                  {[
                    { key: 'password' as AuthMethod, label: t('servers', 'rootPassword') },
                    { key: 'ssh_key' as AuthMethod, label: t('servers', 'sshKey') },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setAuthMethod(opt.key)}
                      aria-pressed={authMethod === opt.key}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </SettingsField>
              {authMethod === 'password' ? (
                <SettingsField
                  label={t('servers', 'rootPassword')}
                  hint={t('servers', 'rootPasswordHint')}
                  htmlFor="ns-byos-password"
                >
                  <div className="relative">
                    <input
                      id="ns-byos-password"
                      type={showPassword ? 'text' : 'password'}
                      value={byosData.rootPassword}
                      onChange={(e) => setByosData({ ...byosData, rootPassword: e.target.value })}
                      placeholder={t('servers', 'rootPasswordPlaceholder')}
                      className="input w-full pr-10!"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 dash-icon-action"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </SettingsField>
              ) : (
                <SettingsField
                  label={t('servers', 'sshKey')}
                  hint={t('servers', 'sshKeyHint')}
                  htmlFor="ns-byos-key"
                >
                  <textarea
                    id="ns-byos-key"
                    value={byosData.sshPrivateKey}
                    onChange={(e) => setByosData({ ...byosData, sshPrivateKey: e.target.value })}
                    placeholder={t('servers', 'sshKeyPlaceholder')}
                    className="input w-full terminal-text text-xs leading-relaxed resize-none"
                    rows={5}
                  />
                </SettingsField>
              )}
            </SettingsSection>

            <SettingsSection id="ns-byos-info" title={t('servers', 'byosInfoTitle')} padded>
              <ol className="space-y-2">
                {[
                  t('servers', 'byosStep1'),
                  t('servers', 'byosStep2'),
                  t('servers', 'byosStep3'),
                  t('servers', 'byosStep4'),
                ].map((step, i) => (
                  <li key={i} className="flex items-baseline gap-3 text-[13px] text-[var(--text-secondary)]">
                    <span className="terminal-text text-xs text-[var(--text-muted)] tabular-nums shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </SettingsSection>
          </>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
            {atServerLimit
              ? t('servers', 'serverLimitReached')
                  .replace('{used}', String(serverUsage?.used ?? 0))
                  .replace('{limit}', String(serverUsage?.limit ?? 0))
                  .replace('{plan}', billingInfo?.planName ?? '')
              : isValid
                ? t('servers', 'readyToCreate')
                : t('servers', 'fillRequiredFields')}
          </p>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/servers" className="btn btn-secondary">
              {t('common', 'cancel')}
            </Link>
            <button
              type="submit"
              disabled={!isValid || createServer.isPending || atServerLimit}
              className="btn btn-primary"
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
      </TabPanel>
    </div>
  );
}
