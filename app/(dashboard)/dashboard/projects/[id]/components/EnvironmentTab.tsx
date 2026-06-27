'use client';

import { useState } from 'react';
import { FileText, Info, Key, Trash2, Pencil, Check } from 'lucide-react';
import { useEnvVars, useTranslation } from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';

export function EnvironmentTab({
  envVars,
  onCreate,
  onUpdate,
  onDelete,
  onBulkCreate,
  marketplaceTemplateId,
  productionUrl,
  t,
}: {
  envVars: ReturnType<typeof useEnvVars>['data'];
  onCreate: (data: { key: string; value: string }) => void;
  onUpdate: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  onBulkCreate: (data: { key: string; value: string }[]) => void;
  marketplaceTemplateId?: string;
  productionUrl?: string | null;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const confirm = useConfirm();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [envContent, setEnvContent] = useState('');
  const [parsedVars, setParsedVars] = useState<{ key: string; value: string }[]>([]);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
    setRevealedIds((prev) => new Set(prev).add(id)); // reveal while editing
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };
  const saveEdit = (id: string) => {
    if (editValue.trim() === '') return; // value is required
    onUpdate(id, editValue);
    cancelEdit();
  };

  const parseEnvContent = (content: string) => {
    const lines = content.split('\n');
    const vars: { key: string; value: string }[] = [];

    for (const line of lines) {
      // Skip empty lines and comments
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Match KEY=VALUE pattern (supports quotes)
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
      if (match) {
        const key = match[1].toUpperCase();
        let value = match[2];

        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        vars.push({ key, value });
      }
    }

    return vars;
  };

  const handleEnvContentChange = (content: string) => {
    setEnvContent(content);
    setParsedVars(parseEnvContent(content));
  };

  const handleBulkAdd = () => {
    if (parsedVars.length === 0) return;
    onBulkCreate(parsedVars);
    setEnvContent('');
    setParsedVars([]);
    setShowPasteForm(false);
  };

  const handleAdd = () => {
    if (!newKey || !newValue) return;
    onCreate({ key: newKey, value: newValue });
    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setRevealedIds(newSet);
  };

  return (
    <div className="space-y-4 min-w-0 overflow-hidden">
      {marketplaceTemplateId === 'supabase' && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 flex gap-3">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent-cyan)]" />
          <div className="min-w-0 text-sm">
            <p className="font-medium text-[var(--text-primary)] mb-1">
              {t('projectDetail', 'oauthHintTitle')}
            </p>
            <p className="text-[var(--text-secondary)] mb-2 break-words">
              {t('projectDetail', 'oauthHintBody').replace(
                '{url}',
                `${productionUrl ?? 'https://<app-url>'}/auth/v1/callback`
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['GOOGLE_ENABLED=true', 'GOOGLE_CLIENT_ID', 'GOOGLE_SECRET'].map((v) => (
                <code
                  key={v}
                  className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-[var(--text-secondary)] min-w-0">
          {t('projectDetail', 'envVarsDesc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => { setShowPasteForm(true); setShowAddForm(false); }}
            className="btn btn-secondary justify-center"
          >
            <FileText className="w-4 h-4" />
            {t('projectDetail', 'pasteEnv')}
          </button>
          <button
            onClick={() => { setShowAddForm(true); setShowPasteForm(false); }}
            className="btn btn-primary justify-center"
          >
            <Key className="w-4 h-4" />
            {t('projectDetail', 'addVariable')}
          </button>
        </div>
      </div>

      {/* Paste .env Form */}
      {showPasteForm && (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'pasteEnvContent')}
            </label>
            <textarea
              value={envContent}
              onChange={(e) => handleEnvContentChange(e.target.value)}
              placeholder={`# Paste your .env file content here\nAPI_KEY=your-api-key\nDATABASE_URL=postgres://...\nSECRET_KEY="value with spaces"`}
              rows={8}
              className="input terminal-text font-mono text-sm resize-none w-full"
            />
          </div>

          {/* Preview parsed variables */}
          {parsedVars.length > 0 && (
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {t('projectDetail', 'parsedVariables')} ({parsedVars.length})
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {parsedVars.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="terminal-text font-medium text-[var(--accent-cyan)]">{v.key}</span>
                    <span className="text-[var(--text-muted)]">=</span>
                    <span className="text-[var(--text-secondary)] truncate">{v.value.substring(0, 30)}{v.value.length > 30 ? '...' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => { setShowPasteForm(false); setEnvContent(''); setParsedVars([]); }}
              className="btn btn-ghost"
            >
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleBulkAdd}
              disabled={parsedVars.length === 0}
              className="btn btn-primary disabled:opacity-50"
            >
              {t('projectDetail', 'addVariables')} ({parsedVars.length})
            </button>
          </div>
        </div>
      )}

      {/* Single variable form */}
      {showAddForm && (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('projectDetail', 'key')}</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                placeholder="API_KEY"
                className="input terminal-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('projectDetail', 'value')}</label>
              <textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="your-secret-value (multi-line OK — e.g. a PEM private key)"
                rows={1}
                className="input terminal-text resize-y min-h-[38px] py-2"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">{t('common', 'cancel')}</button>
            <button onClick={handleAdd} className="btn btn-primary">{t('projectDetail', 'addVariable')}</button>
          </div>
        </div>
      )}

      {(!envVars || envVars.length === 0) && !showAddForm && !showPasteForm ? (
        <div className="p-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
          <Key className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">{t('projectDetail', 'noEnvVariables')}</h3>
          <p className="text-[var(--text-secondary)]">{t('projectDetail', 'noEnvVariablesDesc')}</p>
        </div>
      ) : envVars && envVars.length > 0 && (
        <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
          {envVars.map((envVar, index) => (
            <div
              key={envVar.id}
              className={`p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                index !== envVars.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                <span className="terminal-text font-medium">{envVar.key}</span>
                {editingId === envVar.id ? (
                  <textarea
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      // Cmd/Ctrl+Enter saves (plain Enter inserts a newline for multi-line values)
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit(envVar.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    rows={1}
                    className="input terminal-text flex-1 min-w-0 text-xs resize-y min-h-[32px] py-1"
                  />
                ) : (
                  <span className="text-[var(--text-muted)] terminal-text truncate">
                    {revealedIds.has(envVar.id) ? envVar.value : '••••••••'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {editingId === envVar.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(envVar.id)}
                      disabled={editValue.trim() === ''}
                      className="btn btn-primary h-8 text-xs flex items-center gap-1 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {t('common', 'save')}
                    </button>
                    <button onClick={cancelEdit} className="btn btn-ghost h-8 text-xs">
                      {t('common', 'cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => toggleReveal(envVar.id)} className="btn btn-ghost h-8 text-xs">
                      {revealedIds.has(envVar.id) ? t('projectDetail', 'hide') : t('projectDetail', 'reveal')}
                    </button>
                    <button
                      onClick={() => startEdit(envVar.id, envVar.value)}
                      title={t('common', 'edit')}
                      className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await confirm({
                          variant: 'danger',
                          title: 'Delete environment variable',
                          description: t('projectDetail', 'deleteEnvVarConfirm'),
                          confirmText: t('common', 'delete'),
                          cancelText: t('common', 'cancel'),
                        });
                        if (ok) {
                          onDelete(envVar.id);
                        }
                      }}
                      className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
