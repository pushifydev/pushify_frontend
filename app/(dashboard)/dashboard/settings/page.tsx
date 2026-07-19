'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Key, Shield, Settings, User, Palette, Monitor, Bell } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { ProfileTab, AppearanceTab, SessionsTab, NotificationsTab, SecurityTab, ApiKeysTab } from './components';

type SettingsTab = 'profile' | 'appearance' | 'sessions' | 'notifications' | 'security' | 'api-keys';

interface TabDef {
  id: SettingsTab;
  icon: React.ElementType;
  labelKey: 'profile' | 'appearance' | 'sessions' | 'notificationPrefs' | 'security' | 'apiKeys';
}

// Grouped like the content actually splits: identity/preferences vs. who-can-get-in
const tabGroups: { groupKey: 'settingsGroupAccount' | 'settingsGroupAccess'; tabs: TabDef[] }[] = [
  {
    groupKey: 'settingsGroupAccount',
    tabs: [
      { id: 'profile', icon: User, labelKey: 'profile' },
      { id: 'appearance', icon: Palette, labelKey: 'appearance' },
      { id: 'notifications', icon: Bell, labelKey: 'notificationPrefs' },
    ],
  },
  {
    groupKey: 'settingsGroupAccess',
    tabs: [
      { id: 'security', icon: Shield, labelKey: 'security' },
      { id: 'sessions', icon: Monitor, labelKey: 'sessions' },
      { id: 'api-keys', icon: Key, labelKey: 'apiKeys' },
    ],
  },
];

const allTabs = tabGroups.flatMap((g) => g.tabs);

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsTab) || 'profile';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.push(`/dashboard/settings?tab=${tab}`, { scroll: false });
  };

  // Keep the active chip visible in the mobile tab strip (e.g. deep link to ?tab=security)
  useEffect(() => {
    document
      .querySelector(`[data-settings-chip="${activeTab}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 border border-[var(--border-subtle)]">
              <Settings className="w-6 h-6 text-[var(--accent-cyan)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('navigation', 'settings')}</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {t('navigation', 'settingsDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Mobile: flat scrollable chip row */}
          <nav className="md:hidden -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 pb-1 w-max">
              {allTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-settings-chip={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                      isActive
                        ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-default)]'
                        : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(tab.labelKey, 'title')}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Desktop: grouped rail */}
          <nav className="hidden md:block md:w-56 shrink-0" aria-label={t('navigation', 'settings')}>
            <div className="md:sticky md:top-24 space-y-6">
              {tabGroups.map((group) => (
                <div key={group.groupKey}>
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {t('navigation', group.groupKey)}
                  </p>
                  <div className="space-y-0.5">
                    {group.tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                            isActive
                              ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium border border-[var(--border-subtle)] shadow-sm'
                              : 'text-[var(--text-secondary)] border border-transparent hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'
                            }`}
                          />
                          {t(tab.labelKey, 'title')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'appearance' && <AppearanceTab />}
            {activeTab === 'sessions' && <SessionsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'api-keys' && <ApiKeysTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
