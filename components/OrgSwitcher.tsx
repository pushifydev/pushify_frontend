'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useOrganization, useMyOrganizations, useSwitchOrganization } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'sonner';

/**
 * Workspace switcher shown in the sidebar footer. Lists every organization the user belongs
 * to and switches the active one (re-issuing scoped tokens). Falls back to a plain label when
 * the user only belongs to a single workspace.
 */
export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: currentOrg } = useOrganization();
  const storeOrg = useAuthStore((s) => s.organization);
  const { data: orgs = [] } = useMyOrganizations();
  const switchOrg = useSwitchOrganization();

  const currentId = currentOrg?.id ?? storeOrg?.id;
  const currentName = currentOrg?.name ?? storeOrg?.name ?? 'Personal';

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSwitch = async (id: string) => {
    if (id === currentId) {
      setOpen(false);
      return;
    }
    try {
      await switchOrg.mutateAsync(id);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to switch workspace');
    }
  };

  // Nothing to switch between — just show the name.
  if (orgs.length <= 1) {
    return <p className="text-[10px] truncate text-[var(--text-muted)]">{currentName}</p>;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1 max-w-full text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <span className="truncate">{currentName}</span>
        {switchOrg.isPending ? (
          <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
        ) : (
          <ChevronsUpDown className="w-3 h-3 shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 max-h-72 overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-lg p-1 z-50">
          {orgs.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSwitch(o.id);
              }}
              disabled={switchOrg.isPending}
              className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left hover:bg-[var(--hover-overlay-md)] disabled:opacity-60"
            >
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-[var(--text-primary)]">{o.name}</span>
                <span className="block truncate text-[10px] capitalize text-[var(--text-muted)]">{o.role}</span>
              </span>
              {o.id === currentId && <Check className="w-3.5 h-3.5 shrink-0 text-[var(--accent-cyan)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
