'use client';

import { useState } from 'react';
import { Users, Plus, Trash2, Shield, User, Eye, Crown, Mail, X, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useOrganization, useOrganizationMembers, useOrganizationInvitations, useRevokeInvitation } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import {
  InviteMemberModal,
  RemoveMemberModal,
  ChangeRoleDropdown,
  OrganizationSettingsSection,
} from './components';
import { formatShortDate } from '@/lib/formatters';
import { ROLE_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { OrganizationMember, MemberRole } from '@/lib/api';

const roleIcons: Record<MemberRole, typeof Shield> = {
  owner:  Crown,
  admin:  Shield,
  member: User,
  viewer: Eye,
};

export default function TeamPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { data: members = [], isLoading: membersLoading } = useOrganizationMembers();
  const { data: invitations = [], isLoading: invitationsLoading } = useOrganizationInvitations();
  const revokeInvitation = useRevokeInvitation();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [removeMember, setRemoveMember]       = useState<OrganizationMember | null>(null);
  const [revokingId, setRevokingId]           = useState<string | null>(null);

  const isLoading       = orgLoading || membersLoading;
  const isAdminOrOwner  = org?.role === 'owner' || org?.role === 'admin';

  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'owner') return -1;
    if (b.role === 'owner') return 1;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  const handleRevokeInvitation = async (invitationId: string) => {
    setRevokingId(invitationId);
    try {
      await revokeInvitation.mutateAsync(invitationId);
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-7 w-32 rounded-lg animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
        <div className="h-64 rounded-xl animate-pulse"   style={{ background: 'var(--bg-secondary)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('team', 'title')}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {t('team', 'description')}
          </p>
        </div>
        {isAdminOrOwner && (
          <button onClick={() => setInviteModalOpen(true)} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            {t('team', 'inviteMember')}
          </button>
        )}
      </div>

      {/* Members */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
      >
        {/* Section header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.1)' }}
            >
              <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <span className="text-sm font-medium">{t('team', 'members')}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--glass-border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {members.length}
            </span>
          </div>
        </div>

        {/* Member rows */}
        <div>
          {sortedMembers.map((member, idx) => {
            const RoleIcon     = roleIcons[member.role];
            const accent       = ROLE_COLORS[member.role];
            const isCurrentUser = member.user.id === user?.id;
            const canManage    = isAdminOrOwner && member.role !== 'owner' && !isCurrentUser;

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{
                  borderTop: idx === 0 ? 'none' : '1px solid var(--glass-divider)',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
                  style={{ background: `linear-gradient(135deg, ${accent}44, ${accent}22)`, color: accent, border: `1px solid ${accent}33` }}
                >
                  {member.user.avatarUrl ? (
                    <img src={member.user.avatarUrl} alt={member.user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    member.user.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{member.user.name}</span>
                    {isCurrentUser && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)' }}
                      >
                        {t('team', 'you')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {member.user.email}
                  </p>
                </div>

                {/* Joined date */}
                <div className="hidden sm:block text-right shrink-0">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('team', 'joined')} {formatShortDate(member.joinedAt)}
                  </p>
                </div>

                {/* Role */}
                <div className="shrink-0">
                  {canManage ? (
                    <ChangeRoleDropdown memberId={member.user.id} currentRole={member.role} />
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: `${accent}15`, color: accent }}
                    >
                      <RoleIcon className="w-3 h-3" />
                      {t('team', member.role)}
                    </span>
                  )}
                </div>

                {/* Remove */}
                <div className="w-7 shrink-0">
                  {canManage && (
                    <button
                      onClick={() => setRemoveMember(member)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title={t('team', 'removeMember')}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = STATUS_COLORS.pink;
                        (e.currentTarget as HTMLElement).style.background = `${STATUS_COLORS.pink}1a`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {isAdminOrOwner && !invitationsLoading && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <div
            className="flex items-center gap-2.5 px-5 py-3.5"
            style={{ borderBottom: '1px solid var(--glass-border)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${STATUS_COLORS.warning}1a` }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: STATUS_COLORS.warning }} />
            </div>
            <span className="text-sm font-medium">{t('team', 'pendingInvitations')}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--glass-border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {invitations.length}
            </span>
          </div>

          {invitations.length === 0 ? (
            <div className="py-10 text-center">
              <Mail className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('team', 'noPendingInvitations')}</p>
            </div>
          ) : (
            <div>
              {invitations.map((invitation, idx) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                  style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--glass-divider)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  {/* Email avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `${STATUS_COLORS.warning}1a`, border: `1px solid ${STATUS_COLORS.warning}33` }}
                  >
                    <Mail className="w-3.5 h-3.5" style={{ color: STATUS_COLORS.warning }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{invitation.email}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {t('team', 'invitedBy')} {invitation.invitedBy.name} · {t('team', 'expiresOn')} {formatShortDate(invitation.expiresAt)}
                    </p>
                  </div>

                  {/* Role badge */}
                  <span
                    className="text-xs px-2 py-1 rounded-full shrink-0"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    {t('team', invitation.role as MemberRole)}
                  </span>

                  {/* Revoke */}
                  <button
                    onClick={() => handleRevokeInvitation(invitation.id)}
                    disabled={revokingId === invitation.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    title={t('team', 'revokeInvitation')}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = STATUS_COLORS.pink;
                      (e.currentTarget as HTMLElement).style.background = `${STATUS_COLORS.pink}1a`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    {revokingId === invitation.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--text-muted) var(--text-muted) var(--text-muted) transparent' }} />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Organization Settings */}
      {isAdminOrOwner && <OrganizationSettingsSection />}

      {/* Modals */}
      <InviteMemberModal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
      {removeMember && (
        <RemoveMemberModal
          isOpen={true}
          onClose={() => setRemoveMember(null)}
          memberName={removeMember.user.name}
          memberId={removeMember.user.id}
        />
      )}
    </div>
  );
}
