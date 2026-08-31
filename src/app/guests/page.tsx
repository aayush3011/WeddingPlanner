import { addGuest, updateInvitation } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { buttonClass, Card, Field, inputClass } from "@/components/card";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const { celebration } = await getAmericanCelebration();
  const households = await prisma.household.findMany({
    orderBy: { name: "asc" },
    include: {
      guests: {
        orderBy: [{ side: "asc" }, { lastName: "asc" }],
        include: {
          invitations: {
            where: {
              event: {
                celebrationId: celebration.id,
              },
            },
            include: {
              event: true,
            },
            orderBy: {
              event: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
    },
  });

  const guests = households.flatMap((household) =>
    household.guests.map((guest) => ({
      ...guest,
      householdName: household.name,
    })),
  );

  return (
    <AppShell>
      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
            Guest details
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">Add guest</h2>
          <form action={addGuest} className="mt-6 grid gap-4">
            <Field label="Household">
              <input className={inputClass} name="householdName" placeholder="Kataria family" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <input className={inputClass} name="firstName" required />
              </Field>
              <Field label="Last name">
                <input className={inputClass} name="lastName" required />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Age">
                <input className={inputClass} min="0" name="age" type="number" />
              </Field>
              <Field label="Gender">
                <select className={inputClass} name="gender">
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Age band">
                <select className={inputClass} name="ageBand" defaultValue="adult">
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="infant">Infant</option>
                </select>
              </Field>
            </div>
            <Field label="Side">
              <select className={inputClass} name="side" required>
                <option value="aayush_groom">Aayush groom guest</option>
                <option value="grace_bride">Grace bride guest</option>
                <option value="both">Both</option>
              </select>
            </Field>
            <Field label="Dietary notes">
              <input className={inputClass} name="dietary" placeholder="Vegetarian, allergies, etc." />
            </Field>
            <Field label="Notes">
              <textarea className={inputClass} name="notes" rows={3} />
            </Field>
            <button className={buttonClass} type="submit">
              Add guest
            </button>
          </form>
        </Card>

        <Card>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">Guest list</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">{guests.length} guests</h2>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-ink/45">
                <tr>
                  <th className="py-3">Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Side</th>
                  <th>RSVP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {guests.map((guest) => (
                  <tr key={guest.id}>
                    <td className="py-4">
                      <p className="font-medium text-ink">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="text-xs text-ink/50">{guest.householdName}</p>
                    </td>
                    <td>{guest.age ?? "Unknown"}</td>
                    <td>{guest.gender?.replace("_", " ") ?? "Not set"}</td>
                    <td>{guest.side?.replace("_", " ") ?? "Not set"}</td>
                    <td>
                      <div className="grid gap-2">
                        {guest.invitations.map((invitation) => (
                          <form action={updateInvitation} className="flex gap-2" key={invitation.id}>
                            <input name="invitationId" type="hidden" value={invitation.id} />
                            <span className="w-24 text-xs text-ink/50">{invitation.event.name}</span>
                            <select className={`${inputClass} py-2`} name="rsvpStatus" defaultValue={invitation.rsvpStatus}>
                              <option value="pending">Pending</option>
                              <option value="attending">Attending</option>
                              <option value="declined">Declined</option>
                              <option value="tentative">Tentative</option>
                            </select>
                            <input className={`${inputClass} py-2`} name="mealChoice" placeholder="Meal" defaultValue={invitation.mealChoice ?? ""} />
                            <button className="rounded-full bg-sage px-3 py-2 text-xs font-semibold text-white" type="submit">
                              Save
                            </button>
                          </form>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
