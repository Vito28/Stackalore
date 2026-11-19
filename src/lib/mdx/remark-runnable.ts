import type { Code, Root, RootContent } from 'mdast';
import { visit } from 'unist-util-visit';

/**
 * Marks code blocks that the playground can run.
 *
 * A group of code blocks written next to each other with `tab="..."` is one
 * example in several languages. The group is runnable when its C++ block is a
 * complete program (it has `int main`); then every C++ and Python block in the
 * group gets `run="cpp"` / `run="python"` in its meta string.
 *
 * Sample input is written once on any block of the group, e.g.
 * ```cpp tab="C++" input="5\n3 1 4 1 5"
 * and copied to the other blocks so the Python tab gets the same input.
 *
 * A fragment that has `int main` but is not a complete program (it relies on
 * a function from another block) opts out with `run="none"`.
 *
 * Must run before Fumadocs' `remarkCodeTab`, which groups the blocks into tabs.
 * `parseRunMeta` turns the attributes into props on the rendered `<pre>`.
 */

const runLanguages: Record<string, RunLanguage> = {
  cpp: 'cpp',
  'c++': 'cpp',
  python: 'python',
  py: 'python',
};

export type RunLanguage = 'cpp' | 'python';

const mainFunction = /\bint\s+main\s*\(/;
const tabAttribute = /(?:^|\s)tab=(?:"[^"]*"|'[^']*')/;
const inputAttribute = /(?:^|\s)(input=(?:"[^"]*"|'[^']*'))/;
const runAttribute = /(?:^|\s)run=(?:"[^"]*"|'[^']*')/;

function runLanguage(node: Code): RunLanguage | undefined {
  return node.lang ? runLanguages[node.lang.toLowerCase()] : undefined;
}

function hasTab(node: RootContent): node is Code {
  return node.type === 'code' && tabAttribute.test(node.meta ?? '');
}

const optOut = /(?:^|\s)run=(?:"none"|'none')/;

function markGroup(group: Code[]) {
  // `run="none"` on any block marks a fragment that only looks like a program.
  if (group.some((node) => optOut.test(node.meta ?? ''))) return;
  const runnable = group.some((node) => runLanguage(node) === 'cpp' && mainFunction.test(node.value));
  if (!runnable) return;

  const input = group.map((node) => inputAttribute.exec(node.meta ?? '')?.[1]).find(Boolean);

  for (const node of group) {
    const language = runLanguage(node);
    if (!language) continue;
    let meta = node.meta ?? '';
    if (!runAttribute.test(meta)) meta += ` run="${language}"`;
    if (input && !inputAttribute.test(meta)) meta += ` ${input}`;
    node.meta = meta.trim();
  }
}

export function remarkRunnable() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!('children' in node)) return;
      const children = node.children as RootContent[];

      for (let start = 0; start < children.length; ) {
        const first = children[start];
        if (first.type !== 'code') {
          start++;
          continue;
        }
        let end = start + 1;
        if (hasTab(first)) while (end < children.length && hasTab(children[end])) end++;
        markGroup(children.slice(start, end) as Code[]);
        start = end;
      }
    });
  };
}

function readAttribute(meta: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|\\s)${name}=(?:"([^"]*)"|'([^']*)')`).exec(meta);
  return match ? (match[1] ?? match[2]) : undefined;
}

/** `\n`, `\t` and `\\` in the `input` attribute become real characters. */
function unescapeInput(value: string): string {
  return value.replace(/\\([nt\\])/g, (_, char: string) => (char === 'n' ? '\n' : char === 't' ? '\t' : '\\'));
}

/** Extra `<pre>` props for runnable blocks, merged into Fumadocs' meta parsing. */
export function parseRunMeta(meta: string): Record<string, string> {
  const run = readAttribute(meta, 'run');
  if (run !== 'cpp' && run !== 'python') return {};
  const input = readAttribute(meta, 'input');
  return input === undefined ? { 'data-run': run } : { 'data-run': run, 'data-input': unescapeInput(input) };
}
