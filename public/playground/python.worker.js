// Runs Python in the reader's browser with Pyodide (~6 MB from jsDelivr,
// cached by the browser afterwards). The page terminates this worker when a
// program runs too long and starts a new one for the next run.
//
// Messages in:  { type: 'run', code, stdin, outputLimit }
// Messages out: { type: 'ready' }
//               { type: 'started' }
//               { type: 'output', chunks: [{ stream: 'stdout' | 'stderr', text }] }
//               { type: 'exit', code }
//               { type: 'output-limit' }
//               { type: 'runtime-error', message }
//               { type: 'crash', message }

const INDEX_URL = 'https://cdn.jsdelivr.net/npm/pyodide@314.0.8/';
const FILENAME = 'main.py';

let pyodidePromise;

class OutputLimit extends Error {}

/** Drops Pyodide's own frames so the traceback only shows the reader's code. */
function cleanTraceback(message) {
  const lines = message.split('\n');
  const kept = [];
  let skipping = false;
  for (const line of lines) {
    const frame = /^ {2}File "([^"]+)"/.exec(line);
    if (frame) skipping = frame[1] !== FILENAME && frame[1] !== '<exec>';
    else if (!line.startsWith(' ')) skipping = false;
    if (!skipping) kept.push(line);
  }
  return kept.join('\n').trimEnd();
}

self.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;

  let pyodide;
  try {
    // Imported here rather than at the top so a network failure is reported as a message.
    pyodidePromise ??= import(`${INDEX_URL}pyodide.mjs`).then(({ loadPyodide }) => loadPyodide({ indexURL: INDEX_URL }));
    pyodide = await pyodidePromise;
  } catch (error) {
    pyodidePromise = undefined;
    self.postMessage({ type: 'crash', message: `Gagal memuat Python: ${error?.message ?? error}` });
    return;
  }
  self.postMessage({ type: 'ready' });

  let pending = [];
  let written = 0;
  let limitHit = false;
  let lastFlush = performance.now();
  const flush = () => {
    if (pending.length) self.postMessage({ type: 'output', chunks: pending });
    pending = [];
    lastFlush = performance.now();
  };
  const writer = (stream) => {
    const decoder = new TextDecoder();
    return {
      write(buffer) {
        const allowed = Math.min(buffer.length, data.outputLimit - written);
        if (allowed > 0) {
          const text = decoder.decode(buffer.subarray(0, allowed), { stream: allowed === buffer.length });
          const last = pending[pending.length - 1];
          if (last && last.stream === stream) last.text += text;
          else pending.push({ stream, text });
          written += allowed;
        }
        if (performance.now() - lastFlush > 50) flush();
        if (allowed < buffer.length) {
          limitHit = true;
          throw new OutputLimit();
        }
        return buffer.length;
      },
    };
  };

  let stdinUsed = false;
  pyodide.setStdin({
    stdin: () => {
      if (stdinUsed) return null;
      stdinUsed = true;
      return data.stdin ?? '';
    },
  });
  // isatty makes Python flush after every line, so output survives a timeout.
  pyodide.setStdout({ ...writer('stdout'), isatty: true });
  pyodide.setStderr({ ...writer('stderr'), isatty: true });
  const flushPython = () => {
    try {
      pyodide.runPython('import sys\nsys.stdout.flush()\nsys.stderr.flush()');
    } catch {
      // Output limit already reported.
    }
  };

  const globals = pyodide.globals.get('dict')();
  self.postMessage({ type: 'started' });
  try {
    pyodide.runPython(data.code, { globals, filename: FILENAME });
    flushPython();
    flush();
    self.postMessage({ type: 'exit', code: 0 });
  } catch (error) {
    flushPython();
    flush();
    if (limitHit) {
      self.postMessage({ type: 'output-limit' });
    } else if (error?.type === 'SystemExit') {
      const code = Number.parseInt(String(error.message).trim().split('\n').pop().replace('SystemExit:', ''), 10);
      self.postMessage({ type: 'exit', code: Number.isNaN(code) ? 0 : code });
    } else {
      self.postMessage({ type: 'runtime-error', message: cleanTraceback(String(error?.message ?? error)) });
    }
  } finally {
    globals.destroy();
  }
};
