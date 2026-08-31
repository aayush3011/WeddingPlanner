import { addVendor } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { buttonClass, Card, Field, inputClass } from "@/components/card";
import { formatCents } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const { wedding } = await getAmericanCelebration();
  const vendors = await prisma.vendor.findMany({
    where: { weddingId: wedding.id },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <AppShell>
      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
            Vendor tracking
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Add vendor</h2>
          <form action={addVendor} className="mt-6 grid gap-4">
            <Field label="Name">
              <input className={inputClass} name="name" required />
            </Field>
            <Field label="Category">
              <input className={inputClass} name="category" placeholder="photography" required />
            </Field>
            <Field label="Status">
              <select className={inputClass} name="status" defaultValue="researching">
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="booked">Booked</option>
                <option value="passed">Passed</option>
              </select>
            </Field>
            <Field label="Quote">
              <input className={inputClass} min="0" name="quote" step="0.01" type="number" />
            </Field>
            <Field label="Contact">
              <input className={inputClass} name="contactName" />
            </Field>
            <Field label="Email">
              <input className={inputClass} name="email" type="email" />
            </Field>
            <Field label="Phone">
              <input className={inputClass} name="phone" />
            </Field>
            <Field label="Website">
              <input className={inputClass} name="website" type="url" />
            </Field>
            <Field label="Notes">
              <textarea className={inputClass} name="notes" rows={3} />
            </Field>
            <button className={buttonClass} type="submit">
              Add vendor
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-3xl font-semibold text-ink">Vendor pipeline</h2>
          <div className="mt-6 grid gap-4">
            {vendors.map((vendor) => (
              <article className="rounded-3xl bg-linen p-5" key={vendor.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-ink">{vendor.name}</p>
                    <p className="text-sm capitalize text-ink/55">
                      {vendor.category.replace("_", " ")} | {vendor.status}
                    </p>
                  </div>
                  <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink">
                    {formatCents(vendor.quoteCents)}
                  </p>
                </div>
                <p className="mt-3 text-sm text-ink/60">{vendor.notes ?? "No notes yet."}</p>
              </article>
            ))}
            {vendors.length === 0 ? <p className="text-sm text-ink/55">No vendors yet.</p> : null}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
