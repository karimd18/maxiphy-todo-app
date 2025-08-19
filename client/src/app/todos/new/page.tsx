'use client';

import React, { JSX, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Priority, TodoStatus } from '@/types';
import {
  Plus,
  ChevronsUpDown,
  Check,
  ArrowDown,
  Minus,
  ArrowUp,
  Circle,
  Pin,
} from 'lucide-react';

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

/* -------------------- PanelPortal (fixed hooks order) -------------------- */
function PanelPortal({
  anchor,
  open,
  onClose,
  width,
  offsetY = 8,
  children,
}: {
  anchor: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  width?: number | 'anchor';
  offsetY?: number;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Always register hooks first
  useEffect(() => {
    if (!open || !anchor) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchor.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onClose();
    };

    const onRelayout = () => onClose();

    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    window.addEventListener('scroll', onRelayout, true);
    window.addEventListener('resize', onRelayout);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('scroll', onRelayout, true);
      window.removeEventListener('resize', onRelayout);
    };
  }, [open, anchor, onClose]);

  if (typeof window === 'undefined' || !open || !anchor) return null;

  const rect = anchor.getBoundingClientRect();
  const resolvedWidth =
    width === 'anchor' || width === undefined ? rect.width : width;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + offsetY,
    left: Math.max(
      8,
      Math.min(
        rect.left,
        window.innerWidth -
          (typeof resolvedWidth === 'number' ? resolvedWidth : rect.width) -
          8
      )
    ),
    width: typeof resolvedWidth === 'number' ? resolvedWidth : rect.width,
    zIndex: 9999,
  };

  return createPortal(
    <div ref={panelRef} style={style} className="pointer-events-auto">
      {children}
    </div>,
    document.body
  );
}

/* -------------------- Priority Dropdown -------------------- */

const PRIORITY_OPTIONS: {
  value: Priority;
  label: string;
  icon: JSX.Element;
  hint: string;
}[] = [
  { value: 'LOW',    label: 'Low',    icon: <ArrowDown className="h-4 w-4" />, hint: 'Not urgent' },
  { value: 'MEDIUM', label: 'Medium', icon: <Minus className="h-4 w-4" />,     hint: 'Soon-ish' },
  { value: 'HIGH',   label: 'High',   icon: <ArrowUp className="h-4 w-4" />,   hint: 'Top priority' },
];

function PriorityDropdown({
  value,
  onChange,
  label = 'Priority',
}: {
  value: Priority;
  onChange: (v: Priority) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const current = PRIORITY_OPTIONS.find((o) => o.value === value)!;

  return (
    <div className="relative">
      <span className="text-sm text-muted">{label}</span>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 inline-flex w-full items-center justify-between rounded-xl border border-border bg-bg px-3 py-2 text-left text-sm hover:bg-card focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-accent/50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-card text-fg/80">
            {current.icon}
          </span>
          <span className="font-medium">{current.label}</span>
          <span className="text-muted">· {current.hint}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted" />
      </button>

      <PanelPortal
        anchor={btnRef.current}
        open={open}
        onClose={() => setOpen(false)}
        width="anchor"
      >
        <div className="rounded-xl border border-border bg-bg p-2 shadow-2xl">
          {PRIORITY_OPTIONS.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-card focus:bg-card',
                  active && 'ring-1 ring-accent/40'
                )}
                role="option"
                aria-selected={active}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-card text-fg/80">
                  {opt.icon}
                </span>
                <span className="flex-1">
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs text-muted">{opt.hint}</div>
                </span>
                {active && <Check className="h-4 w-4 text-accent" />}
              </button>
            );
          })}
        </div>
      </PanelPortal>
    </div>
  );
}

/* -------------------- Status Dropdown -------------------- */

const STATUS_OPTIONS: { value: TodoStatus; label: string; hint: string }[] = [
  { value: 'pending',   label: 'Pending',   hint: 'Not started' },
  { value: 'active',    label: 'Active',    hint: 'In progress' },
  { value: 'completed', label: 'Completed', hint: 'Done' },
];

