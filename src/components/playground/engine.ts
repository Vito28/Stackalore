'use client';

/**
 * Runs C++ and Python entirely in the reader's browser.
 *
 * - C++ is compiled by YoWASP Clang in a long-lived worker
 *   (`public/playground/cpp-compiler.worker.js`) and every program runs in a
 *   fresh worker (`cpp-run.worker.js`) that is terminated when it exceeds the
 *   time limit.
 * - Python runs in Pyodide (`python.worker.js`); that worker is replaced after a
 *   timeout because a running Python program cannot be interrupted.
 *
 * Runs are queued, so two playgrounds on one page never compile at the same
 * time (that would double the memory use, which matters on phones).
 */

export type RunLanguage = 'cpp' | 'python';

export const TIME_LIMIT_MS = 5000;
export const OUTPUT_LIMIT_BYTES = 64 * 1024;

export const languageLabels: Record<RunLanguage, string> = { cpp: 'C++', python: 'Python' };

/** Approximate first download, shown before the reader agrees to it. */
export const downloadSizes: Record<RunLanguage, string> = { cpp: '23 MB', python: '6 MB' };

export interface OutputChunk {
  stream: 'stdout' | 'stderr';
  text: string;
}

export type RunStatus =
  | { phase: 'queued' }
  | { phase: 'loading'; loaded?: number; total?: number }
  | { phase: 'compiling' }
  | { phase: 'running' };

export type RunResult =
  | { kind: 'exit'; code: number; timeMs: number; warnings?: string }
  | { kind: 'compile-error'; diagnostics: string }
  | { kind: 'runtime-error'; message: string; warnings?: string }
  | { kind: 'timeout'; warnings?: string }
  | { kind: 'output-limit'; warnings?: string }
  | { kind: 'crash'; message: string };

export interface RunRequest {
  language: RunLanguage;
  code: string;
  stdin: string;
  onStatus?: (status: RunStatus) => void;
  onOutput?: (chunks: OutputChunk[]) => void;
}

const workerBase = '/playground';

/* ------------------------------------------------------------------------ */
/* C++ compiler worker                                                       */
/* ------------------------------------------------------------------------ */

type CompileOutcome =
  | { kind: 'compiled'; wasm: Uint8Array; diagnostics: string }
  | { kind: 'compile-error'; diagnostics: string }
  | { kind: 'crash'; message: string };

interface PendingCompile {
  resolve: (outcome: CompileOutcome) => void;
  onProgress?: (loaded: number, total: number) => void;
}

let compilerWorker: Worker | undefined;
const pendingCompiles = new Map<number, PendingCompile>();
let nextCompileId = 1;

function failPendingCompiles(message: string) {
  for (const pending of pendingCompiles.values()) pending.resolve({ kind: 'crash', message });
  pendingCompiles.clear();
}

function getCompilerWorker(): Worker {
  if (compilerWorker) return compilerWorker;
  const worker = new Worker(`${workerBase}/cpp-compiler.worker.js`, { type: 'module' });

  worker.onmessage = ({ data }) => {
    if (data.type === 'progress') {
      for (const pending of pendingCompiles.values()) pending.onProgress?.(data.loaded, data.total);
      return;
    }
    const pending = pendingCompiles.get(data.id);
    if (!pending) return;
    pendingCompiles.delete(data.id);
    if (data.type === 'compiled') pending.resolve({ kind: 'compiled', wasm: data.wasm, diagnostics: data.diagnostics });
    else if (data.type === 'compile-error') pending.resolve({ kind: 'compile-error', diagnostics: data.diagnostics });
    else {
      pending.resolve({ kind: 'crash', message: data.message });
      resetCompilerWorker();
    }
  };
  // A worker that dies (for example when the phone runs out of memory) fires `error`.
  worker.onerror = (event) => {
    event.preventDefault();
    failPendingCompiles(event.message || 'Compiler berhenti mendadak.');
    resetCompilerWorker();
  };

  compilerWorker = worker;
  return worker;
}

function resetCompilerWorker() {
  compilerWorker?.terminate();
  compilerWorker = undefined;
}

function compileCpp(code: string, onProgress?: (loaded: number, total: number) => void): Promise<CompileOutcome> {
  const worker = getCompilerWorker();
  const id = nextCompileId++;
  return new Promise((resolve) => {
    pendingCompiles.set(id, { resolve, onProgress });
    worker.postMessage({ type: 'compile', id, code });
  });
}

/* ------------------------------------------------------------------------ */
/* Running a program in a worker with a time limit                           */
/* ------------------------------------------------------------------------ */

type ProgramOutcome =
  | { kind: 'exit'; code: number; timeMs: number }
  | { kind: 'runtime-error'; message: string }
  | { kind: 'timeout' }
  | { kind: 'output-limit' }
  | { kind: 'crash'; message: string };

