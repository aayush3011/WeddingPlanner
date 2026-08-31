import { addBudgetLine } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { buttonClass, Card, Field, inputClass } from "@/components/card";
import { formatCents } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const { wedding } = await getAmericanCelebration();
  const lines = await prisma.budgetLine.findMany({
    where: { weddingId: wedding.id },
    orderBy: [{ category: "asc" }, { label: "asc" }],
  });
  const estimated = lines.reduce((sum, line) => sum + line.estimatedCents, 0);
  const actual = lines.reduce((sum, line) => sum + (line.actualCents ?? 0), 0);

  return (
    <AppShell>
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
            Money plan
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Add budget line</h2>
          <form action={addBudgetLine} className="mt-6 grid gap-4">
            <Field label="Category">
              <input className={inputClass} name="category" required />
            </Field>
            <Field label="Label">
              <input className={inputClass} name="label" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Estimated">
                <input className={inputClass} min="0" name="estimated" step="0.01" type="number" />
              </Field>
              <Field label="Actual">
                <input className={inputClass} min="0" name="actual" step="0.01" type="number" />
              </Field>
            </div>
            <Field label="Paid by">
              <select className={inputClass} name="paidBy">
                <option value="">Not set</option>
                <option value="us">Us</option>
                <option value="aayush_family">Aayush family</option>
                <option value="grace_family">Grace family</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea className={inputClass} name="notes" rows={3} />
            </Field>
            <button className={buttonClass} type="submit">
              Add line
            </button>
          </form>
        </Card>

        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-linen p-5">
              <p className="text-sm text-ink/55">Estimated</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{formatCents(estimated)}</p>
            </div>
            <div className="rounded-3xl bg-linen p-5">
              <p className="text-sm text-ink/55">Actual</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{formatCents(actual)}</p>
            </div>
          </div>
          <div className="mt-6 divide-y divide-ink/10">
            {lines.map((line) => (
              <div className="flex items-center justify-between gap-4 py-4" key={line.id}>
                <div>
                  <p className="font-medium text-ink">{line.label}</p>
                  <p className="text-sm text-ink/55">
                    {line.category} | {line.paidBy ?? "payer not set"}
                  </p>
                </div>
                <div className="text-right text-sm text-ink/70">
                  <p>{formatCents(line.estimatedCents)} estimated</p>
                  <p>{formatCents(line.actualCents)} actual</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
