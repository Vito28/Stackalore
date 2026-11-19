// Runs one compiled C++ program (WASI preview1) with stdin given up front.
// A fresh worker is used for every run so the page can stop a runaway program
// with worker.terminate().
//
// Messages in:  { type: 'run', wasm, stdin, outputLimit }
// Messages out: { type: 'started' }
//               { type: 'output', chunks: [{ stream: 'stdout' | 'stderr', text }] }
//               { type: 'exit', code }
//               { type: 'output-limit' }
//               { type: 'runtime-error', message }

const encoder = new TextEncoder();

class ProcessExit {
  constructor(code) {
    this.code = code;
  }
}

class OutputLimit {}

function createWasi({ stdin, outputLimit }) {
  let memory;
  const input = encoder.encode(stdin);
  let inputPosition = 0;
  const decoders = { 1: new TextDecoder(), 2: new TextDecoder() };
  let pending = [];
  let written = 0;
  let lastFlush = performance.now();

  const view = () => new DataView(memory.buffer);
  const bytes = () => new Uint8Array(memory.buffer);

  function flush() {
    if (pending.length) self.postMessage({ type: 'output', chunks: pending });
    pending = [];
    lastFlush = performance.now();
  }

  function emit(fd, data) {
    const text = decoders[fd].decode(data, { stream: true });
    if (!text) return;
    const stream = fd === 2 ? 'stderr' : 'stdout';
    const last = pending[pending.length - 1];
    if (last && last.stream === stream) last.text += text;
    else pending.push({ stream, text });
    if (performance.now() - lastFlush > 50) flush();
  }

  const ERRNO_SUCCESS = 0;
  const ERRNO_BADF = 8;
  const ERRNO_NOSYS = 52;
  const ERRNO_SPIPE = 70;

  const imports = {
    args_sizes_get(countPtr, sizePtr) {
      view().setUint32(countPtr, 0, true);
      view().setUint32(sizePtr, 0, true);
      return ERRNO_SUCCESS;
    },
    args_get: () => ERRNO_SUCCESS,
    environ_sizes_get(countPtr, sizePtr) {
      view().setUint32(countPtr, 0, true);
      view().setUint32(sizePtr, 0, true);
      return ERRNO_SUCCESS;
    },
    environ_get: () => ERRNO_SUCCESS,
    fd_write(fd, iovs, iovsLength, writtenPtr) {
      if (fd !== 1 && fd !== 2) return ERRNO_BADF;
      let total = 0;
      for (let i = 0; i < iovsLength; i++) {
        const pointer = view().getUint32(iovs + 8 * i, true);
        const length = view().getUint32(iovs + 8 * i + 4, true);
        const allowed = Math.min(length, outputLimit - written);
        if (allowed > 0) emit(fd, bytes().slice(pointer, pointer + allowed));
        written += allowed;
        total += length;
        if (allowed < length) throw new OutputLimit();
      }
      view().setUint32(writtenPtr, total, true);
      return ERRNO_SUCCESS;
    },
    fd_read(fd, iovs, iovsLength, readPtr) {
      if (fd !== 0) return ERRNO_BADF;
      let total = 0;
      for (let i = 0; i < iovsLength && inputPosition < input.length; i++) {
        const pointer = view().getUint32(iovs + 8 * i, true);
        const length = view().getUint32(iovs + 8 * i + 4, true);
        const count = Math.min(length, input.length - inputPosition);
        bytes().set(input.subarray(inputPosition, inputPosition + count), pointer);
        inputPosition += count;
        total += count;
      }
      view().setUint32(readPtr, total, true);
      return ERRNO_SUCCESS;
    },
    fd_close: () => ERRNO_SUCCESS,
    fd_seek: () => ERRNO_SPIPE,
    fd_sync: () => ERRNO_SUCCESS,
    fd_fdstat_get(fd, pointer) {
      if (fd > 2) return ERRNO_BADF;
      view().setUint8(pointer, 2); // character device
      view().setUint16(pointer + 2, 0, true);
      view().setBigUint64(pointer + 8, 0xffffffffn, true);
      view().setBigUint64(pointer + 16, 0xffffffffn, true);
      return ERRNO_SUCCESS;
    },
    fd_fdstat_set_flags: () => ERRNO_SUCCESS,
    fd_prestat_get: () => ERRNO_BADF,
    fd_prestat_dir_name: () => ERRNO_BADF,
    proc_exit(code) {
      throw new ProcessExit(code);
    },
    clock_time_get(_id, _precision, pointer) {
      const now = BigInt(Math.round((performance.timeOrigin + performance.now()) * 1e6));
      view().setBigUint64(pointer, now, true);
      return ERRNO_SUCCESS;
    },
    clock_res_get(_id, pointer) {
      view().setBigUint64(pointer, 1000n, true);
      return ERRNO_SUCCESS;
    },
    random_get(pointer, length) {
      crypto.getRandomValues(bytes().subarray(pointer, pointer + length));
      return ERRNO_SUCCESS;
    },
    sched_yield: () => ERRNO_SUCCESS,
  };

  return {
    imports: {
      wasi_snapshot_preview1: new Proxy(imports, { get: (target, name) => target[name] ?? (() => ERRNO_NOSYS) }),
    },
    start(instance) {
      memory = instance.exports.memory;
      instance.exports._start();
    },
    flush() {
      for (const fd of [1, 2]) {
        const rest = decoders[fd].decode();
        if (rest) pending.push({ stream: fd === 2 ? 'stderr' : 'stdout', text: rest });
      }
      flush();
    },
  };
}

self.onmessage = async ({ data }) => {
  if (data.type !== 'run') return;
  const wasi = createWasi({ stdin: data.stdin ?? '', outputLimit: data.outputLimit });

  let instance;
  try {
    const program = await WebAssembly.compile(data.wasm);
    instance = await WebAssembly.instantiate(program, wasi.imports);
  } catch (error) {
    self.postMessage({ type: 'runtime-error', message: String(error?.message ?? error) });
    return;
  }

  self.postMessage({ type: 'started' });
  try {
    wasi.start(instance);
    wasi.flush();
    self.postMessage({ type: 'exit', code: 0 });
  } catch (error) {
    wasi.flush();
    if (error instanceof ProcessExit) self.postMessage({ type: 'exit', code: error.code });
    else if (error instanceof OutputLimit) self.postMessage({ type: 'output-limit' });
    else self.postMessage({ type: 'runtime-error', message: String(error?.message ?? error) });
  }
};
