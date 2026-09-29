import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirm deletion',
  robots: { index: false, follow: false },
};

export default function ConfirmDeletionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
