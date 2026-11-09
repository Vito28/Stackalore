import Link from 'next/link';
import { cn } from '@/lib/cn';
import { appName } from '@/lib/shared';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md text-[0.95rem] font-semibold tracking-tight text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
        className,
      )}
    >
      <LogoMark />
      {appName}
    </Link>
  );
}

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-lg bg-fd-foreground text-fd-background"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none">
        <path d="M5 8.5 12 5l7 3.5-7 3.5-7-3.5Z" fill="currentColor" />
        <path
          d="m5 12.25 7 3.5 7-3.5M5 16l7 3.5 7-3.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
