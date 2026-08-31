"use client";

import { useState } from "react";

export function DrawerClient({ label, title, children, secondary = false }: { label: string; title: string; children: React.ReactNode; secondary?: boolean }) {
  const [open, setOpen] = useState(false);
  const triggerClass = secondary
    ? "inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-sage-light"
    : "inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sage";

  return <>
    <button className={triggerClass} onClick={() => setOpen(true)} type="button">{label}</button>
    {open ? <div className="fixed inset-0 z-40">
      <button aria-label="Close drawer" className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" onClick={() => setOpen(false)} type="button" />
      <aside className="absolute bottom-0 right-0 top-0 w-full max-w-xl bg-ivory shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div><p className="eyebrow">Guest details</p><h3 className="mt-1 font-display text-3xl font-semibold">{title}</h3></div>
          <button className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-mist hover:text-ink" onClick={() => setOpen(false)} type="button">Close ×</button>
        </div>
        <div className="h-[calc(100vh-5.6rem)] overflow-y-auto p-6">{children}</div>
      </aside>
    </div> : null}
  </>;
}
