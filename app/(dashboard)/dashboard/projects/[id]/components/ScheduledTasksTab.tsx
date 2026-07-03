'use client';

import { useState } from 'react';
import { Clock, Globe, Pause, Pencil, Play, Plus, Terminal, Trash2 } from 'lucide-react';
import {
  useScheduledTasks,
  useCreateScheduledTask,
  useUpdateScheduledTask,
  useDeleteScheduledTask,
  useRunScheduledTask,
  useScheduledTaskRuns,
  useTranslation,
} from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import type { ScheduledTask, ScheduledTaskType, ScheduledTaskRunStatus } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';

const PRESETS: { key: 'presetEvery5m' | 'presetEvery30m' | 'presetHourly' | 'presetDaily' | 'presetWeekly'; cron: string }[] = [
  { key: 'presetEvery5m', cron: '*/5 * * * *' },
  { key: 'presetEvery30m', cron: '*/30 * * * *' },
  { key: 'presetHourly', cron: '0 * * * *' },
  { key: 'presetDaily', cron: '0 3 * * *' },
  { key: 'presetWeekly', cron: '0 3 * * 1' },
];

function statusColor(status: ScheduledTaskRunStatus | null): string {
  switch (status) {
    case 'success':
      return 'var(--status-success)';
    case 'failed':
      return 'var(--status-error)';
    case 'timeout':
      return 'var(--status-warning)';
    default:
      return 'var(--text-muted)';
  }
}

