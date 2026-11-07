import type { HTMLAttributes, ReactNode } from 'react';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CodePanelProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
  caption?: ReactNode;
}

export function CodePanel({
  caption,
  className,
  code,
  filename,
  language = 'text',
  ...props
}: CodePanelProps) {
  return (
    <figure className={cn('my-8', className)}>
      <div
        className="relative overflow-hidden border border-cyan-400/30 bg-[#030a12]/88 shadow-[0_24px_80px_-48px_rgb(6_182_212/0.45)] backdrop-blur-xl"
        {...props}
      >
        <div className="flex h-11 items-center justify-between border-b border-cyan-400/18 bg-cyan-400/[0.025] px-4 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-cyan-200/65">
          <span className="flex items-center gap-2">
            <Terminal className="size-3.5" aria-hidden="true" />
            {filename ?? 'Code output'}
          </span>
          <span>{language}</span>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 top-11 h-px bg-gradient-to-r from-cyan-400/80 via-cyan-400/20 to-transparent"
          aria-hidden="true"
        />
        <pre className="tech-code-scroll max-h-[34rem] overflow-auto p-5 font-mono text-[0.8125rem] leading-7 text-emerald-300 sm:p-6 sm:text-sm">
          <code>{code.trim()}</code>
        </pre>
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm leading-6 text-fd-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
