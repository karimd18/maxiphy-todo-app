import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-black text-white hover:opacity-90 dark:bg-white dark:text-black',
  secondary: 'bg-card border border-border hover:bg-card/70',
  ghost: 'hover:bg-card/60 border border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export default function Button({ variant='primary', className='', loading, children, ...props }: Props) {
  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-medium transition duration-200 ease-emphasized ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? '…' : children}
    </button>
  );
}