export function ScheduledTasksTab({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [name, setName] = useState('');
  const [taskType, setTaskType] = useState<ScheduledTaskType>('command');
  const [command, setCommand] = useState('');
  const [httpUrl, setHttpUrl] = useState('');
  const [schedule, setSchedule] = useState('0 3 * * *');
  const [timezone, setTimezone] = useState('UTC');
  const [timeoutSeconds, setTimeoutSeconds] = useState(120);
  const [expandedRunsTaskId, setExpandedRunsTaskId] = useState<string | null>(null);

  const confirm = useConfirm();
  const { data: tasks = [], isLoading } = useScheduledTasks(projectId);
  const createTask = useCreateScheduledTask(projectId);
  const updateTask = useUpdateScheduledTask(projectId);
  const deleteTask = useDeleteScheduledTask(projectId);
  const runTask = useRunScheduledTask(projectId);
  const { data: runs = [] } = useScheduledTaskRuns(projectId, expandedRunsTaskId);

  const resetForm = () => {
    setName('');
    setTaskType('command');
    setCommand('');
    setHttpUrl('');
    setSchedule('0 3 * * *');
    setTimezone('UTC');
    setTimeoutSeconds(120);
    setEditingTask(null);
    setShowForm(false);
  };

  const startEdit = (task: ScheduledTask) => {
    setEditingTask(task);
    setName(task.name);
    setTaskType(task.type);
    setCommand(task.command ?? '');
    setHttpUrl(task.httpUrl ?? '');
    setSchedule(task.schedule);
    setTimezone(task.timezone);
    setTimeoutSeconds(task.timeoutSeconds);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const base = {
      name,
      schedule,
      timezone,
      timeoutSeconds,
      ...(taskType === 'command' ? { command } : { httpUrl }),
    };
    if (editingTask) {
      await updateTask.mutateAsync({ taskId: editingTask.id, input: base });
    } else {
      await createTask.mutateAsync({ ...base, type: taskType });
    }
    resetForm();
  };

  const handleDelete = async (task: ScheduledTask) => {
    const ok = await confirm({
      title: t('cron', 'deleteConfirmTitle'),
      description: t('cron', 'deleteConfirmMessage'),
      variant: 'danger',
    });
    if (ok) deleteTask.mutate(task.id);
  };

  const isValid =
    name.trim() &&
    schedule.trim().split(/\s+/).length === 5 &&
    (taskType === 'command' ? command.trim() : httpUrl.trim());

  const statusLabel = (status: ScheduledTaskRunStatus | null) =>
    status === 'success'
      ? t('cron', 'statusSuccess')
      : status === 'failed'
        ? t('cron', 'statusFailed')
        : status === 'timeout'
          ? t('cron', 'statusTimeout')
          : t('cron', 'never');

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
        <p className="text-sm text-[var(--text-secondary)] min-w-0">{t('cron', 'description')}</p>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary justify-center w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('cron', 'addTask')}
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-lg font-semibold">
            {editingTask ? t('cron', 'editTask') : t('cron', 'addTask')}
          </h3>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('cron', 'name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('cron', 'namePlaceholder')}
              className="input max-w-md"
            />
          </div>

          {!editingTask && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('cron', 'taskType')}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['command', 'http'] as ScheduledTaskType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTaskType(type)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      taskType === type
                        ? 'dash-accent-fill border'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {type === 'command' ? t('cron', 'typeCommand') : t('cron', 'typeHttp')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {taskType === 'command' ? (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('cron', 'command')}
              </label>
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={t('cron', 'commandPlaceholder')}
                rows={2}
                className="input max-w-xl terminal-text text-sm resize-y"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('cron', 'url')}
              </label>
              <input
                type="text"
                value={httpUrl}
                onChange={(e) => setHttpUrl(e.target.value)}
                placeholder={t('cron', 'urlPlaceholder')}
                className="input max-w-xl terminal-text text-sm"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('cron', 'schedule')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.cron}
                    onClick={() => setSchedule(preset.cron)}
                    className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                      schedule === preset.cron
                        ? 'dash-accent-fill border'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {t('cron', preset.key)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder={t('cron', 'schedulePlaceholder')}
                className="input max-w-xs terminal-text text-sm"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1.5">{t('cron', 'scheduleHelp')}</p>
            </div>
            <div className="flex gap-3">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('cron', 'timezone')}
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="UTC"
                  className="input w-44 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('cron', 'timeoutSeconds')}
                </label>
                <input
                  type="number"
                  min={10}
                  max={600}
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10) || 120)}
                  className="input w-28 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="btn btn-ghost">
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || createTask.isPending || updateTask.isPending}
              className="btn btn-primary"
            >
              {t('cron', 'save')}
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 && !showForm ? (
        <div className="p-10 rounded-lg border border-dashed border-[var(--border-subtle)] text-center">
          <Clock className="w-8 h-8 mx-auto mb-3 text-[var(--text-muted)]" />
          <p className="font-medium mb-1">{t('cron', 'noTasks')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('cron', 'noTasksDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
            >
              <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: statusColor(task.lastStatus) }}
                    title={statusLabel(task.lastStatus)}
                  />
                  {task.type === 'command' ? (
                    <Terminal className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                  ) : (
                    <Globe className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{task.name}</span>
                      <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                        {task.schedule}
                      </code>
                      {!task.enabled && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)]">
                          {t('cron', 'pause')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                      {t('cron', 'lastRun')}:{' '}
                      {task.lastRunAt ? formatTimeAgo(task.lastRunAt) : t('cron', 'never')}
                      {' · '}
                      {t('cron', 'nextRun')}:{' '}
                      {task.enabled && task.nextRunAt
                        ? new Date(task.nextRunAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 flex-wrap">
                  <button
                    onClick={() => runTask.mutate(task.id)}
                    disabled={runTask.isPending}
                    className="btn btn-ghost h-8 text-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {runTask.isPending && runTask.variables === task.id
                      ? t('cron', 'running')
                      : t('cron', 'runNow')}
                  </button>
                  <button
                    onClick={() =>
                      updateTask.mutate({ taskId: task.id, input: { enabled: !task.enabled } })
                    }
                    className="btn btn-ghost h-8 text-xs"
                  >
                    {task.enabled ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        {t('cron', 'pause')}
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        {t('cron', 'resume')}
                      </>
                    )}
                  </button>
                  <button onClick={() => startEdit(task)} className="btn btn-ghost h-8 text-xs">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setExpandedRunsTaskId(expandedRunsTaskId === task.id ? null : task.id)
                    }
                    className="btn btn-ghost h-8 text-xs"
                  >
                    {expandedRunsTaskId === task.id ? t('cron', 'hideRuns') : t('cron', 'showRuns')}
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    className="btn btn-ghost h-8 text-xs text-[var(--status-error)]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Run history */}
              {expandedRunsTaskId === task.id && (
                <div className="border-t border-[var(--border-subtle)] p-4 space-y-2">
                  {runs.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">{t('cron', 'noRuns')}</p>
                  ) : (
                    runs.map((run) => (
                      <details key={run.id} className="group">
                        <summary className="flex items-center gap-2 text-xs cursor-pointer list-none py-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: statusColor(run.status) }}
                          />
                          <span className="font-medium">{statusLabel(run.status)}</span>
                          {run.trigger === 'manual' && (
                            <span className="px-1.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)]">
                              {t('cron', 'manualTrigger')}
                            </span>
                          )}
                          <span className="text-[var(--text-muted)]">
                            {formatTimeAgo(run.startedAt)}
                            {run.durationMs !== null && ` · ${(run.durationMs / 1000).toFixed(1)}s`}
                            {run.exitCode !== null && ` · ${t('cron', 'exitCode')}: ${run.exitCode}`}
                            {run.httpStatus !== null &&
                              ` · ${t('cron', 'httpStatus')}: ${run.httpStatus}`}
                          </span>
                        </summary>
                        {(run.output || run.errorMessage) && (
                          <pre className="mt-1 mb-2 p-3 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
                            {run.errorMessage ? `${run.errorMessage}\n` : ''}
                            {run.output ?? ''}
                          </pre>
                        )}
                      </details>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
