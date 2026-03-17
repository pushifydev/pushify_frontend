'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Key, Shield, Settings, ChevronRight, User, Palette, Monitor, Bell } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { ProfileTab, AppearanceTab, SessionsTab, NotificationsTab, SecurityTab, ApiKeysTab } from './components';

type SettingsTab = 'profile' | 'appearance' | 'sessions' | 'notifications' | 'security' | 'api-keys';

const tabs: { id: SettingsTab; icon: React.ElementType; labelKey: 'profile' | 'appearance' | 'sessions' | 'notificationPrefs' | 'security' | 'apiKeys' }[] = [
  { id: 'profile', icon: User, labelKey: 'profile' },
  { id: 'appearance', icon: Palette, labelKey: 'appearance' },
  { id: 'sessions', icon: Monitor, labelKey: 'sessions' },
  { id: 'notifications', icon: Bell, labelKey: 'notificationPrefs' },
  { id: 'security', icon: Shield, labelKey: 'security' },
  { id: 'api-keys', icon: Key, labelKey: 'apiKeys' },
];

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

  return (
    <div className="min-h-[calc(100vh-4rem)]">
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
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar Navigation */}
          <nav className="md:w-64 shrink-0">
            <div className="md:sticky md:top-24 flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 md:space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 md:px-4 md:py-3 rounded-lg text-left transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{t(tab.labelKey, 'title')}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform hidden md:block ${isActive ? 'rotate-90' : ''}`}
                    />
                  </button>
                );
              })}
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
