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
        <div className="h-32 bg-[var(--bg-secondary)] rounded-[14px]" />
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
        <div className="dash-card p-4 sm:p-5 space-y-5">
          <h3 className="dash-section-label">
            {editingTask ? t('cron', 'editTask') : t('cron', 'addTask')}
          </h3>

          <div>
            <label className="dash-section-label block mb-2">
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
              <label className="dash-section-label block mb-2">
                {t('cron', 'taskType')}
              </label>
              <div className="dash-segmented" role="group">
                {(['command', 'http'] as ScheduledTaskType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTaskType(type)}
                    aria-pressed={taskType === type}
                  >
                    {type === 'command' ? t('cron', 'typeCommand') : t('cron', 'typeHttp')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {taskType === 'command' ? (
            <div>
              <label className="dash-section-label block mb-2">
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
              <label className="dash-section-label block mb-2">
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
              <label className="dash-section-label block mb-2">
                {t('cron', 'schedule')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.cron}
                    type="button"
                    onClick={() => setSchedule(preset.cron)}
                    aria-pressed={schedule === preset.cron}
                    className={`h-7 px-3 rounded-full border text-xs transition-colors ${
                      schedule === preset.cron
                        ? 'dash-accent-fill'
                        : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
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
              <p className="dash-field-hint">{t('cron', 'scheduleHelp')}</p>
            </div>
            <div className="flex gap-3">
              <div>
                <label className="dash-section-label block mb-2">
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
                <label className="dash-section-label block mb-2">
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
        <div className="dash-card px-6 py-14 text-center">
          <Clock className="dash-empty-icon mb-3" />
          <p className="text-[15px] font-medium mb-1">{t('cron', 'noTasks')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('cron', 'noTasksDesc')}</p>
        </div>
      ) : (
        <div className="dash-rows">
          {tasks.map((task) => (
            <div key={task.id} className="dash-row !p-0">
              <div className="px-4 py-3 sm:px-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="dash-status-dot"
                    style={{ background: statusColor(task.lastStatus) }}
                    title={statusLabel(task.lastStatus)}
                    aria-label={statusLabel(task.lastStatus)}
                    role="img"
                  />
                  {task.type === 'command' ? (
                    <Terminal className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
                  ) : (
                    <Globe className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{task.name}</span>
                      <code className="terminal-text text-xs px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                        {task.schedule}
                      </code>
                      {!task.enabled && (
                        <span className="badge badge-neutral">
                          {t('cron', 'pause')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                      {t('cron', 'lastRun')}:{' '}
                      {task.lastRunAt ? formatTimeAgo(task.lastRunAt, t) : t('cron', 'never')}
                      {' · '}
                      {t('cron', 'nextRun')}:{' '}
                      {task.enabled && task.nextRunAt
                        ? new Date(task.nextRunAt).toLocaleString()
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => runTask.mutate(task.id)}
                    disabled={runTask.isPending}
                    className="btn btn-secondary btn-sm"
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
                    className="btn btn-ghost btn-sm"
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
                  <button
                    onClick={() => startEdit(task)}
                    className="btn btn-ghost btn-sm !px-2"
                    aria-label={t('cron', 'editTask')}
                    title={t('cron', 'editTask')}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setExpandedRunsTaskId(expandedRunsTaskId === task.id ? null : task.id)
                    }
                    aria-expanded={expandedRunsTaskId === task.id}
                    className="btn btn-ghost btn-sm"
                  >
                    {expandedRunsTaskId === task.id ? t('cron', 'hideRuns') : t('cron', 'showRuns')}
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    className="btn btn-ghost btn-sm !px-2 hover:!text-[var(--status-error)]"
                    aria-label={`${t('common', 'delete')} ${task.name}`}
                    title={t('common', 'delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Run history */}
              {expandedRunsTaskId === task.id && (
                <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 sm:px-5 space-y-1">
                  {runs.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">{t('cron', 'noRuns')}</p>
                  ) : (
                    runs.map((run) => (
                      <details key={run.id} className="group">
                        <summary className="flex items-center gap-2 text-xs cursor-pointer list-none py-1">
                          <span
                            className="dash-status-dot"
                            style={{ background: statusColor(run.status) }}
                            aria-hidden
                          />
                          <span className="font-medium">{statusLabel(run.status)}</span>
                          {run.trigger === 'manual' && (
                            <span className="badge badge-neutral">
                              {t('cron', 'manualTrigger')}
                            </span>
                          )}
                          <span className="terminal-text text-[var(--text-muted)]">
                            {formatTimeAgo(run.startedAt, t)}
                            {run.durationMs !== null && ` · ${(run.durationMs / 1000).toFixed(1)}s`}
                            {run.exitCode !== null && ` · ${t('cron', 'exitCode')}: ${run.exitCode}`}
                            {run.httpStatus !== null &&
                              ` · ${t('cron', 'httpStatus')}: ${run.httpStatus}`}
                          </span>
                        </summary>
                        {(run.output || run.errorMessage) && (
                          <pre className="mt-1 mb-2 p-3 rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] terminal-text text-xs text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
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
