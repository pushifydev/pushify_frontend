'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks';
import { PageHeader } from '@/components/dashboard/PageKit';
import { ProfileTab, AppearanceTab, SessionsTab, NotificationsTab, SecurityTab, ApiKeysTab, RegistriesTab, SsoTab } from './components';

type SettingsTab = 'profile' | 'appearance' | 'sessions' | 'notifications' | 'security' | 'api-keys' | 'registries' | 'sso';

interface TabDef {
  id: SettingsTab;
  labelKey: 'profile' | 'appearance' | 'sessions' | 'notificationPrefs' | 'security' | 'apiKeys' | 'registries' | 'sso';
}

// Grouped like the content actually splits: identity/preferences vs. who-can-get-in
const tabGroups: { groupKey: 'settingsGroupAccount' | 'settingsGroupAccess'; tabs: TabDef[] }[] = [
  {
    groupKey: 'settingsGroupAccount',
    tabs: [
      { id: 'profile', labelKey: 'profile' },
      { id: 'appearance', labelKey: 'appearance' },
      { id: 'notifications', labelKey: 'notificationPrefs' },
    ],
  },
  {
    groupKey: 'settingsGroupAccess',
    tabs: [
      { id: 'security', labelKey: 'security' },
      { id: 'sessions', labelKey: 'sessions' },
      { id: 'api-keys', labelKey: 'apiKeys' },
      { id: 'registries', labelKey: 'registries' },
      { id: 'sso', labelKey: 'sso' },
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

  // Real links (open in a new tab, copy), but a plain click switches in place.
  const onNavClick = (tab: SettingsTab) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    handleTabChange(tab);
  };

  // Keep the active item visible in the mobile tab strip (e.g. deep link to ?tab=security)
  useEffect(() => {
    document
      .querySelector(`[data-settings-chip="${activeTab}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeTab]);

  const activeLabel = allTabs.find((tab) => tab.id === activeTab);

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-clip">
      <PageHeader
        title={t('navigation', 'settings')}
        description={t('navigation', 'settingsDescription')}
      />

      {/* Phones and tablets: the same sections as an underline strip */}
      <nav className="dash-tabs dash-settings-strip" aria-label={t('navigation', 'settings')}>
        {allTabs.map((tab) => (
          <a
            key={tab.id}
            href={`/dashboard/settings?tab=${tab.id}`}
            data-settings-chip={tab.id}
            onClick={onNavClick(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={`dash-tab${activeTab === tab.id ? ' is-active' : ''}`}
          >
            {t(tab.labelKey, 'title')}
          </a>
        ))}
      </nav>

      <div className="dash-settings">
        <nav className="dash-settings-nav" aria-label={t('navigation', 'settings')}>
          {tabGroups.map((group) => (
            <div key={group.groupKey} className="dash-settings-nav-group">
              <p className="dash-settings-nav-heading">{t('navigation', group.groupKey)}</p>
              {group.tabs.map((tab) => (
                <a
                  key={tab.id}
                  href={`/dashboard/settings?tab=${tab.id}`}
                  onClick={onNavClick(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {t(tab.labelKey, 'title')}
                </a>
              ))}
            </div>
          ))}
        </nav>

        <section
          className="dash-settings-stack animate-in fade-in duration-200"
          key={activeTab}
          aria-label={activeLabel ? t(activeLabel.labelKey, 'title') : undefined}
        >
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'api-keys' && <ApiKeysTab />}
          {activeTab === 'registries' && <RegistriesTab />}
          {activeTab === 'sso' && <SsoTab />}
        </section>
      </div>
    </div>
  );
}
