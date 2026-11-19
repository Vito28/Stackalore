/* ------------------------------------------------------------------------- */
/* MemoryBoxes: variables drawn as labelled boxes (type, value, name).       */
/* ------------------------------------------------------------------------- */

interface MemoryItem {
  name: string;
  type: string;
  value: string;
}

export function MemoryBoxes({ items, caption }: { items: MemoryItem[]; caption?: string }) {
  return (
    <figure className="not-prose my-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(5.5rem,1fr))] gap-3">
        {items.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg border bg-fd-card">
            <div className="border-b px-3 py-1.5 font-mono text-[0.6875rem] text-fd-muted-foreground">
              {item.type}
            </div>
            <div className="px-3 py-4 text-center font-mono text-lg font-semibold text-fd-foreground">
              {item.value}
            </div>
            <div className="border-t bg-fd-muted/50 px-3 py-1.5 text-center font-mono text-xs font-medium text-fd-foreground">
              {item.name}
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-center text-sm text-fd-muted-foreground">
        {caption ?? 'Setiap kotak: tipe data (atas), nilai (tengah), dan nama variabel (bawah).'}
      </figcaption>
    </figure>
  );
}
