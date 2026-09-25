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
        <p className="dash-section-label mb-2.5" id="cancel-reason-label">{t('billing', 'cancelReasonLabel')}</p>
        <div className="space-y-1.5 mb-4" role="radiogroup" aria-labelledby="cancel-reason-label">
          {REASONS.map((r) => (
            <label
              key={r}
              className={`dash-option text-sm ${
                reason === r ? 'is-active text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
              }`}
              style={{ alignItems: 'center', padding: '0.625rem 0.875rem' }}
            >
              <input
                type="radio"
                name="cancel-reason"
                checked={reason === r}
                onChange={() => setReason(r)}
                className="shrink-0"
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
          className="input mb-1 resize-none"
        />

        <ModalActions>
          <button
            type="button"
            onClick={onClose}
            disabled={cancelSubscription.isPending}
            className="btn btn-secondary"
          >
            {t('billing', 'cancelKeep')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!reason || cancelSubscription.isPending}
            className="btn btn-danger"
          >
            {cancelSubscription.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('billing', 'cancelConfirm')}
          </button>
        </ModalActions>
    </Modal>
  );
}
