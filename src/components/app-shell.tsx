import Link from "next/link";

const links = [
  ["/", "Dashboard"],
  ["/guests", "Guests"],
  ["/coverage", "Coverage"],
  ["/vendors", "Vendors"],
  ["/budget", "Budget"],
  ["/seating", "Seating"],
  ["/checklist", "Checklist"],
  ["/timeline", "Timeline"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10">
      <header className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-xl shadow-blush/10 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sage">American wedding</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Wedding Planner
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70">
              A shared private dashboard for guests, budget, vendors, seating, checklist, and day-of
              timing.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map(([href, label]) => (
              <Link
                className="rounded-full bg-linen px-4 py-2 text-sm font-medium text-ink transition hover:bg-blush/25"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
