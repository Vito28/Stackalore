'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Check, Copy, Download, Loader2, Play, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { CodeEditor } from './code-editor';
import {
  OUTPUT_LIMIT_BYTES,
  TIME_LIMIT_MS,
  downloadSizes,
  giveDownloadConsent,
  hasDownloadConsent,
  isLowMemoryDevice,
  languageLabels,
  runCode,
  type OutputChunk,
  type RunLanguage,
  type RunResult,
  type RunStatus,
} from './engine';

export interface PlaygroundSource {
  code: string;
  input?: string;
}

interface PlaygroundProps {
  /** Starting code (and sample input) per language; one entry hides the language switch. */
  sources: Partial<Record<RunLanguage, PlaygroundSource>>;
  defaultLanguage: RunLanguage;
  onClose?: () => void;
  className?: string;
}

type Drafts = Partial<Record<RunLanguage, { code: string; input: string }>>;

function initialDrafts(sources: PlaygroundProps['sources']): Drafts {
  const drafts: Drafts = {};
  for (const [language, source] of Object.entries(sources) as [RunLanguage, PlaygroundSource][]) {
    drafts[language] = { code: source.code, input: source.input ?? '' };
  }
  return drafts;
}

const megabytes = (bytes: number) => (bytes / 1e6).toFixed(1);

function statusText(status: RunStatus, language: RunLanguage): string {
  switch (status.phase) {
    case 'queued':
      return 'Menunggu program lain selesai…';
    case 'loading':
      if (language === 'python') return 'Memuat Python…';
      if (status.total && status.loaded !== undefined && status.loaded < status.total) {
        return `Mengunduh compiler C++… ${megabytes(status.loaded)} / ${megabytes(status.total)} MB`;
      }
      return 'Menyiapkan compiler C++…';
    case 'compiling':
      return 'Mengompilasi…';
    case 'running':
      return 'Menjalankan…';
  }
}

/** Plain-language hint for the WebAssembly trap messages a C++ program can hit. */
function runtimeHint(message: string): string | undefined {
  const text = message.toLowerCase();
  if (text.includes('unreachable')) {
    return 'Program dihentikan paksa (abort), misalnya karena indeks di luar batas pada .at() atau assert yang gagal.';
  }
  if (text.includes('out of bounds')) {
    return 'Program mengakses memori di luar batas, misalnya indeks array yang salah atau pointer yang tidak valid.';
  }
  if (text.includes('divide by zero') || text.includes('division by zero')) {
    return 'Ada pembagian bilangan bulat dengan nol.';
  }
  if (text.includes('call stack') || text.includes('stack size')) {
    return 'Rekursi terlalu dalam (stack overflow). Periksa base case fungsi rekursifmu.';
  }
  return undefined;
}

function crashMessage(message: string, language: RunLanguage) {
  if (message.startsWith('Gagal memuat')) {
    return {
      title: 'Gagal memuat',
      body: `${message}. Periksa koneksi internet, lalu coba lagi.`,
    };
  }
  return {
    title: 'Perangkat tidak cukup kuat',
    body:
      language === 'cpp'
        ? 'Compiler C++ berhenti mendadak, biasanya karena memori perangkat tidak cukup (sering terjadi di HP). Coba versi Python, atau buka halaman ini di laptop. Kamu juga bisa menyalin kodenya dan menjalankannya di compiler sendiri.'
        : 'Python berhenti mendadak, biasanya karena memori perangkat tidak cukup. Coba tutup tab lain lalu jalankan lagi.',
  };
}

