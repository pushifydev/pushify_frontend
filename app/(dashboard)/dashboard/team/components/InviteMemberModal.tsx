'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Modal, ModalActions } from '@/components/Modal';
import { useTranslation } from '@/hooks';
import { useSendInvitation } from '@/hooks';
import type { SendInvitationInput } from '@/lib/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { t } = useTranslation();
  const sendInvitation = useSendInvitation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<NonNullable<SendInvitationInput['role']>>('member');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) return;

    try {
      await sendInvitation.mutateAsync({ email: email.trim(), role, note: note.trim() || undefined });
      setEmail('');
      setRole('member');
      setNote('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('team', 'inviteMember')}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {t('team', 'emailAddress')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('team', 'emailPlaceholder')}
              className="input w-full pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {t('team', 'role')}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as NonNullable<SendInvitationInput['role']>)}
            className="input w-full"
          >
            <option value="admin">{t('team', 'admin')} - {t('team', 'adminDesc')}</option>
            <option value="member">{t('team', 'member')} - {t('team', 'memberDesc')}</option>
            <option value="viewer">{t('team', 'viewer')} - {t('team', 'viewerDesc')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            {t('team', 'inviteNote')}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('team', 'inviteNotePlaceholder')}
            className="input w-full resize-none"
            rows={2}
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--accent-red)]">{error}</p>
        )}
      </div>

      <ModalActions>
        <button onClick={handleClose} className="btn btn-secondary">
          {t('common', 'cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!email.trim() || sendInvitation.isPending}
          className="btn btn-primary"
        >
          {sendInvitation.isPending ? t('team', 'sendingInvitation') : t('team', 'sendInvitation')}
        </button>
      </ModalActions>
    </Modal>
  );
}
