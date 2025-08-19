'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Input from './ui/Input';
import { Search } from 'lucide-react';

export default function SearchBox() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(sp.get('q') ?? '');

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp);
      if (q) params.set('q', q); else params.delete('q');
      params.set('page','1');
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line

  return (
    <div className="card flex items-center gap-2 p-2">
      <Search className="h-4 w-4 text-muted" />
      <Input placeholder="Search description or date…" value={q} onChange={e=>setQ(e.target.value)} className="border-none bg-transparent px-0" />
    </div>
  );
}
