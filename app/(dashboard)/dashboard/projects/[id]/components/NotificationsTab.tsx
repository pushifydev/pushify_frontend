'use client';

import { useState } from 'react';
import { Bell, Check, Globe, MessageCircle, Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<NotificationEvent[]>([
    'deployment.started',
    'deployment.success',
    'deployment.failed',
  ]);

  const confirm = useConfirm();
  const { locale } = useTranslation();
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
    setDiscordWebhookUrl('');
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
      case 'discord':
        config = { webhookUrl: discordWebhookUrl };
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
      title: t('notifications', 'deleteChannelTitle'),
      description:
        locale === 'tr'
          ? 'Bu bildirim kanalı silinsin mi? Bu işlem geri alınamaz.'
          : 'Delete this notification channel? This can’t be undone.',
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
      toast.success(t('notifications', 'testSuccess'));
    } catch {
      toast.error(t('notifications', 'testFailed'));
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
      case 'discord':
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-[var(--bg-secondary)] rounded-[14px]" />
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
        <div className="dash-card p-4 sm:p-5 space-y-5">
          <h3 className="dash-section-label">
            {editingChannel ? t('notifications', 'editChannel') : t('notifications', 'addChannel')}
          </h3>

          {/* Channel Name */}
          <div>
            <label className="dash-section-label block mb-2">
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
              <label className="dash-section-label block mb-2">
                {t('notifications', 'channelType')}
              </label>
              <div className="dash-segmented flex-wrap" role="group">
                {(['slack', 'email', 'webhook', 'discord'] as NotificationChannelType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setChannelType(type)}
                    aria-pressed={channelType === type}
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
              <label className="dash-section-label block mb-2">
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

          {channelType === 'discord' && (
            <div>
              <label className="dash-section-label block mb-2">
                {t('notifications', 'discordWebhookUrl')}
              </label>
              <input
                type="text"
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                placeholder={t('notifications', 'discordWebhookUrlPlaceholder')}
                className="input max-w-xl terminal-text text-sm"
              />
            </div>
          )}

          {channelType === 'email' && (
            <div>
              <label className="dash-section-label block mb-2">
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
                <label className="dash-section-label block mb-2">
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
                <label className="dash-section-label block mb-2">
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
            <label className="dash-section-label block mb-2">
              {t('notifications', 'events')}
            </label>
            <p className="text-xs text-[var(--text-muted)] -mt-1 mb-3">
              {t('notifications', 'eventsDesc')}
            </p>
            <div className="flex flex-wrap gap-2">
              {eventsList.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  aria-pressed={selectedEvents.includes(event.id)}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] border transition-colors ${
                    selectedEvents.includes(event.id)
                      ? 'border-[var(--text-primary)] text-[var(--text-primary)] bg-[var(--hover-overlay-md)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {selectedEvents.includes(event.id) && <Check className="w-3.5 h-3.5" aria-hidden />}
                  {event.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={resetForm} className="btn btn-ghost">
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!channelName || createChannel.isPending || updateChannel.isPending}
              className="btn btn-primary"
            >
              {createChannel.isPending || updateChannel.isPending ? t('common', 'loading') : t('common', 'save')}
            </button>
          </div>
        </div>
      )}

      {/* Channels List */}
      {channels.length === 0 && !showAddForm ? (
        <div className="dash-card px-6 py-14 text-center">
          <Bell className="dash-empty-icon mb-3" />
          <h3 className="text-[15px] mb-1">{t('notifications', 'noChannels')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('notifications', 'noChannelsDesc')}</p>
        </div>
      ) : (
        <div className="dash-rows">
          {channels.map((channel) => (
            <div key={channel.id} className="dash-row">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="dash-icon-box shrink-0">
                    {getChannelTypeIcon(channel.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{channel.name}</span>
                      <span className="dash-section-label">
                        {t('notifications', channel.type)}
                      </span>
                      <span className={`badge ${channel.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {channel.isActive ? t('notifications', 'active') : t('notifications', 'inactive')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                      {channel.events.slice(0, 3).map((event) => (
                        <span key={event} className="terminal-text text-[11px] text-[var(--text-muted)]">
                          {event}
                        </span>
                      ))}
                      {channel.events.length > 3 && (
                        <span className="terminal-text text-[11px] text-[var(--text-muted)]">
                          +{channel.events.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => handleTest(channel.id)}
                    disabled={testChannel.isPending}
                    className="btn btn-secondary btn-sm"
                  >
                    <Send className="w-3 h-3 shrink-0" />
                    {t('notifications', 'testChannel')}
                  </button>
                  <button onClick={() => handleEdit(channel)} className="btn btn-ghost btn-sm">
                    {t('common', 'edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(channel.id)}
                    aria-label={`${t('common', 'delete')} ${channel.name}`}
                    title={t('common', 'delete')}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
