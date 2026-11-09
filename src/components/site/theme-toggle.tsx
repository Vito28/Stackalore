'use client';

import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'fumadocs-ui/provider/base';
import { cn } from '@/lib/cn';

type Theme = 'light' | 'dark';

/**
 * Light/dark switch with a smooth transition:
 * - browsers with the View Transitions API get a circular reveal that grows
 *   from the button,
 * - other browsers get a short color cross-fade,
 * - users who prefer reduced motion get an instant switch.
 *
 * The icons are driven purely by the `.dark` class, so there is no hydration
 * mismatch before `next-themes` knows the resolved theme.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const current: Theme = root.classList.contains('dark') ? 'dark' : 'light';
    const next: Theme = current === 'dark' ? 'light' : 'dark';

    const apply = () => {
      root.classList.remove('light', 'dark');
      root.classList.add(next);
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      apply();
      return;
    }

    if (typeof document.startViewTransition !== 'function') {
      root.classList.add('theme-fade');
      apply();
      window.setTimeout(() => root.classList.remove('theme-fade'), 400);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    root.dataset.themeTransition = '';
    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 520,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      })
      .catch(() => undefined);
    const cleanup = () => {
      delete root.dataset.themeTransition;
    };
    transition.finished.then(cleanup, cleanup);
  }

  const label =
    resolvedTheme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex h-8 w-[3.75rem] shrink-0 items-center rounded-full border bg-fd-muted p-0.5 outline-none transition-colors hover:border-fd-foreground/20 focus-visible:ring-2 focus-visible:ring-fd-ring',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute top-0.5 left-0.5 size-[1.625rem] rounded-full border bg-fd-background shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] dark:translate-x-[1.75rem]"
      />
      <span className="relative grid flex-1 place-items-center">
        <Sun className="size-3.5 text-fd-foreground transition-colors dark:text-fd-muted-foreground" />
      </span>
      <span className="relative grid flex-1 place-items-center">
        <Moon className="size-3.5 text-fd-muted-foreground transition-colors dark:text-fd-foreground" />
      </span>
    </button>
  );
}