export function Playground({ sources, defaultLanguage, onClose, className }: PlaygroundProps) {
  const languages = Object.keys(sources) as RunLanguage[];
  const [language, setLanguage] = useState<RunLanguage>(defaultLanguage);
  const [drafts, setDrafts] = useState<Drafts>(() => initialDrafts(sources));
  const [status, setStatus] = useState<RunStatus | null>(null);
  const [output, setOutput] = useState<OutputChunk[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [askConsent, setAskConsent] = useState(false);
  const [lowMemory, setLowMemory] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const draft = drafts[language] ?? { code: '', input: '' };
  const running = status !== null;

  const updateDraft = (patch: Partial<{ code: string; input: string }>) =>
    setDrafts((current) => ({ ...current, [language]: { ...draft, ...patch } }));

  const execute = useCallback(async () => {
    setAskConsent(false);
    setOutput([]);
    setResult(null);
    const outcome = await runCode({
      language,
      code: draft.code,
      stdin: draft.input,
      onStatus: (next) => mounted.current && setStatus(next),
      onOutput: (chunks) => mounted.current && setOutput((current) => [...current, ...chunks]),
    });
    if (!mounted.current) return;
    setStatus(null);
    setResult(outcome);
  }, [language, draft.code, draft.input]);

  const requestRun = useCallback(() => {
    if (running) return;
    if (hasDownloadConsent(language)) {
      void execute();
      return;
    }
    setLowMemory(language === 'cpp' && isLowMemoryDevice());
    setAskConsent(true);
  }, [running, language, execute]);

  const acceptDownload = () => {
    giveDownloadConsent(language);
    void execute();
  };

  const reset = () => {
    const source = sources[language];
    updateDraft({ code: source?.code ?? '', input: source?.input ?? '' });
    setOutput([]);
    setResult(null);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(draft.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; nothing else to do.
    }
  };

  const switchLanguage = (next: RunLanguage) => {
    if (running || next === language) return;
    setLanguage(next);
    setAskConsent(false);
    setOutput([]);
    setResult(null);
  };

  const hasOutput = output.length > 0;
  const crash = result?.kind === 'crash' ? crashMessage(result.message, language) : undefined;
  const warnings = result && 'warnings' in result ? result.warnings : undefined;

  return (
    <div className={cn('not-prose overflow-hidden rounded-xl border bg-fd-card text-sm', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b px-2 py-1.5 sm:px-3">
        {languages.length > 1 ? (
          <div role="tablist" aria-label="Bahasa" className="flex rounded-lg border bg-fd-background p-0.5">
            {languages.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={item === language}
                disabled={running}
                onClick={() => switchLanguage(item)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[0.8125rem] font-medium transition-colors',
                  item === language
                    ? 'bg-fd-primary text-fd-primary-foreground'
                    : 'text-fd-muted-foreground hover:text-fd-foreground',
                )}
              >
                {languageLabels[item]}
              </button>
            ))}
          </div>
        ) : (
          <span className="px-1 text-[0.8125rem] font-medium text-fd-muted-foreground">
            Playground {languageLabels[language]}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={reset} disabled={running} aria-label="Kembalikan kode awal" title="Reset">
            <RotateCcw />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={copyCode} aria-label="Salin kode" title="Salin kode">
            {copied ? <Check /> : <Copy />}
          </Button>
          <Button size="sm" onClick={requestRun} disabled={running} title="Jalankan (Ctrl + Enter)">
            {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            Jalankan
          </Button>
          {onClose ? (
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Tutup playground" title="Tutup">
              <X />
            </Button>
          ) : null}
        </div>
      </div>

      <CodeEditor
        value={draft.code}
        language={language}
        onChange={(code) => updateDraft({ code })}
        onRun={requestRun}
        ariaLabel={`Editor kode ${languageLabels[language]}`}
      />

      <div className="border-t px-3 py-2.5">
        <label className="block text-xs font-medium text-fd-muted-foreground">
          Input
          <textarea
            value={draft.input}
            onChange={(event) => updateDraft({ input: event.target.value })}
            rows={Math.min(6, Math.max(2, draft.input.split('\n').length))}
            placeholder="Ketik input untuk cin / input() di sini, sebelum menekan Jalankan"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="mt-1.5 block w-full resize-y rounded-lg border bg-fd-background px-3 py-2 font-mono text-base text-fd-foreground outline-none placeholder:text-fd-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-fd-ring sm:text-[0.8125rem]"
          />
        </label>
      </div>

      {askConsent ? (
        <div className="border-t bg-fd-background px-3 py-3">
          <p className="flex items-start gap-2 text-fd-foreground">
            <Download className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden="true" />
            <span>
              Untuk menjalankan {languageLabels[language]} di browser, perlu mengunduh sekitar{' '}
              <strong>{downloadSizes[language]}</strong> satu kali. Setelah itu tersimpan di browser dan tidak diunduh
              lagi.
            </span>
          </p>
          {lowMemory ? (
            <p className="mt-2 flex items-start gap-2 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                Memori perangkat ini kecil, jadi compiler C++ mungkin gagal berjalan. Versi Python jauh lebih ringan.
              </span>
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={acceptDownload}>
              Unduh &amp; jalankan
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAskConsent(false)}>
              Batal
            </Button>
          </div>
        </div>
      ) : null}

      {running || hasOutput || result ? (
        <div className="border-t" aria-live="polite">
          <div className="flex items-center justify-between gap-2 px-3 pt-2.5 text-xs font-medium text-fd-muted-foreground">
            <span>{result?.kind === 'compile-error' ? 'Error kompilasi' : 'Output'}</span>
            {status ? <span className="truncate">{statusText(status, language)}</span> : null}
          </div>

          {result?.kind === 'compile-error' ? (
            <pre className="max-h-80 overflow-auto px-3 py-2.5 font-mono text-[0.8125rem] leading-6 whitespace-pre-wrap text-rose-700 dark:text-rose-300">
              {result.diagnostics}
            </pre>
          ) : (
            <pre className="max-h-80 min-h-10 overflow-auto px-3 py-2.5 font-mono text-[0.8125rem] leading-6 whitespace-pre-wrap text-fd-foreground">
              {output.map((chunk, index) => (
                <span key={index} className={chunk.stream === 'stderr' ? 'text-rose-700 dark:text-rose-300' : undefined}>
                  {chunk.text}
                </span>
              ))}
              {!running && !hasOutput && result && result.kind === 'exit' ? (
                <span className="text-fd-muted-foreground italic">(tidak ada output)</span>
              ) : null}
            </pre>
          )}

          {result ? (
            <ResultFooter result={result} language={language} crash={crash} onCopy={copyCode} copied={copied} />
          ) : null}

          {warnings ? (
            <details className="border-t px-3 py-2 text-xs">
              <summary className="cursor-pointer font-medium text-amber-700 dark:text-amber-300">
                Peringatan compiler
              </summary>
              <pre className="mt-2 overflow-auto font-mono text-[0.75rem] leading-5 whitespace-pre-wrap text-fd-muted-foreground">
                {warnings}
              </pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ResultFooter({
  result,
  language,
  crash,
  onCopy,
  copied,
}: {
  result: RunResult;
  language: RunLanguage;
  crash?: { title: string; body: string };
  onCopy: () => void;
  copied: boolean;
}) {
  const box = (tone: 'ok' | 'warn' | 'error', children: ReactNode) => (
    <div
      className={cn(
        'border-t px-3 py-2 text-xs leading-5',
        tone === 'ok' && 'text-fd-muted-foreground',
        tone === 'warn' && 'bg-amber-500/8 text-amber-800 dark:text-amber-200',
        tone === 'error' && 'bg-rose-500/8 text-rose-800 dark:text-rose-200',
      )}
    >
      {children}
    </div>
  );

  switch (result.kind) {
    case 'exit':
      return result.code === 0
        ? box('ok', `Selesai dalam ${result.timeMs} ms`)
        : box('warn', `Program selesai dengan kode keluar ${result.code} (bukan 0, biasanya menandakan ada yang salah).`);
    case 'compile-error':
      return box('error', 'Perbaiki error di atas, lalu jalankan lagi. Baris dan kolom error ditulis sebagai main.cpp:baris:kolom.');
    case 'runtime-error': {
      const hint = language === 'cpp' ? runtimeHint(result.message) : undefined;
      return box(
        'error',
        <>
          <strong className="font-semibold">Runtime error.</strong> {hint}
          <pre className="mt-1 overflow-auto font-mono whitespace-pre-wrap">{result.message}</pre>
        </>,
      );
    }
    case 'timeout':
      return box(
        'warn',
        `Program dihentikan setelah ${TIME_LIMIT_MS / 1000} detik. Mungkin ada perulangan yang tidak pernah berhenti, atau input yang diisi kurang.`,
      );
    case 'output-limit':
      return box(
        'warn',
        `Output dipotong karena melebihi ${OUTPUT_LIMIT_BYTES / 1024} KB. Mungkin ada perulangan yang mencetak terus-menerus.`,
      );
    case 'crash':
      return box(
        'error',
        <>
          <strong className="font-semibold">{crash?.title}.</strong> {crash?.body}
          <button type="button" onClick={onCopy} className="mt-1.5 flex items-center gap-1 font-medium underline">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} Salin kode
          </button>
        </>,
      );
  }
}
