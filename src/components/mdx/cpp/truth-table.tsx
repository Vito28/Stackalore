import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------------- */
/* TruthTable: AND / OR / NOT for two conditions, C++ and Python notation.   */
/* ------------------------------------------------------------------------- */

const rows: [boolean, boolean][] = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
];

function Bool({ value }: { value: boolean }) {
  return (
    <span
      className={cn(
        'inline-block min-w-12 rounded px-1.5 py-0.5 text-center font-mono text-xs font-medium',
        value
          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
      )}
    >
      {value ? 'true' : 'false'}
    </span>
  );
}

export function TruthTable() {
  const headers = [
    { cpp: 'A', py: '' },
    { cpp: 'B', py: '' },
    { cpp: 'A && B', py: 'A and B' },
    { cpp: 'A || B', py: 'A or B' },
    { cpp: '!A', py: 'not A' },
  ];

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[28rem] text-sm">
        <thead className="bg-fd-muted/50">
          <tr>
            {headers.map((header) => (
              <th key={header.cpp} className="px-3 py-2 text-left font-medium text-fd-foreground">
                <code className="font-mono text-[0.8125rem]">{header.cpp}</code>
                {header.py ? (
                  <span className="block font-mono text-[0.6875rem] font-normal text-fd-muted-foreground">
                    {header.py}
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(([a, b]) => (
            <tr key={`${a}-${b}`}>
              <td className="px-3 py-2"><Bool value={a} /></td>
              <td className="px-3 py-2"><Bool value={b} /></td>
              <td className="px-3 py-2"><Bool value={a && b} /></td>
              <td className="px-3 py-2"><Bool value={a || b} /></td>
              <td className="px-3 py-2"><Bool value={!a} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
