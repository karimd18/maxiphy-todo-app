// src/app/layout.tsx
import './globals.css';
import Link from 'next/link';
import { cookies } from 'next/headers';
import ThemeScript from './theme-script';
import ThemeToggle from '@/components/ThemeToggle';
import { User } from '@/types';

export const metadata = { title: 'Maxiphy Todo' };

// Safe JSON that tolerates empty bodies / wrong content-type
async function safeJson<T>(res: Response): Promise<T | null> {
  if (!res.ok) return null;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text) as T; } catch { return null; }
  }
  try { return (await res.json()) as T; } catch { return null; }
}

async function getCurrentUser(token: string): Promise<User | null> {
  const base =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    '';
  const endpoint = base ? `${base}/auth/me` : `/api/auth/me`;
  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await safeJson<User>(res);
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get('token')?.value; // cookies() is sync
  const me = token ? await getCurrentUser(token) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        {/* Skip link for a11y */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-border focus:bg-bg focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>

        {/* App Header */}
        <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3">
            {/* Glass nav bar */}
            <nav className="flex items-center justify-between rounded-2xl border border-border/70 bg-bg/60 px-3 py-2 shadow-sm backdrop-blur-sm">
              {/* Brand */}
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-card/60"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-card shadow-sm">
                  <img
                    src="https://maxiphy.com/logo.svg"
                    alt="Maxiphy logo"
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                </span>
                <span className="font-semibold tracking-tight">
                  Maxiphy Todo
                </span>
              </Link>

              {/* Right side actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Primary nav */}
                <div className="hidden items-center gap-1 sm:flex">
                  {token ? (
                    <>
                      <NavLink href="/todos">Todos</NavLink>
                      <NavLink href="/profile">{me ? me.name : 'Profile'}</NavLink>
                      <form action="/api/auth/logout" method="post">
                        <button
                          className="inline-flex items-center rounded-xl border border-border bg-card px-3 py-1.5 text-sm transition hover:bg-card/70 focus:outline-none focus:ring-2 focus:ring-accent/40"
                          type="submit"
                        >
                          Logout
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <NavLink href="/login">Login</NavLink>
                      <NavLink href="/register">Register</NavLink>
                    </>
                  )}
                </div>

                {/* Theme toggle in a subtle capsule */}
                <div className="ml-1 grid place-items-center rounded-xl border border-border bg-card p-1 shadow-sm">
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main id="content" className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/80">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="inline-flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-card">
                  <img
                    src="https://maxiphy.com/logo.svg"
                    alt="Maxiphy logo"
                    className="h-4 w-4 object-contain"
                  />
                </span>
                <span className="text-sm text-muted">
                  Built with Next.js • Tailwind • JWT • Light/Dark
                </span>
              </div>
              <div className="text-xs text-muted">
                © {new Date().getFullYear()} Maxiphy
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

/* --------- Small helper component for animated nav links --------- */
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center rounded-xl px-3 py-1.5 text-sm transition hover:bg-card/60 focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      <span>{children}</span>
      {/* Animated underline using accent color without changing palette */}
      <span className="pointer-events-none absolute inset-x-2 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-accent/80 transition-transform duration-200 group-hover:scale-x-100" />
    </Link>
  );
}
