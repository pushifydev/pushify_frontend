'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield, User, Eye } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useUpdateMemberRole } from '@/hooks';
import type { MemberRole } from '@/lib/api';

interface ChangeRoleDropdownProps {
  memberId: string;
  currentRole: MemberRole;
  disabled?: boolean;
}

const roleIcons = {
  owner: Shield,
  admin: Shield,
  member: User,
  viewer: Eye,
};

export function ChangeRoleDropdown({ memberId, currentRole, disabled }: ChangeRoleDropdownProps) {
  const { t } = useTranslation();
  const updateRole = useUpdateMemberRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = async (newRole: MemberRole) => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

    try {
      await updateRole.mutateAsync({ userId: memberId, input: { role: newRole } });
      setIsOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const roles: { value: MemberRole; label: string; desc: string }[] = [
    { value: 'admin', label: t('team', 'admin'), desc: t('team', 'adminDesc') },
    { value: 'member', label: t('team', 'member'), desc: t('team', 'memberDesc') },
    { value: 'viewer', label: t('team', 'viewer'), desc: t('team', 'viewerDesc') },
  ];

  const CurrentIcon = roleIcons[currentRole];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || updateRole.isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="capitalize">{t('team', currentRole)}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {roles.map((role) => {
            const Icon = roleIcons[role.value];
            return (
              <button
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors ${
                  currentRole === role.value ? 'bg-[var(--bg-tertiary)]' : ''
                }`}
              >
                <Icon className="w-4 h-4 mt-0.5 text-[var(--text-muted)]" />
                <div>
                  <span className="block text-sm font-medium">{role.label}</span>
                  <span className="block text-xs text-[var(--text-muted)] mt-0.5">{role.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
