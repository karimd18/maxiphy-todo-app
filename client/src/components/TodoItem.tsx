'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Todo } from '@/types';
import {
  Pin, PinOff, Trash2, Pencil,
  Clock, PlayCircle, CheckCircle2,
  ArrowDown, Minus, ArrowUp
} from 'lucide-react';

type Props = { item: Todo };

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

/* ----- Pill components with consistent, colorful styling ----- */

function StatusPill({ status }: { status: Todo['status'] }) {
  type StatusKey = 'pending' | 'active' | 'completed';
  // ✅ normalize anything like 'PENDING' -> 'pending'
  const key: StatusKey =
    typeof status === 'string'
      ? (status.toLowerCase() as StatusKey)
      : 'pending';

  const map: Record<StatusKey, {
    bg: string; bd: string; fg: string; Icon: any; label: string;
  }> = {
    completed: {
      bg: 'bg-emerald-500/15',
      bd: 'border-emerald-500/30',
      fg: 'text-emerald-700 dark:text-emerald-300',
      Icon: CheckCircle2,
      label: 'Completed',
    },
    active: {
      bg: 'bg-sky-500/15',
      bd: 'border-sky-500/30',
      fg: 'text-sky-700 dark:text-sky-300',
      Icon: PlayCircle,
      label: 'Active',
    },
    pending: {
      bg: 'bg-amber-500/15',
      bd: 'border-amber-500/30',
      fg: 'text-amber-700 dark:text-amber-300',
      Icon: Clock,
      label: 'Pending',
    },
  };

  const cfg = map[key];

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-xs font-medium',
        cfg.bg, cfg.bd, cfg.fg
      )}
      title={`Status: ${cfg.label}`}
    >
      <cfg.Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="capitalize">{cfg.label}</span>
    </span>
  );
}

function PriorityPill({ priority }: { priority: Todo['priority'] }) {
  // (Optional) normalize in case backend ever returns lowercase
  type PriorityKey = 'LOW' | 'MEDIUM' | 'HIGH';
  const key: PriorityKey =
    typeof priority === 'string'
      ? (priority.toUpperCase() as PriorityKey)
      : 'MEDIUM';

  const map: Record<PriorityKey, {
    bg: string; bd: string; fg: string; Icon: any; label: string;
  }> = {
    HIGH: {
      bg: 'bg-rose-500/15',
      bd: 'border-rose-500/30',
      fg: 'text-rose-700 dark:text-rose-300',
      Icon: ArrowUp,
      label: 'High',
    },
    MEDIUM: {
      bg: 'bg-orange-500/15',
      bd: 'border-orange-500/30',
      fg: 'text-orange-700 dark:text-orange-300',
      Icon: Minus,
      label: 'Medium',
    },
    LOW: {
      bg: 'bg-emerald-500/15',
      bd: 'border-emerald-500/30',
      fg: 'text-emerald-700 dark:text-emerald-300',
      Icon: ArrowDown,
      label: 'Low',
    },
  };

  const cfg = map[key];

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-xs font-medium',
        cfg.bg, cfg.bd, cfg.fg
      )}
      title={`Priority: ${cfg.label}`}
    >
      <cfg.Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{cfg.label}</span>
    </span>
  );
}

/* ----- Item ----- */

export default function TodoItem({ item }: Props) {
  const [busy, setBusy] = useState(false);

  async function patch(body: any) {
    setBusy(true);
    try {
      const res = await fetch(`/api/todos/${item.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Delete this task?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/todos/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  const iconBtnBase =
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-card transition ' +
    'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60';

  const editBtn   = 'border-sky-500/30 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400';
  const pinBtnOff = 'border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400';
  const pinBtnOn  = 'border-violet-500/30 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400';
  const delBtn    = 'border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400';

  return (
    <div className="card p-4 transition hover:bg-card/80">
      <div className="flex items-start justify-between gap-3">
        {/* Left: meta + description */}
        <div className="min-w-0 flex-1">
          {/* Meta row (chips) */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={item.status} />
            <PriorityPill priority={item.priority} />

            {item.date && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted"
                title="Due date"
              >
                {new Date(item.date).toLocaleDateString()}
              </span>
            )}

            {item.pinned && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-1 text-xs text-violet-700 dark:text-violet-300"
                title="Pinned"
              >
                Pinned
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
            {item.description}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/todos/${item.id}/edit`}
            className={cx(iconBtnBase, editBtn)}
            title="Edit"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <button
            className={cx(iconBtnBase, item.pinned ? pinBtnOn : pinBtnOff)}
            onClick={() => patch({ pinned: !item.pinned })}
            disabled={busy}
            title={item.pinned ? 'Unpin' : 'Pin'}
            aria-label={item.pinned ? 'Unpin' : 'Pin'}
          >
            {item.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>

          <button
            className={cx(iconBtnBase, delBtn)}
            onClick={remove}
            disabled={busy}
            title="Delete"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
