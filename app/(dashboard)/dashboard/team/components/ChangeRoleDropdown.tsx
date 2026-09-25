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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || updateRole.isPending}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 h-8 px-3 rounded-full bg-[var(--bg-secondary)] hover:border-[var(--border-default)] border border-[var(--border-subtle)] text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="capitalize">{t('team', currentRole)}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      {isOpen && (
        <div className="dash-menu absolute right-0 mt-2 w-64 z-50" role="menu">
          {roles.map((role) => {
            const Icon = roleIcons[role.value];
            return (
              <button
                key={role.value}
                type="button"
                role="menuitemradio"
                aria-checked={currentRole === role.value}
                onClick={() => handleRoleChange(role.value)}
                className={`dash-menu-item${currentRole === role.value ? ' is-active' : ''}`}
                style={{ alignItems: 'flex-start', padding: '0.625rem 0.75rem' }}
              >
                <Icon className="w-4 h-4 mt-0.5 text-[var(--text-muted)]" />
                <div>
                  <span className="block text-sm font-medium text-[var(--text-primary)]">{role.label}</span>
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
