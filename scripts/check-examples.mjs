#!/usr/bin/env node
// Compiles and runs every runnable example in content/ with its `input`
// attribute, the same way the playground does, and reports problems.
//
//   node scripts/check-examples.mjs                 check everything
//   node scripts/check-examples.mjs perulangan      only files whose path contains "perulangan"
//   node scripts/check-examples.mjs --fill-soal     also copy each Soal's "Contoh input" into its runnable examples
//
// Fence attributes it understands:
//   input="..."        stdin for the example (\n = new line), shared by the C++ and Python tabs
//   check="no-compare" compile and run, but the outputs differ on purpose (true vs True, buggy soal code)
//   check="skip"       do not check at all (examples that must fail: compile errors, crashes, UB)
//   run="none"         not a runnable program (a fragment with int main); no Jalankan button either
//
// Needs g++ (C++20) and python3 on PATH. Groups follow the same rule as
// src/lib/mdx/remark-runnable.ts: code blocks with `tab="..."` next to each
// other form one example, runnable when its C++ block has `int main`.

import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const fillSoal = args.includes('--fill-soal');
const filters = args.filter((arg) => !arg.startsWith('--'));
const work = mkdtempSync(join(tmpdir(), 'stacklore-examples-'));
const TIME_LIMIT_S = 5;

function listMdx(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listMdx(path);
    return name.endsWith('.mdx') ? [path] : [];
  });
}

const fence = /^(?<indent>[ \t]*)```(?<lang>[\w+-]*)(?<meta>[^\n]*)\n(?<body>[\s\S]*?)^\k<indent>```[ \t]*$/gm;
const attribute = (meta, name) => {
  const match = new RegExp(`(?:^|\\s)${name}=(?:"([^"]*)"|'([^']*)')`).exec(meta);
  return match ? (match[1] ?? match[2]) : undefined;
};
/** Markdown strips up to the fence's own indentation from every line inside it. */
const dedent = (text, width) => (width ? text.replace(new RegExp(`^ {1,${width}}`, 'gm'), '') : text);
const unescapeInput = (value) => value.replace(/\\([nt\\])/g, (_, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : '\\'));
const runLanguage = (lang) => ({ cpp: 'cpp', 'c++': 'cpp', python: 'python', py: 'python' })[lang.toLowerCase()];

/** All fenced blocks of a file with offsets, grouped like remarkCodeTab does. */
function findGroups(source) {
  const blocks = [...source.matchAll(fence)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
    metaStart: match.index + match.groups.indent.length + 3 + match.groups.lang.length,
    lang: match.groups.lang,
    meta: match.groups.meta,
    body: dedent(match.groups.body, match.groups.indent.length).replace(/[ \t]*(?:\/\/|#) \[!code [^\]]*\][ \t]*$/gm, ''),
    tab: /(?:^|\s)tab=/.test(match.groups.meta),
  }));
  const groups = [];
  for (let i = 0; i < blocks.length; ) {
    let j = i + 1;
    if (blocks[i].tab) {
      while (j < blocks.length && blocks[j].tab && /^\s*$/.test(source.slice(blocks[j - 1].end, blocks[j].start))) j++;
    }
    groups.push(blocks.slice(i, j));
    i = j;
  }
  return groups;
}

/** Text of the <Soal ...> element that contains `offset`, if any. */
function enclosingSoal(source, offset) {
  const open = source.lastIndexOf('<Soal ', offset);
  if (open === -1) return undefined;
  const close = source.indexOf('</Soal>', open);
  if (close === -1 || close < offset) return undefined;
  return source.slice(open, close);
}

function soalSample(soal, kind) {
  const match = new RegExp('^([ \\t]*)```(?:txt|text)[^\\n]*title="Contoh ' + kind + '(?: 1)?"[^\\n]*\\n([\\s\\S]*?)^[ \\t]*```', 'm').exec(soal);
  return match ? dedent(match[2], match[1].length) : undefined;
}

const escapeInput = (text) => text.replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n');

function run(command, commandArgs, input, cwd, limitSeconds = TIME_LIMIT_S) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, { cwd });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, limitSeconds * 1000);
    child.stdout.on('data', (data) => {
      if (stdout.length < 1e6) stdout += data;
    });
    child.stderr.on('data', (data) => {
      if (stderr.length < 1e5) stderr += data;
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
    child.on('close', (status, signal) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, status: status ?? signal, timedOut });
    });
  });
}

const normalize = (text) => text.replace(/[ \t]+$/gm, '').replace(/\s+$/, '');

