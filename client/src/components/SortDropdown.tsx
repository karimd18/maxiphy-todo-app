'use client';

import { usePathname, useRouter, useSearchParams, ReadonlyURLSearchParams } from 'next/navigation';

function buildQuery(
  sp: ReadonlyURLSearchParams,
  patch: Record<string, string | undefined>
) {
  const q = new URLSearchParams(sp.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) q.delete(k);
    else q.set(k, v);
  }
  q.set('page', '1');
  const s = q.toString();
  return s ? `?${s}` : '';
}

export default function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const currentBy  = (sp.get('sortBy')  ?? 'date') as 'date' | 'priority' | 'status';
  const currentDir = (sp.get('sortDir') ?? 'asc')  as 'asc' | 'desc';

  const options: { key: 'date'|'priority'|'status'; label: string }[] = [
    { key: 'date',     label: 'Date' },
    { key: 'priority', label: 'Priority' },
    { key: 'status',   label: 'Status' },
  ];

  const selectBy = (key: 'date'|'priority'|'status') => {
    const qs = buildQuery(sp, { sortBy: key });
    router.push(`${pathname}${qs}`);
  };

  const toggleDir = () => {
    const next = currentDir === 'asc' ? 'desc' : 'asc';
    const qs = buildQuery(sp, { sortDir: next });
    router.push(`${pathname}${qs}`);
  };

  return (
    <div className="relative z-[100] overflow-visible">
      <details className="relative">
        <summary
          className="cursor-pointer select-none rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-card/70"
          role="button"
          aria-haspopup="menu"
        >
          Sort
        </summary>

        {/* Panel */}
        <div
          className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-bg p-3 shadow-2xl z-[110] backdrop-blur-sm"
          role="menu"
        >
          <div className="px-1 pb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Sort by
          </div>

          <ul className="space-y-1">
            {options.map((opt) => {
              const checked = currentBy === opt.key;
              return (
                <li key={opt.key}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-card">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={() => selectBy(opt.key)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="my-3 h-px bg-border" />

          <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-card">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={currentDir === 'desc'}
              onChange={toggleDir}
            />
            <span className="text-sm">Descending</span>
          </label>
        </div>
      </details>
    </div>
  );
}
