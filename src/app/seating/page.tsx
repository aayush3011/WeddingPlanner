import { addTable, assignSeat } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { buttonClass, Card, Field, inputClass } from "@/components/card";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function SeatingPage() {
  const { celebration } = await getAmericanCelebration();
  const [events, attendingGuests, tables] = await Promise.all([
    prisma.event.findMany({
      where: { celebrationId: celebration.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.guest.findMany({
      where: {
        invitations: {
          some: {
            rsvpStatus: "attending",
            event: {
              celebrationId: celebration.id,
            },
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.seatingTable.findMany({
      where: { event: { celebrationId: celebration.id } },
      orderBy: [{ event: { sortOrder: "asc" } }, { name: "asc" }],
      include: {
        event: true,
        seats: {
          orderBy: { position: "asc" },
          include: {
            guest: true,
          },
        },
      },
    }),
  ]);

  return (
    <AppShell>
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
            Reception layout
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Add table</h2>
          <form action={addTable} className="mt-6 grid gap-4">
            <Field label="Event">
              <select className={inputClass} name="eventId">
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Table name">
              <input className={inputClass} name="name" required />
            </Field>
            <Field label="Shape">
              <select className={inputClass} name="shape" defaultValue="round">
                <option value="round">Round</option>
                <option value="rectangle">Rectangle</option>
                <option value="head">Head</option>
                <option value="sweetheart">Sweetheart</option>
              </select>
            </Field>
            <Field label="Capacity">
              <input className={inputClass} min="1" name="capacity" required type="number" defaultValue="8" />
            </Field>
            <button className={buttonClass} type="submit">
              Add table
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-3xl font-semibold text-ink">Seat map</h2>
          <p className="mt-2 text-sm text-ink/60">
            Assign guests who have at least one attending RSVP for the American celebration.
          </p>
          <div className="mt-6 grid gap-5">
            {tables.map((table) => (
              <article className="rounded-3xl bg-linen p-5" key={table.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-ink">{table.name}</p>
                    <p className="text-sm text-ink/55">
                      {table.event.name} | {table.shape} | {table.capacity} seats
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {table.seats.map((seat) => (
                    <form action={assignSeat} className="rounded-2xl bg-white p-3" key={seat.id}>
                      <input name="seatId" type="hidden" value={seat.id} />
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                        Seat {seat.position}
                      </p>
                      <select className={`${inputClass} w-full py-2`} name="guestId" defaultValue={seat.guestId ?? ""}>
                        <option value="">Unassigned</option>
                        {attendingGuests.map((guest) => (
                          <option key={guest.id} value={guest.id}>
                            {guest.firstName} {guest.lastName}
                          </option>
                        ))}
                      </select>
                      <button className="mt-2 rounded-full bg-sage px-3 py-2 text-xs font-semibold text-white" type="submit">
                        Save
                      </button>
                    </form>
                  ))}
                </div>
              </article>
            ))}
            {tables.length === 0 ? <p className="text-sm text-ink/55">No tables yet.</p> : null}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
