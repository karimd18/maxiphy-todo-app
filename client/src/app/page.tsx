// src/app/page.tsx
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  ListChecks,
  Search,
  Pin,
  SlidersHorizontal,
  UserRoundCog,
  Paintbrush,
} from 'lucide-react';

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted">
      {children}
    </span>
  );
}

export default function Page() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Hero / CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-bg shadow-sm">
        {/* subtle gradient header strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-black/10 to-transparent dark:from-white/10" />
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Chip>Server Components</Chip>
            <Chip>Light / Dark</Chip>
            <Chip>Secure</Chip>
          </div>

          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            Welcome 👋
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted">
            A polished Todo app aligned with Maxiphy’s assessment: JWT auth, protected
            routes, profile settings, server components, responsive UI, and more.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/50 dark:bg-white dark:text-black"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm transition hover:bg-card/70 focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              I have an account
            </Link>
          </div>

          {/* quick highlights row */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-medium">JWT Auth</span>
              </div>
              <p className="mt-1 text-xs text-muted">HTTP-only cookie</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <div className="flex items-center gap-2 text-sm">
                <ListChecks className="h-4 w-4" />
                <span className="font-medium">Todos</span>
              </div>
              <p className="mt-1 text-xs text-muted">CRUD • Pins • Dates</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 p-3">
              <div className="flex items-center gap-2 text-sm">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-medium">Sorting</span>
              </div>
              <p className="mt-1 text-xs text-muted">Date • Priority • Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg shadow-sm">
        {/* banner */}
        <div className="h-40 bg-gradient-to-br from-black/80 to-gray-700/70 p-6 text-white dark:from-white/80 dark:to-gray-300/70 dark:text-black">
          <h2 className="text-lg font-semibold">Features</h2>
          <p className="text-sm opacity-90">
            Debounced search • Pagination • Pins • Sorting • Profile • Responsive
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-xs dark:border-black/30 dark:bg-black/10">
              App Router
            </span>
            <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-xs dark:border-black/30 dark:bg-black/10">
              Server Components
            </span>
            <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-xs dark:border-black/30 dark:bg-black/10">
              Prisma + NestJS
            </span>
          </div>
        </div>

        {/* list */}
        <ul className="grid gap-3 p-6 text-sm">
          <FeatureItem
            icon={<ShieldCheck className="h-4 w-4" />}
            text="Authentication (Register/Login) with HTTP-only cookies and protected routes"
          />
          <FeatureItem
            icon={<ListChecks className="h-4 w-4" />}
            text="Todos CRUD with date, priority (3 levels), and status (pending/active/completed)"
          />
          <FeatureItem
            icon={<Search className="h-4 w-4" />}
            text="Debounced search & pagination; intuitive Remaining/Pending/Active/Completed tabs"
          />
          <FeatureItem
            icon={<Pin className="h-4 w-4" />}
            text="Pin important tasks; quick edit and delete actions"
          />
          <FeatureItem
            icon={<SlidersHorizontal className="h-4 w-4" />}
            text="Sort by date, priority, or status with clear visual feedback"
          />
          <FeatureItem
            icon={<UserRoundCog className="h-4 w-4" />}
            text="Profile page to update name and email, plus change password"
          />
          <FeatureItem
            icon={<Paintbrush className="h-4 w-4" />}
            text="Elegant UI with light/dark themes, glass cards, and accessible focus states"
          />
        </ul>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="group flex items-start gap-3 rounded-xl border border-border bg-card/40 p-3 transition hover:bg-card/70">
      <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-border bg-card shadow-sm">
        {icon}
      </div>
      <p className="flex-1 leading-relaxed">
        {text}
      </p>
      <ArrowRight className="mt-1 h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
    </li>
  );
}