/**
 * Sends `message` to `worker` and settles on the first terminal message.
 * The time limit starts at `started`, so loading Pyodide does not count.
 */
function runInWorker(
  worker: Worker,
  message: Record<string, unknown>,
  transfer: Transferable[],
  request: RunRequest,
  onTimeout: () => void,
): Promise<ProgramOutcome> {
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let startedAt = 0;
    const settle = (outcome: ProgramOutcome) => {
      clearTimeout(timer);
      worker.onmessage = null;
      worker.onerror = null;
      resolve(outcome);
    };

    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'ready':
          request.onStatus?.({ phase: 'running' });
          break;
        case 'started':
          request.onStatus?.({ phase: 'running' });
          startedAt = performance.now();
          timer = setTimeout(() => {
            onTimeout();
            settle({ kind: 'timeout' });
          }, TIME_LIMIT_MS);
          break;
        case 'output':
          request.onOutput?.(data.chunks);
          break;
        case 'exit':
          settle({ kind: 'exit', code: data.code, timeMs: Math.round(performance.now() - startedAt) });
          break;
        case 'output-limit':
          settle({ kind: 'output-limit' });
          break;
        case 'runtime-error':
          settle({ kind: 'runtime-error', message: data.message });
          break;
        case 'crash':
          settle({ kind: 'crash', message: data.message });
          break;
      }
    };
    worker.onerror = (event) => {
      event.preventDefault();
      settle({ kind: 'crash', message: event.message || 'Program berhenti mendadak.' });
    };

    worker.postMessage(message, transfer);
  });
}

/* ------------------------------------------------------------------------ */
/* Python worker                                                             */
/* ------------------------------------------------------------------------ */

let pythonWorker: Worker | undefined;

function getPythonWorker(): Worker {
  pythonWorker ??= new Worker(`${workerBase}/python.worker.js`, { type: 'module' });
  return pythonWorker;
}

function resetPythonWorker() {
  pythonWorker?.terminate();
  pythonWorker = undefined;
}

/* ------------------------------------------------------------------------ */
/* Public API                                                                */
/* ------------------------------------------------------------------------ */

let queue: Promise<unknown> = Promise.resolve();

async function execute(request: RunRequest): Promise<RunResult> {
  if (request.language === 'python') {
    request.onStatus?.({ phase: 'loading' });
    const outcome = await runInWorker(
      getPythonWorker(),
      { type: 'run', code: request.code, stdin: request.stdin, outputLimit: OUTPUT_LIMIT_BYTES },
      [],
      request,
      resetPythonWorker,
    );
    if (outcome.kind === 'crash') resetPythonWorker();
    return outcome;
  }

  request.onStatus?.({ phase: 'compiling' });
  const compiled = await compileCpp(request.code, (loaded, total) =>
    request.onStatus?.({ phase: 'loading', loaded, total }),
  );
  if (compiled.kind !== 'compiled') return compiled;

  request.onStatus?.({ phase: 'running' });
  const warnings = compiled.diagnostics.trim() || undefined;
  const runner = new Worker(`${workerBase}/cpp-run.worker.js`, { type: 'module' });
  try {
    const outcome = await runInWorker(
      runner,
      { type: 'run', wasm: compiled.wasm, stdin: request.stdin, outputLimit: OUTPUT_LIMIT_BYTES },
      [compiled.wasm.buffer],
      request,
      () => runner.terminate(),
    );
    return outcome.kind === 'crash' ? outcome : { ...outcome, warnings };
  } finally {
    runner.terminate();
  }
}

export function runCode(request: RunRequest): Promise<RunResult> {
  request.onStatus?.({ phase: 'queued' });
  const result = queue.then(() => execute(request));
  queue = result.catch(() => undefined);
  return result;
}

/* ------------------------------------------------------------------------ */
/* Download consent                                                          */
/* ------------------------------------------------------------------------ */

const consentKey = (language: RunLanguage) => `stacklore:playground:unduh:${language}`;
const consentInSession = new Set<RunLanguage>();

/** Whether the reader already agreed to download this language's runtime. */
export function hasDownloadConsent(language: RunLanguage): boolean {
  if (consentInSession.has(language)) return true;
  try {
    return window.localStorage.getItem(consentKey(language)) === '1';
  } catch {
    return false;
  }
}

export function giveDownloadConsent(language: RunLanguage) {
  consentInSession.add(language);
  try {
    window.localStorage.setItem(consentKey(language), '1');
  } catch {
    // Private mode: the consent lasts for this visit only.
  }
}

/** Android Chrome reports device memory in GB; other browsers return undefined. */
export function isLowMemoryDevice(): boolean {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof memory === 'number' && memory < 4;
}
