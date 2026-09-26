'use client';

import { useState } from 'react';
import { Plus, Trash2, X, FolderLock } from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  useOrganization,
  useOrganizationMembers,
  useOrganizationInvitations,
  useRevokeInvitation,
  useUpdateMemberStudioAccess,
} from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import {
  InviteMemberModal,
  RemoveMemberModal,
  ChangeRoleDropdown,
  OrganizationSettingsSection,
  ProjectAccessModal,
} from './components';
import { formatShortDate } from '@/lib/formatters';
import type { OrganizationMember, MemberRole, StudioAccess } from '@/lib/api';
import { Skeleton, SkeletonPageHeader, SkeletonTeamPanel } from '@/components/Skeleton';
import { PageHeader, MetaLabel, RowList } from '@/components/dashboard/PageKit';

export default function TeamPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { data: members = [], isLoading: membersLoading } = useOrganizationMembers();
  const { data: invitations = [], isLoading: invitationsLoading } = useOrganizationInvitations();
  const revokeInvitation = useRevokeInvitation();
  const updateStudioAccess = useUpdateMemberStudioAccess();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [removeMember, setRemoveMember]       = useState<OrganizationMember | null>(null);
  const [accessMember, setAccessMember]       = useState<OrganizationMember | null>(null);
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

  const header = (
    <PageHeader
      title={t('team', 'title')}
      description={t('team', 'description')}
      meta={
        org
          ? [
              <span key="org" className="terminal-text text-xs text-[var(--text-secondary)]">{org.slug}</span>,
              <MetaLabel key="members">
                {members.length} {t('team', 'members').toLowerCase()}
              </MetaLabel>,
              org.role ? (
                <MetaLabel key="role">
                  {t('team', 'role')}: {t('team', org.role as MemberRole)}
                </MetaLabel>
              ) : null,
            ]
          : undefined
      }
      actions={
        isAdminOrOwner ? (
          <button type="button" onClick={() => setInviteModalOpen(true)} className="btn btn-primary justify-center">
            <Plus className="w-4 h-4" />
            {t('team', 'inviteMember')}
          </button>
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <div className="dash-page max-w-5xl min-w-0 space-y-6 animate-slide-in">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <SkeletonPageHeader />
          <Skeleton className="h-10 w-36 rounded-full shrink-0 hidden sm:block" />
        </div>
        <SkeletonTeamPanel />
      </div>
    );
  }

  return (
    <div className="dash-page max-w-5xl min-w-0 space-y-8 pb-10 animate-slide-in">
      {header}

      {/* Members */}
      <RowList
        label={
          <>
            {t('team', 'members')} <span className="opacity-60 tabular-nums">{members.length}</span>
          </>
        }
      >
        {sortedMembers.map((member) => {
          const isCurrentUser = member.user.id === user?.id;
          const canManage = isAdminOrOwner && member.role !== 'owner' && !isCurrentUser;
          const scoped = member.role === 'member' || member.role === 'viewer';

          return (
            <div
              key={member.id}
              className="dash-row flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 hover:bg-[var(--hover-overlay)] transition-colors"
            >
              {/* Identity */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 select-none overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  aria-hidden
                >
                  {member.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.user.avatarUrl} alt="" className="w-8 h-8 object-cover" />
                  ) : (
                    member.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium truncate">{member.user.name}</span>
                    {isCurrentUser && <span className="badge badge-neutral shrink-0">{t('team', 'you')}</span>}
                  </div>
                  <p className="terminal-text text-[11px] text-[var(--text-muted)] truncate">
                    {member.user.email}
                    <span className="hidden sm:inline">
                      {' '}· {t('team', 'joined')} {formatShortDate(member.joinedAt)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pl-11 lg:pl-0">
                {/* Data-browser access (member/viewer only — owner/admin always have write) */}
                {scoped && (
                  <label className="inline-flex items-center">
                    <span className="sr-only">{t('team', 'studioAccessTitle')}</span>
                    <select
                      value={member.studioAccess ?? 'none'}
                      onChange={(e) =>
                        updateStudioAccess.mutate({
                          userId: member.userId,
                          access: e.target.value as StudioAccess,
                        })
                      }
                      disabled={!canManage || updateStudioAccess.isPending}
                      className="select text-[12.5px]"
                      title={t('team', 'studioAccessTitle')}
                      // Inline: the shared .select rule is unlayered and would win over utilities.
                      style={{ minWidth: 118, height: '1.875rem', paddingTop: 0, paddingBottom: 0, paddingLeft: 12, borderRadius: 999, lineHeight: 1 }}
                    >
                      <option value="none">{t('team', 'studioAccessNone')}</option>
                      <option value="read">{t('team', 'studioAccessRead')}</option>
                      <option value="write">{t('team', 'studioAccessWrite')}</option>
                    </select>
                  </label>
                )}

                {/* Project access (member/viewer only — owner/admin always see everything) */}
                {scoped && (
                  <button
                    type="button"
                    onClick={() => canManage && setAccessMember(member)}
                    disabled={!canManage}
                    className="btn btn-secondary btn-sm disabled:cursor-default"
                    title={t('team', 'projectAccessTitle')}
                  >
                    <FolderLock className="w-3.5 h-3.5" />
                    <span className={member.restrictedAccess ? 'text-[var(--status-warning)]' : undefined}>
                      {member.restrictedAccess
                        ? `${member.projectIds.length} ${t('team', 'accessProjectsWord')}`
                        : t('team', 'accessAll')}
                    </span>
                  </button>
                )}

                {/* Role */}
                {canManage ? (
                  <ChangeRoleDropdown memberId={member.user.id} currentRole={member.role} />
                ) : (
                  <span className="badge badge-neutral">{t('team', member.role)}</span>
                )}

                {/* Remove */}
                <span className="w-7 shrink-0 inline-flex justify-center">
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setRemoveMember(member)}
                      className="dash-icon-action hover:text-[var(--status-error)]!"
                      title={t('team', 'removeMember')}
                      aria-label={`${t('team', 'removeMember')}: ${member.user.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </RowList>

      {/* Pending Invitations */}
      {isAdminOrOwner && !invitationsLoading && (
        <RowList
          label={
            <>
              {t('team', 'pendingInvitations')} <span className="opacity-60 tabular-nums">{invitations.length}</span>
            </>
          }
        >
          {invitations.length === 0 ? (
            <div className="dash-row py-6 text-center text-[13px] text-[var(--text-muted)]">
              {t('team', 'noPendingInvitations')}
            </div>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="dash-row flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
              >
                <span className="dash-status-dot is-warning" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{invitation.email}</p>
                  <p className="terminal-text text-[11px] text-[var(--text-muted)] truncate">
                    {t('team', 'invitedBy')} {invitation.invitedBy.name} · {t('team', 'expiresOn')}{' '}
                    {formatShortDate(invitation.expiresAt)}
                  </p>
                </div>
                <span className="badge badge-neutral shrink-0">{t('team', invitation.role as MemberRole)}</span>
                <button
                  type="button"
                  onClick={() => handleRevokeInvitation(invitation.id)}
                  disabled={revokingId === invitation.id}
                  className="dash-icon-action hover:text-[var(--status-error)]! disabled:opacity-50"
                  title={t('team', 'revokeInvitation')}
                  aria-label={`${t('team', 'revokeInvitation')}: ${invitation.email}`}
                >
                  {revokingId === invitation.id ? (
                    <span
                      className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'var(--text-muted) var(--text-muted) var(--text-muted) transparent' }}
                      aria-hidden
                    />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </RowList>
      )}

      {/* Organization Settings */}
      {isAdminOrOwner && <OrganizationSettingsSection id="team-organization" />}

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
      <ProjectAccessModal member={accessMember} onClose={() => setAccessMember(null)} />
    </div>
  );
}
