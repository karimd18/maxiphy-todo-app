'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Priority, Todo, TodoStatus } from '@/types';

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// Safe JSON helper (handles 204/empty)
async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// Normalize DB/status strings like "PENDING" -> "pending"
const normalizeStatus = (s: string | undefined | null): TodoStatus =>
  (s ?? 'pending').toString().toLowerCase() as TodoStatus;

export default function EditTodoPage() {
  const { id } = useParams<{ id: string }>();
  const r = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serverErr, setServerErr] = useState('');
  const [descErr, setDescErr] = useState<string | undefined>();
  const [notFound, setNotFound] = useState(false);

  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<TodoStatus>('pending');
  const [date, setDate] = useState<string>(''); // yyyy-mm-dd
  const [pinned, setPinned] = useState(false);

  // Load current todo via Next API proxy (server injects BACKEND_URL + auth)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/todos/${id}`, { cache: 'no-store' });
        if (res.status === 401) { r.replace('/login'); return; }
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);

        const t = (await res.json()) as Todo;
        if (!mounted) return;
        setDescription(t.description);
        setPriority(t.priority);
        setStatus(normalizeStatus(t.status as unknown as string)); // <-- normalize to lowercase
        setPinned(!!t.pinned);
        setDate(t.date ? new Date(t.date).toISOString().slice(0, 10) : '');
      } catch (e: any) {
        if (!mounted) return;
        setServerErr(e?.message || 'Failed to load item');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, r]);

  function validate(): boolean {
    let ok = true;
    setDescErr(undefined);
    if (!description.trim()) {
      setDescErr('Description is required.');
      ok = false;
    }
    return ok;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setServerErr('');
    setSaving(true);

    const payload: Partial<Todo> & {
      status?: TodoStatus;
      priority?: Priority;
      date?: string | null;
    } = {
      description,
      priority,
      status: normalizeStatus(status), // <-- always send lowercase
      pinned,
      // allow clearing
      date: date ? new Date(date).toISOString() : null,
    };

    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.status === 401) { r.replace('/login'); return; }
    if (!res.ok) {
      const d = await parseJsonSafe(res);
      setServerErr((d && (d.message || d.error)) || 'Failed to update');
      return;
    }
    r.replace('/todos');
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-6 text-sm text-muted">Loading…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card p-6">
          <h1 className="text-lg font-semibold">Task not found</h1>
          <p className="mt-2 text-sm text-muted">
            The task you’re trying to edit doesn’t exist or was removed.
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => r.replace('/todos')}>
              Back to list
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-md gap-4">
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Edit Task</h1>

        {serverErr && (
          <p className="mt-2 text-sm text-red-600">{serverErr}</p>
        )}

        <form onSubmit={onSubmit} className="mt-4 grid gap-4" noValidate>
          {/* Description */}
          <div className="grid gap-1">
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              aria-invalid={!!descErr}
              aria-describedby={descErr ? 'desc-error' : undefined}
              placeholder="Update your task"
            />
            {descErr && (
              <p id="desc-error" className="text-xs text-red-600">
                {descErr}
              </p>
            )}
          </div>

          {/* Priority */}
          <Select
            label="Priority"
            value={priority}
            onChange={(v) => setPriority(v as Priority)}
            options={[
              { value: 'LOW', label: 'LOW' },
              { value: 'MEDIUM', label: 'MEDIUM' },
              { value: 'HIGH', label: 'HIGH' },
            ]}
          />

          {/* Status */}
          <Select
            label="Status"
            value={status}
            onChange={(v) => setStatus(normalizeStatus(v))}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'active',  label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          {/* Date */}
          <label className="grid gap-1">
            <span className="text-sm text-muted">Date</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="date-input w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              {date && (
                <button
                  type="button"
                  onClick={() => setDate('')}
                  className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-muted hover:bg-card/70"
                  title="Clear date"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="text-xs text-muted">
              Leave empty to clear the due date.
            </div>
          </label>

          {/* Pin */}
          <label className="inline-flex select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Pin to top</span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => r.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
