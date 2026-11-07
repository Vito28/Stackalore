'use client';

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  ExternalLink,
  GitFork,
  Menu,
  Play,
  RotateCcw,
  Share2,
  TerminalSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const sourceCode = `export function binarySearch(values: readonly number[], target: number) {
  let low = 0;
  let high = values.length - 1;

  while (low <= high) {
    const midpoint = low + Math.floor((high - low) / 2);
    const candidate = values[midpoint];

    if (candidate === target) return midpoint;
    if (candidate < target) low = midpoint + 1;
    else high = midpoint - 1;
  }

  return -1;
}

const values = [3, 8, 13, 21, 34, 55, 89, 144];
console.log(binarySearch(values, 89));`;

const sourceLines = sourceCode.split('\n');
const executionLines = [18, 1, 2, 5, 6, 8, 9, 5, 6, 8, 9, 18] as const;

const navItems = ['Learn', 'Paths', 'Topics', 'Community'];

export function MaterialReview() {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (resetRef.current) window.clearTimeout(resetRef.current);
    };
  }, []);

  async function copyCode() {
    await navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    resetRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  function runTrace() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (resetRef.current) window.clearTimeout(resetRef.current);

    setIsRunning(true);
    setShowOutput(false);
    let cursor = 0;
    setActiveLine(executionLines[cursor]);

    intervalRef.current = window.setInterval(() => {
      cursor += 1;
      if (cursor >= executionLines.length) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        setActiveLine(null);
        setIsRunning(false);
        setShowOutput(true);
        return;
      }
      setActiveLine(executionLines[cursor]);
    }, 170);
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#03070d] text-slate-100 selection:bg-cyan-400/25">
      <NetworkBackdrop />

      <header className="sticky top-0 z-50 border-b border-cyan-400/20 bg-[#03070d]/86 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center px-5 sm:px-8 lg:h-[86px] lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-3 font-mono uppercase tracking-[0.2em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span className="relative grid size-10 place-items-center border border-cyan-400/55 bg-cyan-400/8 text-cyan-300 shadow-[0_0_24px_-9px_rgb(34_211_238/0.9)]">
              <span className="text-base font-black">S</span>
              <span className="absolute -top-px -left-px size-2 border-t border-l border-cyan-200" />
              <span className="absolute -right-px -bottom-px size-2 border-r border-b border-cyan-200" />
            </span>
            <span className="text-sm font-bold text-cyan-100 sm:text-base">Stacklore</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map((item, index) => (
              <Link
                key={item}
                href="#"
                className="flex h-10 items-center gap-1.5 px-4 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                {item}
                {index < 3 && <ChevronDown className="size-3 opacity-60" aria-hidden="true" />}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-5">
            <Link
              href="/docs"
              className="hidden h-10 items-center border border-cyan-400/45 bg-cyan-300 px-5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_25px_-8px_rgb(34_211_238/0.75)] transition-colors hover:bg-cyan-200 sm:flex"
            >
              Open docs
            </Link>
            <button
              type="button"
              className="grid size-10 place-items-center border border-cyan-400/25 text-slate-300 transition-colors hover:border-cyan-300/60 hover:text-cyan-200 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1000px] px-5 pb-28 pt-14 sm:px-8 lg:pt-20">
        <article>
          <header className="border-b border-cyan-400/25 pb-9">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              All materials
            </Link>

            <p className="mt-10 font-mono text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
              {'// Data Structures'}
            </p>
            <h1 className="mt-5 max-w-[920px] text-[clamp(2.45rem,6.5vw,4.65rem)] font-semibold leading-[1.04] tracking-[-0.052em] text-balance text-slate-50">
              Binary search, explained through every decision
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-red-400">
              <span>Oct 20, 2026</span>
              <span className="text-red-500/50">·</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" /> 8 min read</span>
              <span className="text-red-500/50">·</span>
              <span>By Stacklore</span>
            </div>

            <a
              href="#editor"
              className="mt-8 inline-flex max-w-full items-center gap-2 border border-red-500/35 bg-red-500/10 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:border-red-400/60 hover:bg-red-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <span>Learning goal: <strong className="text-red-400">trace every boundary update</strong></span>
              <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
            </a>
          </header>

          <div className="flex flex-wrap items-center gap-2 border-b border-cyan-400/20 py-6">
            <span className="mr-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Share
            </span>
            <ShareButton icon={<Copy />} label="Copy link" />
            <ShareButton icon={<Share2 />} label="Share" />
            <ShareButton icon={<GitFork />} label="GitHub" />
          </div>

          <ArticleSection title="Abstract">
            <p>
              Binary search is fast because it discards half of the remaining search space after every comparison. The idea is simple; keeping the boundaries correct is the part that deserves careful attention.
            </p>
            <p>
              This material follows one search from its initial range to the final answer. You will see why the loop terminates, how the midpoint is selected, and where off-by-one errors usually enter an implementation.
            </p>
          </ArticleSection>

          <ArticleSection title="Start with a sorted search space">
            <p>
              We are looking for <InlineCode>89</InlineCode> inside a sorted collection. Two pointers—<InlineCode>low</InlineCode> and <InlineCode>high</InlineCode>—describe the portion that can still contain the target. Everything outside those bounds has already been ruled out.
            </p>

            <div className="my-8 grid grid-cols-4 gap-px border border-cyan-400/20 bg-cyan-400/20 sm:grid-cols-8">
              {[3, 8, 13, 21, 34, 55, 89, 144].map((value, index) => (
                <div
                  key={value}
                  className={cn(
                    'relative grid min-h-20 place-items-center bg-[#050b13]/95 font-mono text-sm text-slate-400',
                    value === 89 && 'bg-cyan-400/10 text-cyan-200 shadow-[inset_0_0_28px_rgb(34_211_238/0.08)]',
                  )}
                >
                  <span>{value}</span>
                  <span className="absolute bottom-1.5 text-[0.58rem] text-slate-600">{index}</span>
                </div>
              ))}
            </div>
          </ArticleSection>

          <ArticleSection id="editor" title="Reader box: trace it in one function">
            <p>
              Run the function and watch the active line move through the search. The input stays unchanged; only the two boundary pointers move toward the target.
            </p>

            <div className="my-9 overflow-hidden border border-cyan-400/35 bg-[#020811]/95 shadow-[0_28px_90px_-50px_rgb(34_211_238/0.45)]">
              <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-cyan-400/20 bg-cyan-400/[0.025] px-3 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-400">
                  <TerminalSquare className="size-4 shrink-0 text-cyan-300" aria-hidden="true" />
                  <span className="truncate text-cyan-100">binary-search.ts</span>
                  <span className="hidden text-slate-600 sm:inline">TypeScript</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex h-8 items-center gap-1.5 border border-slate-700/80 px-2.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-slate-400 transition-colors hover:border-cyan-400/45 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={runTrace}
                    disabled={isRunning}
                    className="inline-flex h-8 items-center gap-1.5 border border-cyan-400/45 bg-cyan-400/10 px-2.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-cyan-200 transition-colors hover:bg-cyan-400/15 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    {showOutput && !isRunning ? <RotateCcw className="size-3.5" /> : <Play className="size-3.5" />}
                    <span>{isRunning ? 'Tracing' : showOutput ? 'Run again' : 'Run trace'}</span>
                  </button>
                </div>
              </div>

              <div className="tech-code-scroll overflow-x-auto py-4 [scrollbar-color:rgb(71_85_105)_rgb(2_8_17)]">
                <pre className="min-w-[760px] font-mono text-[0.78rem] leading-7 sm:text-[0.84rem]">
                  <code>
                    {sourceLines.map((line, index) => {
                      const lineNumber = index + 1;
                      return (
                        <span
                          key={`${lineNumber}-${line}`}
                          className={cn(
                            'flex border-l-2 border-transparent pr-6 transition-colors duration-100',
                            activeLine === lineNumber && 'border-cyan-300 bg-cyan-400/10',
                          )}
                        >
                          <span className="w-12 shrink-0 select-none pr-4 text-right text-slate-700">{lineNumber}</span>
                          <span className="whitespace-pre text-emerald-300">{line || ' '}</span>
                        </span>
                      );
                    })}
                  </code>
                </pre>
              </div>

              <div
                className={cn(
                  'grid border-t border-cyan-400/20 bg-black/25 transition-[grid-template-rows] duration-300',
                  showOutput ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
                aria-live="polite"
              >
                <div className="overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 font-mono text-xs">
                    <span className="text-slate-500">OUTPUT</span>
                    <span className="text-emerald-300">6</span>
                    <span className="text-slate-600">target found after 3 comparisons</span>
                  </div>
                </div>
              </div>
            </div>

            <p>
              <strong className="text-slate-100">What a correct trace looks like.</strong>{' '}
              When the candidate is smaller than the target, <InlineCode>low = midpoint + 1</InlineCode> removes the candidate and every smaller value from the next search.
            </p>
          </ArticleSection>

          <aside className="mt-14 border-l border-amber-400 bg-amber-400/[0.055] px-5 py-5 text-sm leading-7 text-slate-300 sm:px-6">
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-amber-300">Remember</p>
            <p className="mt-2">Binary search only works when the collection is sorted. Without that guarantee, discarding half of the values is not safe.</p>
          </aside>
        </article>
      </main>

      <footer className="relative z-10 border-t border-cyan-400/20 bg-[#02060b]/85">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-2 px-5 py-7 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>Stacklore material preview</span>
          <span>Built for focused reading</span>
        </div>
      </footer>
    </div>
  );
}

function ShareButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 border border-cyan-400/25 px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-slate-400 transition-colors hover:border-cyan-300/55 hover:bg-cyan-400/5 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 [&_svg]:size-3.5"
    >
      {icon}
      {label}
    </button>
  );
}

