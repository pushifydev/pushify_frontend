'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal, ModalActions } from '@/components/Modal';
import { useTranslation, useCancelSubscription } from '@/hooks';
import { sendCancellationFeedback, type CancellationReason } from '@/lib/api';
import { toast } from 'sonner';

const REASONS: CancellationReason[] = [
  'too_expensive',
  'missing_features',
  'bugs',
  'switched',
  'project_ended',
  'other',
];

export function CancelSubscriptionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const cancelSubscription = useCancelSubscription();

  const reasonLabel = (r: CancellationReason): string => {
    switch (r) {
      case 'too_expensive':
        return t('billing', 'cancelReasonTooExpensive');
      case 'missing_features':
        return t('billing', 'cancelReasonMissingFeatures');
      case 'bugs':
        return t('billing', 'cancelReasonBugs');
      case 'switched':
        return t('billing', 'cancelReasonSwitched');
      case 'project_ended':
        return t('billing', 'cancelReasonProjectEnded');
      case 'other':
        return t('billing', 'cancelReasonOther');
    }
  };
  const [reason, setReason] = useState<CancellationReason | null>(null);
  const [comment, setComment] = useState('');

  const handleCancel = async () => {
    if (!reason) return;
    // Survey is best-effort — a feedback hiccup must never block the cancel
    await sendCancellationFeedback({ reason, comment: comment.trim() || undefined }).catch(
      () => undefined
    );
    await cancelSubscription.mutateAsync();
    toast.success(t('billing', 'cancelDoneTitle'), {
      description: t('billing', 'cancelDoneDesc'),
    });
    setReason(null);
    setComment('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !cancelSubscription.isPending && onClose()}
      title={t('billing', 'cancelTitle')}
      description={t('billing', 'cancelDesc')}
    >
        <p className="text-sm font-medium mb-2.5">{t('billing', 'cancelReasonLabel')}</p>
        <div className="space-y-1.5 mb-4">
          {REASONS.map((r) => (
            <label
              key={r}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                reason === r
                  ? 'border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50'
              }`}
            >
              <input
                type="radio"
                name="cancel-reason"
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-[var(--accent-cyan)]"
              />
              {reasonLabel(r)}
            </label>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('billing', 'cancelCommentPh')}
          rows={2}
          maxLength={1000}
          className="w-full p-3 mb-5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--accent-cyan)] resize-none"
        />

        <ModalActions>
          <button
            onClick={onClose}
            disabled={cancelSubscription.isPending}
            className="btn btn-secondary"
          >
            {t('billing', 'cancelKeep')}
          </button>
          <button
            onClick={handleCancel}
            disabled={!reason || cancelSubscription.isPending}
            className="btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
          >
            {cancelSubscription.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('billing', 'cancelConfirm')}
          </button>
        </ModalActions>
    </Modal>
  );
}
