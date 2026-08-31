import { addTimelineItem } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { buttonClass, Card, Field, inputClass } from "@/components/card";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const { celebration } = await getAmericanCelebration();
  const events = await prisma.event.findMany({
    where: { celebrationId: celebration.id },
    orderBy: { sortOrder: "asc" },
  });
  const items = await prisma.timelineItem.findMany({
    where: { event: { celebrationId: celebration.id } },
    orderBy: { startsAt: "asc" },
    include: {
      event: true,
    },
  });

  return (
    <AppShell>
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
            Wedding day
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Add timeline item</h2>
          <form action={addTimelineItem} className="mt-6 grid gap-4">
            <Field label="Event">
              <select className={inputClass} name="eventId">
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Start time">
              <input className={inputClass} name="startsAt" required type="datetime-local" />
            </Field>
            <Field label="Duration in minutes">
              <input className={inputClass} min="0" name="durationMinutes" type="number" />
            </Field>
            <Field label="Title">
              <input className={inputClass} name="title" required />
            </Field>
            <Field label="Location">
              <input className={inputClass} name="location" />
            </Field>
            <Field label="Owner">
              <input className={inputClass} name="owner" />
            </Field>
            <Field label="Notes">
              <textarea className={inputClass} name="notes" rows={3} />
            </Field>
            <button className={buttonClass} type="submit">
              Add item
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-3xl font-semibold text-ink">Day-of timeline</h2>
          <div className="mt-6 divide-y divide-ink/10">
            {items.map((item) => (
              <div className="grid gap-2 py-4 md:grid-cols-[10rem_1fr]" key={item.id}>
                <p className="text-sm font-semibold text-sage">{item.startsAt.toLocaleString("en-US")}</p>
                <div>
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="text-sm text-ink/55">
                    {item.event.name} | {item.durationMinutes ?? 0} min | {item.owner ?? "Unassigned"}
                  </p>
                  {item.notes ? <p className="mt-2 text-sm text-ink/65">{item.notes}</p> : null}
                </div>
              </div>
            ))}
            {items.length === 0 ? <p className="text-sm text-ink/55">No timeline yet.</p> : null}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
