'use client';

import { usePathname, useRouter } from 'next/navigation';

const domains = [
  { label: 'Data Structures & Algorithms', value: '/docs/data-structures' },
  { label: 'Machine Learning', value: '/docs/machine-learning' },
  { label: 'Deep Learning', value: '/docs/deep-learning' },
  { label: 'Cryptography', value: '/docs/cryptography' },
];

export function DomainSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const active = domains.find((domain) => pathname.startsWith(domain.value));

  if (!active) return null;

  return (
    <label className="mb-6 inline-flex items-center gap-3 rounded-lg border border-brand-indigo/20 bg-brand-indigo/5 px-3 py-2 text-sm text-brand-indigo dark:bg-brand-indigo/10 dark:text-brand-blue">
      <span className="size-2 rounded-full bg-brand-violet shadow-glow-current" aria-hidden="true" />
      <span className="font-medium">Subject</span>
      <select
        value={active.value}
        onChange={(event) => router.push(event.target.value)}
        className="max-w-64 bg-transparent font-semibold text-fd-foreground outline-none"
        aria-label="Switch documentation subject"
      >
        {domains.map((domain) => (
          <option key={domain.value} value={domain.value} className="bg-fd-background text-fd-foreground">
            {domain.label}
          </option>
        ))}
      </select>
    </label>
  );
}