function ArticleSection({
  children,
  id,
  title,
}: {
  children: React.ReactNode;
  id?: string;
  title: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 pt-12 sm:pt-14">
      <div className="relative pl-5">
        <span className="absolute inset-y-0 left-0 w-px bg-red-500 shadow-[0_0_14px_rgb(239_68_68/0.75)]" aria-hidden="true" />
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-slate-50 sm:text-[1.75rem]">{title}</h2>
      </div>
      <div className="mt-6 space-y-5 text-base leading-8 text-slate-300 sm:text-[1.08rem] sm:leading-8">{children}</div>
    </section>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="border border-emerald-400/20 bg-emerald-400/[0.06] px-1.5 py-0.5 font-mono text-[0.88em] text-emerald-300">
      {children}
    </code>
  );
}

function NetworkBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(34_211_238/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(34_211_238/0.045)_1px,transparent_1px)] bg-[size:58px_58px] [mask-image:linear-gradient(to_bottom,black,transparent_96%)]" />
      <svg className="absolute -left-20 top-20 h-[900px] w-[520px] opacity-45" viewBox="0 0 520 900" fill="none">
        <g stroke="rgb(34 211 238)" strokeOpacity=".33" strokeWidth="1">
          <path d="M34 45 106 96l-18 92 94 78-38 128 102 67-62 140 115 70-35 145" />
          <path d="m34 45 54 143 94 78-38 128-96 66 136 141-112 86 192 129" />
          <path d="m106 96 76 170 64 195-102-67 40 207 115 70-227 16" />
          <path d="m48 460 198 1 53 210-115-70" />
        </g>
        <g fill="rgb(103 232 249)">
          {[['34','45'],['106','96'],['88','188'],['182','266'],['144','394'],['48','460'],['246','461'],['184','601'],['72','687'],['299','671'],['264','816']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fillOpacity=".78" />)}
        </g>
      </svg>
      <svg className="absolute -right-24 top-0 h-[980px] w-[560px] opacity-40" viewBox="0 0 560 980" fill="none">
        <g stroke="rgb(34 211 238)" strokeOpacity=".35" strokeWidth="1">
          <path d="m294 28 82 91-24 128 94 62-55 154 93 86-52 155 78 117" />
          <path d="m294 28 58 219-92 99 131 117-85 118 126 123-136 128" />
          <path d="m376 119 70 190-186 37 131 117 93 86-178 32" />
          <path d="m260 346 46 235-132 101 258 22 78 117-204 11" />
        </g>
        <g fill="rgb(103 232 249)">
          {[['294','28'],['376','119'],['352','247'],['446','309'],['260','346'],['391','463'],['484','549'],['306','581'],['174','682'],['432','704'],['510','821'],['306','832']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fillOpacity=".78" />)}
        </g>
      </svg>
      <div className="absolute inset-x-[18%] top-0 h-72 bg-cyan-400/[0.025] blur-[110px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(3_7_13/0.22)_52%,rgb(3_7_13/0.88)_100%)]" />
    </div>
  );
}
