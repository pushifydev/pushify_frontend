'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useBillingInfo } from '@/hooks';

export default function BillingSuccessPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: billingInfo, refetch } = useBillingInfo();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push('/dashboard/billing');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-slide-in">
      <div
        className="text-center max-w-md mx-auto p-8 rounded-xl"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(34, 197, 94, 0.12)' }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: '#22c55e' }} />
        </div>

        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {t('billing', 'paymentSuccess') || 'Payment Successful!'}
        </h1>

        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {t('billing', 'planUpgraded') || 'Your plan has been upgraded successfully.'}
        </p>

        {billingInfo && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-5"
            style={{
              background: 'var(--hover-overlay-lg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Current plan:</span>
            <span
              className="text-sm font-bold uppercase"
              style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}
            >
              {billingInfo.planName}
            </span>
          </div>
        )}

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Redirecting to billing in {countdown}s...
        </p>

        <button
          onClick={() => router.push('/dashboard/billing')}
          className="mt-4 text-sm font-medium transition-colors"
          style={{ color: 'var(--accent-cyan)' }}
        >
          Go to Billing →
        </button>
      </div>
    </div>
  );
}
