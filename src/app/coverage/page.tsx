import { updateCoverage } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Card, inputClass } from "@/components/card";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function CoveragePage() {
  const { celebration } = await getAmericanCelebration();
  const coverage = await prisma.coverageItem.findMany({
    where: { celebrationId: celebration.id },
    orderBy: [{ ownedBy: "desc" }, { service: "asc" }],
  });

  return (
    <AppShell>
      <Card>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
          Venue gaps
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">Coverage matrix</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coverage.map((item) => (
            <form action={updateCoverage} className="rounded-3xl bg-linen p-5" key={item.id}>
              <input name="coverageId" type="hidden" value={item.id} />
              <p className="text-lg font-semibold capitalize text-ink">{item.service.replace("_", " ")}</p>
              <select className={`${inputClass} mt-4 w-full`} name="ownedBy" defaultValue={item.ownedBy}>
                <option value="venue_package">Venue package</option>
                <option value="outside_vendor">Outside vendor</option>
                <option value="diy">DIY</option>
                <option value="not_needed">Not needed</option>
                <option value="tbd">TBD</option>
              </select>
              <textarea className={`${inputClass} mt-3 w-full`} name="notes" rows={3} defaultValue={item.notes ?? ""} />
              <button className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white" type="submit">
                Save
              </button>
            </form>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
