'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, FileText, Play, Pause, RefreshCw } from 'lucide-react';
import type { useTranslation } from '@/hooks';
import {
  useProjectWorkers,
  useProjectWorkerStatuses,
  useProjectWorkerLogs,
  useCreateProjectWorker,
  useUpdateProjectWorker,
  useDeleteProjectWorker,
} from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import type { ProjectWorker } from '@/lib/api';

const NAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

export function WorkersTab({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<ProjectWorker | null>(null);
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [logsWorkerId, setLogsWorkerId] = useState<string | null>(null);

  const confirm = useConfirm();
  const { data: workers = [], isLoading } = useProjectWorkers(projectId);
  const { data: statuses = {}, refetch: refetchStatuses, isFetching: statusesFetching } =
    useProjectWorkerStatuses(projectId, workers.length > 0);
  const createWorker = useCreateProjectWorker(projectId);
  const updateWorker = useUpdateProjectWorker(projectId);
  const deleteWorker = useDeleteProjectWorker(projectId);
  const { data: logsData, isFetching: logsFetching, refetch: refetchLogs } = useProjectWorkerLogs(
    projectId,
    logsWorkerId,
    200
  );

  const resetForm = () => {
    setName('');
    setCommand('');
    setEditingWorker(null);
    setShowForm(false);
  };

  const startEdit = (worker: ProjectWorker) => {
    setEditingWorker(worker);
    setName(worker.name);
    setCommand(worker.command);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (editingWorker) {
      await updateWorker.mutateAsync({ workerId: editingWorker.id, input: { command } });
    } else {
      await createWorker.mutateAsync({ name, command });
    }
    resetForm();
  };

  const handleToggle = (worker: ProjectWorker) => {
    updateWorker.mutate({ workerId: worker.id, input: { enabled: !worker.enabled } });
  };

  const handleDelete = async (worker: ProjectWorker) => {
    const ok = await confirm({
      title: t('workers', 'deleteConfirmTitle'),
      description: t('workers', 'deleteConfirmMessage'),
      variant: 'danger',
    });
    if (ok) {
      if (logsWorkerId === worker.id) setLogsWorkerId(null);
      deleteWorker.mutate(worker.id);
    }
  };

  const isValid = (editingWorker || NAME_RE.test(name)) && command.trim().length > 0;

  const workerState = (worker: ProjectWorker) => {
    if (!worker.enabled) return { dot: '', label: t('workers', 'stateDisabled') };
    const live = statuses[worker.name];
    if (!live) return { dot: 'is-warning', label: t('workers', 'statePendingDeploy') };
    if (live.state === 'running') return { dot: 'is-success', label: t('workers', 'stateRunning') };
    return { dot: 'is-error', label: `${t('workers', 'stateStopped')} (${live.state})` };
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
        <p className="text-sm text-[var(--text-secondary)] min-w-0">
          {t('workers', 'description')}
        </p>
        <div className="flex gap-2 shrink-0">
          {workers.length > 0 && (
            <button
              onClick={() => refetchStatuses()}
              className="btn btn-secondary justify-center !px-3"
              title={t('workers', 'refreshStatus')}
              aria-label={t('workers', 'refreshStatus')}
            >
              <RefreshCw className={`w-4 h-4 ${statusesFetching ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary justify-center w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {t('workers', 'addWorker')}
          </button>
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="dash-card p-4 sm:p-5 space-y-5">
          <h3 className="dash-section-label">
            {editingWorker ? t('workers', 'editWorker') : t('workers', 'addWorker')}
          </h3>

          {!editingWorker && (
            <div>
              <label className="dash-section-label block mb-2">
                {t('workers', 'name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder={t('workers', 'namePlaceholder')}
                className="input max-w-md terminal-text"
              />
              <p className="dash-field-hint">
                {t('workers', 'nameHint')}
              </p>
            </div>
          )}

          <div>
            <label className="dash-section-label block mb-2">
              {t('workers', 'command')}
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={t('workers', 'commandPlaceholder')}
              className="input w-full terminal-text text-sm"
            />
            <p className="dash-field-hint">
              {t('workers', 'commandHint')}
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="btn btn-ghost">
              {t('workers', 'cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || createWorker.isPending || updateWorker.isPending}
              className="btn btn-primary"
            >
              {editingWorker ? t('workers', 'save') : t('workers', 'create')}
            </button>
          </div>
        </div>
      )}

      {/* Worker list */}
      {workers.length === 0 && !showForm ? (
        <div className="dash-card px-6 py-14 text-center">
          <p className="text-[15px] font-medium">{t('workers', 'empty')}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('workers', 'emptyHint')}</p>
        </div>
      ) : (
        <div className="dash-rows">
          {workers.map((worker) => {
            const state = workerState(worker);
            const showingLogs = logsWorkerId === worker.id;
            return (
              <div key={worker.id} className="dash-row !p-0">
                <div className="px-4 py-3 sm:px-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`dash-status-dot ${state.dot}`} aria-hidden />
                      <span className="terminal-text text-[13px] text-[var(--text-primary)] truncate">{worker.name}</span>
                      <span className="dash-section-label">{state.label}</span>
                    </div>
                    <p className="terminal-text text-xs text-[var(--text-muted)] mt-1 truncate">
                      {worker.command}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => setLogsWorkerId(showingLogs ? null : worker.id)}
                      className="btn btn-ghost btn-sm !px-2"
                      title={t('workers', 'viewLogs')}
                      aria-label={t('workers', 'viewLogs')}
                      aria-expanded={showingLogs}
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(worker)}
                      className="btn btn-ghost btn-sm !px-2"
                      title={worker.enabled ? t('workers', 'disable') : t('workers', 'enable')}
                      aria-label={worker.enabled ? t('workers', 'disable') : t('workers', 'enable')}
                    >
                      {worker.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEdit(worker)}
                      className="btn btn-ghost btn-sm !px-2"
                      title={t('workers', 'editWorker')}
                      aria-label={t('workers', 'editWorker')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(worker)}
                      className="btn btn-ghost btn-sm !px-2 hover:!text-[var(--status-error)]"
                      title={t('workers', 'deleteWorker')}
                      aria-label={t('workers', 'deleteWorker')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showingLogs && (
                  <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 sm:px-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="dash-section-label">
                        {t('workers', 'recentLogs')}
                      </span>
                      <button
                        onClick={() => refetchLogs()}
                        className="btn btn-ghost btn-sm !px-2"
                        title={t('workers', 'refreshLogs')}
                        aria-label={t('workers', 'refreshLogs')}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${logsFetching ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <pre className="terminal-text text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[10px] p-3 overflow-x-auto max-h-72 overflow-y-auto whitespace-pre-wrap">
                      {logsFetching && !logsData
                        ? t('workers', 'loadingLogs')
                        : logsData?.logs?.trim() || t('workers', 'noLogs')}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Deploy note */}
      {workers.length > 0 && (
        <p className="dash-mono-caption">{t('workers', 'deployNote')}</p>
      )}
    </div>
  );
}
