'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function buildQuery(
  sp: URLSearchParams,
  patch: Record<string, string | undefined>,
  remove: string[] = []
) {
  const q = new URLSearchParams(sp.toString());
  for (const k of remove) q.delete(k);
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) q.delete(k);
    else q.set(k, v);
  }
  q.set('page', '1'); // reset pagination when switching tabs
  return q.toString();
}

export default function StatusTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const status = sp.get('status'); // null => All

  const tabs: { key?: 'pending' | 'active' | 'completed'; label: string }[] = [
    { label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ];

  const go = (key?: 'pending' | 'active' | 'completed') => {
    const qs = key
      ? buildQuery(sp, { status: key })
      : buildQuery(sp, {}, ['status']); // drop status for All
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex gap-2">
      {tabs.map((t) => {
        const active = (t.key ?? '') === (status ?? '');
        return (
          <button
            key={t.label}
            onClick={() => go(t.key)}
            aria-pressed={active}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3 py-1 text-sm transition ${
              active
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-card border border-border hover:bg-card/70'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