/** Checks one example and returns its problems. */
async function checkGroup({ rel, source, group, cppBlock, lineOf }, dir) {
  const problems = [];
  const report = (where, message) => problems.push(`✗ ${where}: ${message}`);
  const where = `${rel}:${lineOf(cppBlock.start)}`;
  const rawInput = group.map((block) => attribute(block.meta, 'input')).find((value) => value !== undefined);
  const input = rawInput === undefined ? '' : unescapeInput(rawInput);
  const readsInput = group.some((block) => /\bcin\b|getline\s*\(|\binput\s*\(/.test(block.body));
  if (readsInput && rawInput === undefined) report(where, 'membaca input tetapi belum punya atribut input');

  writeFileSync(join(dir, 'main.cpp'), cppBlock.body);
  const compile = await run('g++', ['-std=c++20', '-O1', '-fno-exceptions', '-w', 'main.cpp', '-o', 'main'], '', dir, 120);
  if (compile.status !== 0) {
    report(where, `gagal dikompilasi\n${compile.stderr.split('\n').slice(0, 4).join('\n')}`);
    return problems;
  }
  const cpp = await run(join(dir, 'main'), [], input, dir);
  if (cpp.timedOut) report(where, `C++ tidak selesai dalam ${TIME_LIMIT_S} detik`);
  else if (cpp.status !== 0) report(where, `C++ selesai dengan kode ${cpp.status}`);

  // check="no-compare": the outputs differ on purpose (true vs True, 30 vs 30.0, buggy soal code).
  const compareOutput = !group.some((block) => attribute(block.meta, 'check') === 'no-compare');
  const soal = enclosingSoal(source, cppBlock.start);
  const soalInput = soal ? soalSample(soal, 'input') : undefined;
  const expected =
    rawInput !== undefined && soalInput !== undefined && input.replace(/\n$/, '') === soalInput.replace(/\n$/, '')
      ? soalSample(soal, 'output')
      : undefined;
  if (compareOutput && expected !== undefined && !cpp.timedOut && normalize(cpp.stdout) !== normalize(expected)) {
    report(where, `output C++ berbeda dari Contoh output\n  dapat: ${JSON.stringify(normalize(cpp.stdout).slice(0, 200))}\n  harap: ${JSON.stringify(normalize(expected).slice(0, 200))}`);
  }

  for (const pyBlock of group.filter((block) => runLanguage(block.lang) === 'python')) {
    writeFileSync(join(dir, 'main.py'), pyBlock.body);
    const py = await run('python3', ['main.py'], input, dir);
    const pyWhere = `${rel}:${lineOf(pyBlock.start)}`;
    if (py.timedOut) report(pyWhere, `Python tidak selesai dalam ${TIME_LIMIT_S} detik`);
    else if (py.status !== 0) report(pyWhere, `Python error\n  ${py.stderr.trim().split('\n').slice(-1)[0]}`);
    else if (compareOutput && !cpp.timedOut && cpp.status === 0 && normalize(py.stdout) !== normalize(cpp.stdout)) {
      report(pyWhere, `output Python berbeda dari C++\n  C++   : ${JSON.stringify(normalize(cpp.stdout).slice(0, 200))}\n  Python: ${JSON.stringify(normalize(py.stdout).slice(0, 200))}`);
    }
  }
  return problems;
}

const tasks = [];
let filled = 0;

for (const file of listMdx(join(root, 'content')).sort()) {
  const rel = relative(root, file);
  if (filters.length && !filters.some((filter) => rel.includes(filter))) continue;
  let source = readFileSync(file, 'utf8');

  if (fillSoal) {
    // Insert from the end so earlier offsets stay valid.
    const insertions = [];
    for (const group of findGroups(source)) {
      const cppBlock = group.find((block) => runLanguage(block.lang) === 'cpp' && /\bint\s+main\s*\(/.test(block.body));
      if (!cppBlock || group.some((block) => attribute(block.meta, 'input') !== undefined)) continue;
      if (!group.some((block) => /\bcin\b|getline\s*\(|\binput\s*\(/.test(block.body))) continue;
      const soal = enclosingSoal(source, cppBlock.start);
      const sample = soal && soalSample(soal, 'input');
      if (sample === undefined) continue;
      insertions.push({ at: cppBlock.metaStart + cppBlock.meta.length, text: ` input="${escapeInput(sample.replace(/\n$/, ''))}"` });
    }
    for (const { at, text } of insertions.sort((a, b) => b.at - a.at)) source = source.slice(0, at) + text + source.slice(at);
    if (insertions.length) {
      writeFileSync(file, source);
      filled += insertions.length;
    }
  }

  const finalSource = source;
  const lineOf = (offset) => finalSource.slice(0, offset).split('\n').length;
  for (const group of findGroups(finalSource)) {
    const cppBlock = group.find((block) => runLanguage(block.lang) === 'cpp' && /\bint\s+main\s*\(/.test(block.body));
    if (!cppBlock || group.some((block) => attribute(block.meta, 'check') === 'skip' || attribute(block.meta, 'run') === 'none')) continue;
    tasks.push({ rel, source: finalSource, group, cppBlock, lineOf });
  }
}

const results = new Array(tasks.length);
let next = 0;
await Promise.all(
  Array.from({ length: Math.max(1, availableParallelism() - 1) }, async (_, worker) => {
    const dir = mkdtempSync(join(work, `w${worker}-`));
    while (next < tasks.length) {
      const index = next++;
      results[index] = await checkGroup(tasks[index], dir);
    }
  }),
);

const problems = results.flat();
for (const line of problems) console.log(line);
rmSync(work, { recursive: true, force: true });
if (fillSoal) console.log(`${filled} atribut input diisi dari Contoh input soal.`);
console.log(`${tasks.length} contoh diperiksa, ${problems.length} masalah.`);
process.exit(problems.length ? 1 : 0);
