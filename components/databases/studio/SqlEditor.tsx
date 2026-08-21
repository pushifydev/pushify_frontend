'use client';

import { useEffect, useMemo, useRef } from 'react';
import CodeMirror, { EditorView, type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { MySQL, PostgreSQL, sql } from '@codemirror/lang-sql';
import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import type { StudioEngine, StudioSchemaTable } from '@/lib/api';

export interface SqlEditorHandle {
  /** the selected text, or the whole document when nothing is selected; null before mount */
  getActiveText: () => string | null;
  insertAtCursor: (text: string) => void;
}

interface SqlEditorProps {
  value: string;
  engine: StudioEngine;
  tables: StudioSchemaTable[];
  onChange: (value: string) => void;
  /** Cmd/Ctrl+Enter */
  onRun: () => void;
  editorRef?: React.MutableRefObject<SqlEditorHandle | null>;
}

/**
 * The editor paints itself from the dashboard's CSS variables, so it follows the app's light
 * and dark themes without a second theme definition.
 */
const themeExtension = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    fontSize: '13px',
  },
  '.cm-content': {
    fontFamily: 'var(--font-jetbrains-mono), monospace',
    padding: '12px 0',
    caretColor: 'var(--accent-cyan)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    border: 'none',
    fontFamily: 'var(--font-jetbrains-mono), monospace',
  },
  '.cm-activeLine': { backgroundColor: 'var(--hover-overlay)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--text-secondary)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--dash-accent-bg-md)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-cursor': { borderLeftColor: 'var(--accent-cyan)' },
  '.cm-tooltip': {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--dash-accent-bg-md)',
    color: 'var(--text-primary)',
  },
  '.cm-panels': { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' },
});

export function SqlEditor({
  value,
  engine,
  tables,
  onChange,
  onRun,
  editorRef,
}: SqlEditorProps) {
  const viewRef = useRef<ReactCodeMirrorRef>(null);

  // `schema` feeds completion: bare table names, qualified names, and their columns.
  const schema = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const table of tables) {
      const columns = table.columns.map((column) => column.name);
      map[table.name] = columns;
      map[`${table.schema}.${table.name}`] = columns;
    }
    return map;
  }, [tables]);

  const extensions = useMemo(
    () => [
      sql({
        dialect: engine === 'mysql' ? MySQL : PostgreSQL,
        schema,
        upperCaseKeywords: true,
      }),
      themeExtension,
      EditorView.lineWrapping,
      // Precedence.highest so Cmd+Enter beats CodeMirror's own newline binding.
      Prec.highest(
        keymap.of([
          {
            key: 'Mod-Enter',
            preventDefault: true,
            run: () => {
              onRun();
              return true;
            },
          },
        ])
      ),
    ],
    [engine, schema, onRun]
  );

  // Published as an imperative handle so the console can run the selection and insert names.
  useEffect(() => {
    if (!editorRef) return;

    editorRef.current = {
      getActiveText: () => {
        const view = viewRef.current?.view;
        if (!view) return null;
        const { from, to } = view.state.selection.main;
        return from === to ? view.state.doc.toString() : view.state.sliceDoc(from, to);
      },
      insertAtCursor: (text: string) => {
        const view = viewRef.current?.view;
        if (!view) return;
        const { from, to } = view.state.selection.main;
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
        view.focus();
      },
    };

    return () => {
      editorRef.current = null;
    };
  }, [editorRef]);

  return (
    <CodeMirror
      ref={viewRef}
      value={value}
      onChange={onChange}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        autocompletion: true,
        bracketMatching: true,
        closeBrackets: true,
        highlightSelectionMatches: true,
      }}
      style={{ minHeight: 200, maxHeight: 420, overflow: 'auto' }}
    />
  );
}

export default SqlEditor;
