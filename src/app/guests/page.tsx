import Link from "next/link";
import { updateInvitation } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, Drawer, inputClass, PageHeader, Progress } from "@/components/card";
import { AddFamilyForm, AddFamilyMemberForm, AddGuestForm, EditFamilyForm } from "@/components/guest-forms";
import { DeleteControl } from "@/components/delete-control";
import { formatGuestSide, formatGuestType } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const activeView = view === "guests" ? "guests" : "families";
  const { celebration } = await getAmericanCelebration();
  const households = await prisma.household.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      guests: {
        orderBy: { firstName: "asc" },
        include: {
          invitations: {
            where: { event: { celebrationId: celebration.id, kind: "ceremony" } },
            include: { event: true },
            orderBy: { event: { sortOrder: "asc" } },
          },
        },
      },
    },
  });
  const families = households.filter((household) => household.kind === "family");
  const guests = households.flatMap((household) => household.guests.map((guest) => ({
    ...guest,
    familyName: household.kind === "family" ? household.name : null,
  })));
  const statuses = guests.map((guest) => guest.invitations[0]?.rsvpStatus ?? "pending");
  const attending = statuses.filter((status) => status === "attending").length;
  const pending = statuses.filter((status) => status === "pending" || status === "tentative").length;
  const declined = statuses.filter((status) => status === "declined").length;
  const response = guests.length ? Math.round(((guests.length - pending) / guests.length) * 100) : 0;

  const responseForm = (guest: (typeof guests)[number]) => guest.invitations.map((invitation) => (
    <details className="mt-3" key={invitation.id}>
      <summary className="text-xs font-semibold text-sage-dark">Update {invitation.event.name} response</summary>
      <form action={updateInvitation} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input name="invitationId" type="hidden" value={invitation.id} />
        <select className={inputClass} defaultValue={invitation.rsvpStatus} name="rsvpStatus">
          <option value="pending">Pending</option><option value="attending">Attending</option><option value="declined">Declined</option><option value="tentative">Tentative</option>
        </select>
        <select className={inputClass} defaultValue={invitation.mealChoice ?? ""} name="mealChoice">
          <option value="">Select meal</option><option value="salmon">Salmon</option><option value="chicken">Chicken</option><option value="vegetarian">Vegetarian</option>
        </select>
        <button className="rounded-xl bg-sage px-3 py-2 text-xs font-bold text-white">Save</button>
      </form>
    </details>
  ));

  return <AppShell>
    <PageHeader
      eyebrow="Guest list"
      title="Guests"
      description="Organize families together, or add individual guests coming on their own."
      action={<div className="flex flex-wrap gap-2"><Drawer label="+ Add guest" secondary title="Add one guest"><AddGuestForm /></Drawer><Drawer label="+ Add family" title="Create a family"><AddFamilyForm /></Drawer></div>}
    />
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Invited", guests.length], ["Attending", attending], ["Pending", pending], ["Declined", declined]].map(([label, count]) => <Card key={label}><p className="text-xs text-mist">{label}</p><p className="stat-value">{count}</p></Card>)}
    </section>
    <Card>
      <div className="flex justify-between text-sm"><b>Response rate</b><span className="text-mist">{response}%</span></div>
      <div className="mt-3"><Progress value={response} /></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 rounded-xl border border-line bg-ivory px-4 py-3 text-sm text-mist">⌕ Search guests and families…</div>
        <div className="flex gap-2">
          <Link className={`rounded-xl px-4 py-3 text-xs font-semibold ${activeView === "families" ? "bg-ink text-white" : "bg-linen text-mist"}`} href="/guests?view=families">Families</Link>
          <Link className={`rounded-xl px-4 py-3 text-xs font-semibold ${activeView === "guests" ? "bg-ink text-white" : "bg-linen text-mist"}`} href="/guests?view=guests">Guests</Link>
        </div>
      </div>
    </Card>

    {activeView === "families" ? <div className="grid gap-4 xl:grid-cols-2">
      {families.map((family) => {
        const confirmed = family.guests.filter((guest) => guest.invitations[0]?.rsvpStatus === "attending").length;
        return <Card key={family.id}>
          <div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-2xl font-semibold">{family.name}</h3><p className="mt-1 text-xs text-mist">{family.guests.length} family {family.guests.length === 1 ? "member" : "members"} · {confirmed} attending</p></div><div className="grid justify-items-end gap-2"><Badge tone={confirmed === family.guests.length ? "sage" : "gold"}>{confirmed === family.guests.length ? "Confirmed" : "Needs response"}</Badge><div className="flex flex-wrap justify-end gap-2"><Drawer label="Edit family" secondary title={`Edit ${family.name}`}><EditFamilyForm family={{ id: family.id, name: family.name, guests: family.guests.map(({ id, firstName, side, ageBand, dietary, notes }) => ({ id, firstName, side, ageBand, dietary, notes })) }} /></Drawer><Drawer label="+ Add member" secondary title="Add a family member"><AddFamilyMemberForm familyId={family.id} familyName={family.name} /></Drawer></div><DeleteControl id={family.id} kind="family" name={family.name} /></div></div>
          <div className="mt-4">{family.guests.map((guest) => <div className="row" key={guest.id}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">{guest.firstName}</p><p className="mt-1 text-xs text-mist">{formatGuestType(guest.ageBand)} · {formatGuestSide(guest.side)}{guest.invitations[0]?.mealChoice ? ` · ${guest.invitations[0].mealChoice}` : ""}</p></div><div className="grid justify-items-end gap-2"><Badge tone={guest.invitations[0]?.rsvpStatus === "attending" ? "sage" : guest.invitations[0]?.rsvpStatus === "declined" ? "danger" : "neutral"}>{guest.invitations[0]?.rsvpStatus ?? "Pending"}</Badge><DeleteControl id={guest.id} kind="guest" name={guest.firstName} /></div></div>{responseForm({ ...guest, familyName: family.name })}</div>)}</div>
        </Card>;
      })}
    </div> : <Card>
      <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-line text-[.65rem] uppercase tracking-wider text-mist"><tr><th className="pb-3">Guest</th><th>Family</th><th>Side</th><th>Ceremony RSVP</th><th>Meal</th><th>Actions</th></tr></thead><tbody>{guests.map((guest) => <tr className="border-b border-line last:border-0" key={guest.id}><td className="py-4 font-semibold">{guest.firstName}</td><td className="text-mist">{guest.familyName ?? "—"}</td><td className="text-mist">{formatGuestSide(guest.side)}</td><td><Badge tone={guest.invitations[0]?.rsvpStatus === "attending" ? "sage" : guest.invitations[0]?.rsvpStatus === "declined" ? "danger" : "neutral"}>{guest.invitations[0]?.rsvpStatus ?? "Pending"}</Badge></td><td className="capitalize text-mist">{guest.invitations[0]?.mealChoice ?? "Not selected"}</td><td><div className="grid gap-2">{responseForm(guest)}<DeleteControl id={guest.id} kind="guest" name={guest.firstName} /></div></td></tr>)}</tbody></table></div>
    </Card>}
  </AppShell>;
}
