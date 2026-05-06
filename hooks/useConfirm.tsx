'use client';

import { create } from 'zustand';
import { ReactNode } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type Variant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmOptions {
  title: string;
  description?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolver: ((value: boolean) => void) | null;
  loading: boolean;
  open: (options: ConfirmOptions) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  resolve: (value: boolean) => void;
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: null,
  resolver: null,
  loading: false,
  open: (options) =>
    new Promise<boolean>((resolve) => {
      set({ isOpen: true, options, resolver: resolve, loading: false });
    }),
  setLoading: (loading) => set({ loading }),
  resolve: (value) => {
    const { resolver } = get();
    if (resolver) resolver(value);
    set({ isOpen: false, resolver: null, loading: false });
  },
}));

/**
 * Promise-based confirmation dialog hook.
 *
 * @example
 * const confirm = useConfirm();
 * if (await confirm({ title: 'Delete project?', variant: 'danger' })) {
 *   await deleteProject();
 * }
 */
export function useConfirm() {
  return useConfirmStore((s) => s.open);
}

/**
 * Mount once at the app root (e.g. providers.tsx).
 * Renders the dialog managed by useConfirm.
 */
export function ConfirmProvider() {
  const { isOpen, options, resolve, loading } = useConfirmStore();

  if (!options) return null;

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && resolve(false)}
      variant={options.variant || 'danger'}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      loading={loading}
      onConfirm={() => resolve(true)}
    />
  );
}
