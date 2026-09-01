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

const guestTypeRank: Record<string, number> = {
  adult: 0,
  teenager: 1,
  kid: 2,
  child: 2,
  toddler: 3,
};

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ view?: string; q?: string; side?: string }> }) {
  const { view, q, side } = await searchParams;
  const activeView = view === "guests" ? "guests" : "families";
  const search = q?.trim() ?? "";
  const normalizedSearch = search.toLocaleLowerCase();
  const activeSide = side === "aayush" || side === "grace" ? side : "all";
  const { celebration } = await getAmericanCelebration();
  const households = await prisma.household.findMany({
    orderBy: { name: "asc" },
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
  const allFamilies = households
    .filter((household) => household.kind === "family")
    .map((household) => ({
      ...household,
      guests: [...household.guests].sort((left, right) => {
        const typeDifference = (guestTypeRank[left.ageBand] ?? 99) - (guestTypeRank[right.ageBand] ?? 99);
        return typeDifference || left.firstName.localeCompare(right.firstName);
      }),
    }));
  const allGuests = households.flatMap((household) => household.guests.map((guest) => ({
    ...guest,
    familyName: household.kind === "family" ? household.name : null,
  })));
  const families = allFamilies.filter((family) => !normalizedSearch ||
    family.name.toLocaleLowerCase().includes(normalizedSearch) ||
    family.guests.some((guest) => guest.firstName.toLocaleLowerCase().includes(normalizedSearch))
  );
  const guests = allGuests.filter((guest) => {
    const matchesSearch = !normalizedSearch ||
      guest.firstName.toLocaleLowerCase().includes(normalizedSearch) ||
      guest.familyName?.toLocaleLowerCase().includes(normalizedSearch);
    const formattedSide = formatGuestSide(guest.side).toLocaleLowerCase();
    return matchesSearch && (activeSide === "all" || formattedSide === activeSide);
  });
  const statuses = allGuests.map((guest) => guest.invitations[0]?.rsvpStatus ?? "pending");
  const attending = statuses.filter((status) => status === "attending").length;
  const pending = statuses.filter((status) => status === "pending" || status === "tentative").length;
  const declined = statuses.filter((status) => status === "declined").length;
  const response = allGuests.length ? Math.round(((allGuests.length - pending) / allGuests.length) * 100) : 0;
  const ageCounts = {
    adults: allGuests.filter((guest) => guest.ageBand === "adult").length,
    teenagers: allGuests.filter((guest) => guest.ageBand === "teenager").length,
    kids: allGuests.filter((guest) => guest.ageBand === "kid" || guest.ageBand === "child").length,
    toddlers: allGuests.filter((guest) => guest.ageBand === "toddler").length,
  };

  const pageHref = (nextView: "families" | "guests", nextSide: "all" | "aayush" | "grace" = "all", nextSearch = search) => {
    const params = new URLSearchParams({ view: nextView });
    if (nextSearch) params.set("q", nextSearch);
    if (nextView === "guests" && nextSide !== "all") params.set("side", nextSide);
    return `/guests?${params.toString()}`;
  };

  const responseForm = (guest: (typeof allGuests)[number]) => guest.invitations.map((invitation) => (
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
      {[["Invited", allGuests.length], ["Attending", attending], ["Pending", pending], ["Declined", declined]].map(([label, count]) => <Card key={label}><p className="text-xs text-mist">{label}</p><p className="stat-value">{count}</p></Card>)}
    </section>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Adults", ageCounts.adults], ["Teenagers", ageCounts.teenagers], ["Kids", ageCounts.kids], ["Toddlers · 4 & under", ageCounts.toddlers]].map(([label, count]) => <Card key={label}><p className="text-xs text-mist">{label}</p><p className="stat-value">{count}</p></Card>)}
    </section>
    <Card>
      <div className="flex justify-between text-sm"><b>Response rate</b><span className="text-mist">{response}%</span></div>
      <div className="mt-3"><Progress value={response} /></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <form action="/guests" className="flex flex-1 gap-2" method="get">
          <input name="view" type="hidden" value={activeView} />
          {activeView === "guests" && activeSide !== "all" ? <input name="side" type="hidden" value={activeSide} /> : null}
          <input aria-label="Search guests and families" className={`${inputClass} bg-ivory`} defaultValue={search} name="q" placeholder="Search guests and families…" type="search" />
          <button className="rounded-xl bg-sage px-4 text-xs font-bold text-white">Search</button>
          {search ? <Link className="grid place-items-center rounded-xl border border-line bg-white px-3 text-xs font-semibold text-mist" href={pageHref(activeView, activeSide, "")}>Clear</Link> : null}
        </form>
        <div className="flex gap-2">
          <Link className={`rounded-xl px-4 py-3 text-xs font-semibold ${activeView === "families" ? "bg-ink text-white" : "bg-linen text-mist"}`} href={pageHref("families", "all")}>Families</Link>
          <Link className={`rounded-xl px-4 py-3 text-xs font-semibold ${activeView === "guests" ? "bg-ink text-white" : "bg-linen text-mist"}`} href={pageHref("guests", activeSide)}>Guests</Link>
        </div>
      </div>
      {activeView === "guests" ? <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <span className="mr-1 text-xs font-semibold text-mist">Filter by side</span>
        {([ ["all", "All"], ["aayush", "Aayush"], ["grace", "Grace"] ] as const).map(([value, label]) => <Link className={`rounded-full px-4 py-2 text-xs font-semibold ${activeSide === value ? "bg-ink text-white" : "bg-linen text-mist hover:bg-sage-light"}`} href={pageHref("guests", value)} key={value}>{label}</Link>)}
      </div> : null}
    </Card>

    {activeView === "families" ? <div className="grid gap-4 xl:grid-cols-2">
      {families.map((family) => {
        const confirmed = family.guests.filter((guest) => guest.invitations[0]?.rsvpStatus === "attending").length;
        return <Card key={family.id}>
          <div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-2xl font-semibold">{family.name}</h3><p className="mt-1 text-xs text-mist">{family.guests.length} family {family.guests.length === 1 ? "member" : "members"} · {confirmed} attending</p></div><div className="grid justify-items-end gap-2"><Badge tone={confirmed === family.guests.length ? "sage" : "gold"}>{confirmed === family.guests.length ? "Confirmed" : "Needs response"}</Badge><div className="flex flex-wrap justify-end gap-2"><Drawer label="Edit family" secondary title={`Edit ${family.name}`}><EditFamilyForm family={{ id: family.id, name: family.name, guests: family.guests.map(({ id, firstName, side, ageBand, dietary, notes }) => ({ id, firstName, side, ageBand, dietary, notes })) }} /></Drawer><Drawer label="+ Add member" secondary title="Add a family member"><AddFamilyMemberForm familyId={family.id} familyName={family.name} /></Drawer></div><DeleteControl id={family.id} kind="family" name={family.name} /></div></div>
          <div className="mt-4">{family.guests.map((guest) => <div className="row" key={guest.id}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">{guest.firstName}</p><p className="mt-1 text-xs text-mist">{formatGuestType(guest.ageBand)} · {formatGuestSide(guest.side)}{guest.invitations[0]?.mealChoice ? ` · ${guest.invitations[0].mealChoice}` : ""}</p></div><div className="grid justify-items-end gap-2"><Badge tone={guest.invitations[0]?.rsvpStatus === "attending" ? "sage" : guest.invitations[0]?.rsvpStatus === "declined" ? "danger" : "neutral"}>{guest.invitations[0]?.rsvpStatus ?? "Pending"}</Badge><DeleteControl id={guest.id} kind="guest" name={guest.firstName} /></div></div>{responseForm({ ...guest, familyName: family.name })}</div>)}</div>
        </Card>;
      })}
      {families.length === 0 ? <Card className="xl:col-span-2"><p className="py-8 text-center text-sm text-mist">No families or family members match your search.</p></Card> : null}
    </div> : <Card>
      <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-line text-[.65rem] uppercase tracking-wider text-mist"><tr><th className="pb-3">Guest</th><th>Family</th><th>Side</th><th>Ceremony RSVP</th><th>Meal</th><th>Actions</th></tr></thead><tbody>{guests.map((guest) => <tr className="border-b border-line last:border-0" key={guest.id}><td className="py-4 font-semibold">{guest.firstName}</td><td className="text-mist">{guest.familyName ?? "—"}</td><td className="text-mist">{formatGuestSide(guest.side)}</td><td><Badge tone={guest.invitations[0]?.rsvpStatus === "attending" ? "sage" : guest.invitations[0]?.rsvpStatus === "declined" ? "danger" : "neutral"}>{guest.invitations[0]?.rsvpStatus ?? "Pending"}</Badge></td><td className="capitalize text-mist">{guest.invitations[0]?.mealChoice ?? "Not selected"}</td><td><div className="grid gap-2">{responseForm(guest)}<DeleteControl id={guest.id} kind="guest" name={guest.firstName} /></div></td></tr>)}{guests.length === 0 ? <tr><td className="py-10 text-center text-sm text-mist" colSpan={6}>No guests match the current search and side filters.</td></tr> : null}</tbody></table></div>
    </Card>}
  </AppShell>;
}
