import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className='', ...props }: Props) {
  return (
    <label className="grid gap-1">
      {label && <span className="text-sm text-muted">{label}</span>}
      <input
        className={`w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
