'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  showArrow?: boolean;
  children: React.ReactNode;
}

export function AuthSubmitButton({
  isLoading = false,
  showArrow = true,
  disabled,
  children,
  className,
  type = 'submit',
  ...props
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'lp-cta w-full h-12 text-base group relative overflow-hidden text-[var(--lp-btn-fg)]',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2',
          isLoading && 'opacity-0'
        )}
      >
        {children}
        {showArrow && !isLoading && (
          <ArrowRight className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--lp-btn-fg)', borderTopColor: 'transparent' }}
          />
        </div>
      )}
    </button>
  );
}