function StatusDot() {
  return <Circle className="h-2.5 w-2.5 fill-current text-fg/70" />;
}

function StatusDropdown({
  value,
  onChange,
  label = 'Status',
}: {
  value: TodoStatus;
  onChange: (v: TodoStatus) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const current = STATUS_OPTIONS.find((o) => o.value === value)!;

  return (
    <div className="relative">
      <span className="text-sm text-muted">{label}</span>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 inline-flex w-full items-center justify-between rounded-xl border border-border bg-bg px-3 py-2 text-left text-sm hover:bg-card focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-accent/50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-2 py-0.5 text-xs text-fg/80">
            <StatusDot />
            {current.label}
          </span>
          <span className="text-muted">· {current.hint}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted" />
      </button>

      <PanelPortal
        anchor={btnRef.current}
        open={open}
        onClose={() => setOpen(false)}
        width="anchor"
      >
        <div className="rounded-xl border border-border bg-bg p-2 shadow-2xl">
          {STATUS_OPTIONS.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-card focus:bg-card',
                  active && 'ring-1 ring-accent/40'
                )}
                role="option"
                aria-selected={active}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-card px-2 py-0.5 text-xs text-fg/80">
                  <StatusDot />
                  {opt.label}
                </span>
                <span className="flex-1 text-xs text-muted">{opt.hint}</span>
                {active && <Check className="h-4 w-4 text-accent" />}
              </button>
            );
          })}
        </div>
      </PanelPortal>
    </div>
  );
}

/* -------------------- Page -------------------- */

export default function NewTodo() {
  const r = useRouter();
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<TodoStatus>('pending');
  const [date, setDate] = useState<string>('');
  const [pinned, setPinned] = useState(false);

  // field + server errors
  const [fieldErr, setFieldErr] = useState<{ description?: string }>({});
  const [serverErr, setServerErr] = useState('');

  function validate(): boolean {
    const next: typeof fieldErr = {};
    if (!description.trim()) next.description = 'Description is required.';
    setFieldErr(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr('');
    if (!validate()) return;

    const payload = {
      description,
      priority,
      status,
      pinned,
      date: date ? new Date(date).toISOString() : undefined,
    };

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = 'Failed to create';
      try {
        const d = await res.json();
        message = d?.message || message;
      } catch {}
      setServerErr(message);
      return;
    }
    r.replace('/todos');
  }

  const disabled = !description.trim();

  return (
    <div className="mx-auto grid max-w-md gap-4">
      <div className="card p-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Task
        </h1>

        {/* Live region for error announcements */}
        <div className="sr-only" role="status" aria-live="polite">
          {fieldErr.description ? 'Description is required.' : ''}
          {serverErr || ''}
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-4" noValidate>
          {/* Description */}
          <div className="grid gap-1">
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              aria-invalid={!!fieldErr.description}
              aria-describedby={fieldErr.description ? 'desc-error' : undefined}
              placeholder="e.g. Prepare sprint planning deck"
            />
            {fieldErr.description && (
              <p id="desc-error" className="text-xs text-red-600">{fieldErr.description}</p>
            )}
          </div>

          {/* Priority (full line) */}
          <PriorityDropdown value={priority} onChange={setPriority} />

          {/* Status (full line) */}
          <StatusDropdown value={status} onChange={setStatus} />

          {/* Date */}
          <div className="grid gap-1">
            <span className="text-sm text-muted">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="date-input rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <div className="text-xs text-muted">Optional due date.</div>
          </div>

          {/* Pin */}
          <label className="inline-flex select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="inline-flex items-center gap-1">
              <Pin className="h-4 w-4" />
              Pin to top
            </span>
          </label>

          {serverErr && <p className="text-sm text-red-600">{serverErr}</p>}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" disabled={disabled}>
              Create
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
