// Compiles C++ to WebAssembly in the reader's browser with YoWASP Clang.
// The compiler (~23 MB) is fetched from jsDelivr on first use and then served
// from the browser cache. One worker is kept alive so later compiles are warm.
//
// Messages in:  { type: 'compile', id, code }
// Messages out: { type: 'progress', loaded, total }
//               { type: 'compiled', id, wasm, diagnostics }
//               { type: 'compile-error', id, diagnostics }
//               { type: 'crash', id, message }

const CLANG_URL = 'https://cdn.jsdelivr.net/npm/@yowasp/clang@22.0.0-git20695-13/gen/bundle.js';

const COMPILE_FLAGS = [
  '-std=c++20',
  '-O1',
  // YoWASP's libc++ is built without exception support.
  '-fno-exceptions',
  // The default WebAssembly stack is only 64 KB; give recursion the same 8 MB as Linux.
  '-Wl,-z,stack-size=8388608',
];

let clangPromise;
const downloads = new Map();

function reportProgress({ source, totalLength, doneLength }) {
  downloads.set(source, { total: totalLength, done: doneLength });
  let loaded = 0;
  let total = 0;
  for (const item of downloads.values()) {
    loaded += item.done;
    total += item.total;
  }
  self.postMessage({ type: 'progress', loaded, total });
}

function loadClang() {
  clangPromise ??= import(CLANG_URL).then((module) => module.runClang);
  return clangPromise;
}

self.onmessage = async ({ data }) => {
  if (data.type !== 'compile') return;
  const { id, code } = data;

  let runClang;
  try {
    runClang = await loadClang();
  } catch (error) {
    clangPromise = undefined;
    self.postMessage({ type: 'crash', id, message: `Gagal memuat compiler: ${error?.message ?? error}` });
    return;
  }

  const decoder = new TextDecoder();
  let diagnostics = '';
  const collect = (bytes) => {
    if (bytes) diagnostics += decoder.decode(bytes, { stream: true });
  };

  try {
    const files = await runClang(['clang++', ...COMPILE_FLAGS, 'main.cpp', '-o', 'main.wasm'], { 'main.cpp': code }, {
      stdout: collect,
      stderr: collect,
      fetchProgress: reportProgress,
    });
    const wasm = files['main.wasm'].slice();
    self.postMessage({ type: 'compiled', id, wasm, diagnostics }, [wasm.buffer]);
  } catch (error) {
    // Clang exits with a non-zero code on compile errors; anything else is a crash
    // (most often running out of memory on a phone).
    if (typeof error?.code === 'number' && diagnostics) {
      self.postMessage({ type: 'compile-error', id, diagnostics });
    } else {
      self.postMessage({ type: 'crash', id, message: String(error?.message ?? error) });
    }
  }
};
