'use client';

import { useState } from 'react';
import { Bell, Globe, Plus, Send, Trash2 } from 'lucide-react';
import {
  useNotificationChannels,
  useCreateNotificationChannel,
  useUpdateNotificationChannel,
  useDeleteNotificationChannel,
  useTestNotificationChannel,
  useTranslation,
} from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import { type NotificationChannel, type NotificationChannelType, type NotificationEvent, type ChannelConfig } from '@/lib/api';

export function NotificationsTab({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [channelType, setChannelType] = useState<NotificationChannelType>('slack');
  const [channelName, setChannelName] = useState('');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [emailAddresses, setEmailAddresses] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<NotificationEvent[]>([
    'deployment.started',
    'deployment.success',
    'deployment.failed',
  ]);

  const confirm = useConfirm();
  const { data: channels = [], isLoading } = useNotificationChannels(projectId);
  const createChannel = useCreateNotificationChannel(projectId);
  const updateChannel = useUpdateNotificationChannel(projectId);
  const deleteChannel = useDeleteNotificationChannel(projectId);
  const testChannel = useTestNotificationChannel(projectId);

  const resetForm = () => {
    setChannelName('');
    setChannelType('slack');
    setSlackWebhookUrl('');
    setEmailAddresses('');
    setWebhookUrl('');
    setWebhookSecret('');
    setSelectedEvents(['deployment.started', 'deployment.success', 'deployment.failed']);
    setEditingChannel(null);
    setShowAddForm(false);
  };

  const handleSubmit = async () => {
    let config: ChannelConfig;

    switch (channelType) {
      case 'slack':
        config = { webhookUrl: slackWebhookUrl };
        break;
      case 'email':
        config = { emails: emailAddresses.split(',').map((e) => e.trim()).filter(Boolean) };
        break;
      case 'webhook':
        config = { url: webhookUrl, ...(webhookSecret && { secret: webhookSecret }) };
        break;
    }

    if (editingChannel) {
      await updateChannel.mutateAsync({
        channelId: editingChannel.id,
        input: { name: channelName, config, events: selectedEvents },
      });
    } else {
      await createChannel.mutateAsync({
        type: channelType,
        name: channelName,
        config,
        events: selectedEvents,
      });
    }

    resetForm();
  };

  const handleEdit = (channel: NotificationChannel) => {
    setEditingChannel(channel);
    setChannelName(channel.name);
    setChannelType(channel.type);
    setSelectedEvents(channel.events as NotificationEvent[]);
    setShowAddForm(true);
  };

  const handleDelete = async (channelId: string) => {
    const ok = await confirm({
      variant: 'danger',
      title: 'Delete notification channel',
      description: 'Are you sure you want to delete this notification channel?',
      confirmText: t('common', 'delete'),
      cancelText: t('common', 'cancel'),
    });
    if (ok) {
      await deleteChannel.mutateAsync(channelId);
    }
  };

  const handleTest = async (channelId: string) => {
    try {
      await testChannel.mutateAsync(channelId);
      alert(t('notifications', 'testSuccess'));
    } catch {
      alert(t('notifications', 'testFailed'));
    }
  };

  const toggleEvent = (event: NotificationEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const eventsList: { id: NotificationEvent; label: string }[] = [
    { id: 'deployment.started', label: t('notifications', 'deploymentStarted') },
    { id: 'deployment.success', label: t('notifications', 'deploymentSuccess') },
    { id: 'deployment.failed', label: t('notifications', 'deploymentFailed') },
    { id: 'health.unhealthy', label: t('notifications', 'healthUnhealthy') },
    { id: 'health.recovered', label: t('notifications', 'healthRecovered') },
  ];

  const getChannelTypeIcon = (type: NotificationChannelType) => {
    switch (type) {
      case 'slack':
        return <Send className="w-4 h-4" />;
      case 'email':
        return <Send className="w-4 h-4" />;
      case 'webhook':
        return <Globe className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-[var(--bg-secondary)] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-[var(--text-secondary)]">
            {t('notifications', 'description')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary justify-center w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('notifications', 'addChannel')}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-lg font-semibold">
            {editingChannel ? t('notifications', 'editChannel') : t('notifications', 'addChannel')}
          </h3>

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('notifications', 'channelName')}
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder={t('notifications', 'channelNamePlaceholder')}
              className="input max-w-md"
            />
          </div>

          {/* Channel Type */}
          {!editingChannel && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('notifications', 'channelType')}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['slack', 'email', 'webhook'] as NotificationChannelType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setChannelType(type)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      channelType === type
                        ? 'dash-accent-fill border'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {t('notifications', type)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type-specific config */}
          {channelType === 'slack' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('notifications', 'slackWebhookUrl')}
              </label>
              <input
                type="text"
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder={t('notifications', 'slackWebhookUrlPlaceholder')}
                className="input max-w-xl terminal-text text-sm"
              />
            </div>
          )}

          {channelType === 'email' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('notifications', 'emailAddresses')}
              </label>
              <input
                type="text"
                value={emailAddresses}
                onChange={(e) => setEmailAddresses(e.target.value)}
                placeholder={t('notifications', 'emailAddressesPlaceholder')}
                className="input max-w-xl"
              />
            </div>
          )}

          {channelType === 'webhook' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('notifications', 'webhookUrl')}
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder={t('notifications', 'webhookUrlPlaceholder')}
                  className="input max-w-xl terminal-text text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('notifications', 'webhookSecret')}
                </label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder={t('notifications', 'webhookSecretPlaceholder')}
                  className="input max-w-xl terminal-text text-sm"
                />
              </div>
            </>
          )}

          {/* Events */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('notifications', 'events')}
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              {t('notifications', 'eventsDesc')}
            </p>
            <div className="flex flex-wrap gap-2">
              {eventsList.map((event) => (
                <button
                  key={event.id}
                  onClick={() => toggleEvent(event.id)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    selectedEvents.includes(event.id)
                      ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {event.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <button onClick={resetForm} className="btn btn-ghost">
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!channelName || createChannel.isPending || updateChannel.isPending}
              className="btn btn-primary disabled:opacity-50"
            >
              {createChannel.isPending || updateChannel.isPending ? t('common', 'loading') : t('common', 'save')}
            </button>
          </div>
        </div>
      )}

      {/* Channels List */}
      {channels.length === 0 && !showAddForm ? (
        <div className="p-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
          <Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">{t('notifications', 'noChannels')}</h3>
          <p className="text-[var(--text-secondary)]">{t('notifications', 'noChannelsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0 overflow-hidden"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
                    {getChannelTypeIcon(channel.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{channel.name}</span>
                      <span className="px-2 py-0.5 text-xs rounded bg-[var(--bg-tertiary)]">
                        {t('notifications', channel.type)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          channel.isActive
                            ? 'bg-[var(--status-success)]/20 text-[var(--status-success)]'
                            : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
                        }`}
                      >
                        {channel.isActive ? t('notifications', 'active') : t('notifications', 'inactive')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {channel.events.slice(0, 3).map((event) => (
                        <span key={event} className="text-xs text-[var(--text-muted)]">
                          {event}
                        </span>
                      ))}
                      {channel.events.length > 3 && (
                        <span className="text-xs text-[var(--text-muted)]">
                          +{channel.events.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => handleTest(channel.id)}
                    disabled={testChannel.isPending}
                    className="btn btn-ghost h-8 text-xs"
                  >
                    <Send className="w-3 h-3 shrink-0" />
                    {t('notifications', 'testChannel')}
                  </button>
                  <button onClick={() => handleEdit(channel)} className="btn btn-ghost h-8 text-xs">
                    {t('common', 'edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(channel.id)}
                    className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
