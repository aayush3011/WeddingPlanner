"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  { label: "Overview", links: [["/", "Home", "⌂"]] },
  { label: "Planning", links: [["/checklist", "Checklist", "✓"], ["/guests", "Guests", "♙"], ["/budget", "Budget", "$"], ["/vendors", "Vendors", "◇"]] },
  { label: "Wedding day", links: [["/timeline", "Timeline", "↟"], ["/seating", "Seating", "○"]] },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
    <aside className="hidden border-r border-line bg-[#f3f0e9] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <Link href="/" className="border-b border-line px-7 py-8"><p className="eyebrow">Our wedding</p><h1 className="mt-3 font-display text-[2rem] font-semibold leading-none text-ink">Aayush <span className="italic text-blush">& Grace</span></h1><p className="mt-2 text-xs text-mist">Private planning studio</p></Link>
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">{groups.map((group) => <div key={group.label}><p className="px-3 text-[.62rem] font-bold uppercase tracking-[.2em] text-mist/65">{group.label}</p><div className="mt-2 space-y-1">{group.links.map(([href, label, icon]) => { const active = pathname === href; return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-mist hover:bg-white/60 hover:text-ink"}`}><span className={`grid h-6 w-6 place-items-center rounded-lg text-xs ${active ? "bg-sage text-white" : "bg-white/70"}`}>{icon}</span>{label}</Link>; })}</div></div>)}</nav>
      <div className="m-4 border-t border-line px-3 pt-5"><p className="font-display text-xl text-ink">June 12 · 2027</p><p className="mt-1 text-xs text-mist">California · American Wedding</p><form action="/api/auth/logout" method="post"><button className="mt-4 text-xs font-semibold text-mist hover:text-ink">Sign out →</button></form></div>
    </aside>
    <main className="min-w-0 px-4 pb-24 pt-6 sm:px-7 lg:px-10 lg:pb-10 lg:pt-9 xl:px-14"><div className="mx-auto max-w-[92rem] space-y-7">{children}</div></main>
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">{[["/", "Home", "⌂"], ["/checklist", "Tasks", "✓"], ["/guests", "Guests", "♙"], ["/budget", "Budget", "$"], ["/vendors", "More", "••"]].map(([href, label, icon]) => <Link key={label} href={href} className={`grid justify-items-center gap-1 rounded-lg py-1 text-[.62rem] font-semibold ${pathname === href ? "text-sage-dark" : "text-mist"}`}><span className="text-base">{icon}</span>{label}</Link>)}</nav>
  </div>;
}
