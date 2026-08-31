export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-white/80 bg-white/80 p-6 shadow-lg shadow-ink/5 ${className}`}>
      {children}
    </section>
  );
}

export function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink/75">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none ring-blush/40 transition focus:ring-4";

export const buttonClass =
  "rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/85";
