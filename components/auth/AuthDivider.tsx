'use client';

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white dark:bg-[#0a0a0a] text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
      </div>
    </div>
  );
}
