import { backendFetch } from '@/lib/serverFetch';
import { Paginated, Todo } from '@/types';
import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import TodoItem from '@/components/TodoItem';
import Button from '@/components/ui/Button';
import StatusTabs from '@/components/StatusTabs';
import SortDropdown from '@/components/SortDropdown';

function Pager({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: URLSearchParams;
}) {
  const base = Object.fromEntries(params) as Record<string, string>;
  const Btn = (p: number, label: string) => {
    const q = new URLSearchParams(base);
    q.set('page', String(p));
    return (
      <Link
        className="px-3 py-1 rounded-xl bg-card border border-border hover:bg-card/70"
        href={`/todos?${q.toString()}`}
      >
        {label}
      </Link>
    );
  };
  return (
    <div className="flex items-center gap-2">
      {page > 1 && Btn(page - 1, 'Prev')}
      <span className="text-sm text-muted">Page {page} / {totalPages || 1}</span>
      {page < totalPages && Btn(page + 1, 'Next')}
    </div>
  );
}

export default async function TodosPage({
  searchParams,
}: {
  // Next.js App Router: searchParams is async — must await
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // helper to normalize a single value from possibly string[]
  const pick = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const status   = pick('status') as 'pending' | 'active' | 'completed' | undefined;
  const q        = pick('q') ?? '';
  const sortBy   = (pick('sortBy')  ?? 'date') as string;            // 'date' | 'priority' | 'status'
  const sortDir  = (pick('sortDir') ?? 'asc') as 'asc' | 'desc';
  const page     = Number(pick('page') ?? '1');
  const pageSize = Number(pick('pageSize') ?? '10');

  // Build backend query (omit status for "All")
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  params.set('sortBy', sortBy);
  params.set('sortDir', sortDir);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const data = await backendFetch<Paginated<Todo>>(`/todos?${params.toString()}`);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs control ?status= (All/Pending/Active/Completed) */}
        <StatusTabs />

        <div className="flex items-center gap-2">
          {/* Dropdown with checkboxes for sort field + direction */}
          <SortDropdown />
          <Link href="/todos/new">
            <Button>Add Task</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SearchBox />
        <div className="card p-3 text-sm text-muted">
          Tip: Set <em>Status</em>, <em>Pin</em>, or <em>Delete</em> any task.
        </div>
      </div>

      <div className="grid gap-3">
        {data.items.length ? (
          data.items.map((t) => <TodoItem key={t.id} item={t} />)
        ) : (
          <div className="card p-6 text-sm text-muted">No tasks found.</div>
        )}
      </div>

      <div className="flex justify-end">
        <Pager
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          params={params}
        />
      </div>
    </div>
  );
}
