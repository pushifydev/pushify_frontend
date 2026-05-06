import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Pushify refund policy. Our approach to refunds and cancellations.',
  alternates: {
    canonical: '/refund',
  },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
