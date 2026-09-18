'use client';

import { useState } from 'react';
import { Mail, Send, Shield, User, Eye, AlertCircle } from 'lucide-react';
import { Modal, ModalActions, AlertBox } from '@/components/Modal';
import { useTranslation } from '@/hooks';
import { useSendInvitation } from '@/hooks';
import { ROLE_COLORS } from '@/lib/constants';
import type { SendInvitationInput } from '@/lib/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InviteRole = NonNullable<SendInvitationInput['role']>;

const ROLES: { value: InviteRole; icon: typeof Shield; label: 'admin' | 'member' | 'viewer'; desc: 'adminDesc' | 'memberDesc' | 'viewerDesc' }[] = [
  { value: 'admin',  icon: Shield, label: 'admin',  desc: 'adminDesc' },
  { value: 'member', icon: User,   label: 'member', desc: 'memberDesc' },
  { value: 'viewer', icon: Eye,    label: 'viewer', desc: 'viewerDesc' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { t } = useTranslation();
  const sendInvitation = useSendInvitation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('member');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const canSubmit = EMAIL_RE.test(email.trim()) && !sendInvitation.isPending;

  const reset = () => {
    setEmail('');
    setRole('member');
    setNote('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    try {
      await sendInvitation.mutateAsync({ email: email.trim(), role, note: note.trim() || undefined });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('team', 'inviteMember')}
      description={t('team', 'inviteDescription')}
    >
      <form
        className="space-y-5"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        {/* Email */}
        <div>
          <label htmlFor="invite-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {t('team', 'emailAddress')}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              id="invite-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('team', 'emailPlaceholder')}
              className="input pl-10!"
            />
          </div>
        </div>

        {/* Role — one card per role, so the description is read before the choice is made */}
        <div>
          <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {t('team', 'role')}
          </p>
          <div role="radiogroup" aria-label={t('team', 'role')} className="space-y-1.5">
            {ROLES.map(({ value, icon: Icon, label, desc }) => {
              const selected = role === value;
              const accent = ROLE_COLORS[value];
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRole(value)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                  style={{
                    background: selected ? 'var(--dash-accent-bg)' : 'var(--bg-secondary)',
                    border: `1px solid ${selected ? 'var(--dash-accent-border-strong)' : 'var(--border-subtle)'}`,
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{t('team', label)}</span>
                    <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t('team', desc)}
                    </span>
                  </span>
                  <span
                    className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{ border: `1.5px solid ${selected ? 'var(--accent-cyan)' : 'var(--border-default)'}` }}
                    aria-hidden
                  >
                    {selected && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-cyan)' }} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <label htmlFor="invite-note" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {t('team', 'inviteNote')}
          </label>
          <textarea
            id="invite-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('team', 'inviteNotePlaceholder')}
            className="input resize-none"
            rows={2}
            maxLength={500}
          />
        </div>

        {error && (
          <AlertBox variant="error" icon={<AlertCircle className="w-4 h-4" />}>
            {error}
          </AlertBox>
        )}

        <ModalActions>
          <button type="button" onClick={handleClose} className="btn btn-secondary">
            {t('common', 'cancel')}
          </button>
          <button type="submit" disabled={!canSubmit} className="btn btn-primary">
            <Send className="w-4 h-4" />
            {sendInvitation.isPending ? t('team', 'sendingInvitation') : t('team', 'sendInvitation')}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
