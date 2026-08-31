import Link from "next/link";
import { seedDemoData } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { buttonClass, Card } from "@/components/card";
import { formatCents } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getAmericanCelebration } from "@/lib/wedding";

export const dynamic = "force-dynamic";

const sections = [
  "Foundation",
  "Guests",
  "Coverage",
  "Budget",
  "Seating",
  "Timeline",
  "Dashboard",
] as const;

export default async function Home() {
  const { wedding, celebration } = await getAmericanCelebration();
  const [guestCount, attendingCount, coverageItems, budgetLines, tasks, timelineItems] =
    await Promise.all([
      prisma.guest.count(),
      prisma.eventInvitation.count({ where: { rsvpStatus: "attending" } }),
      prisma.coverageItem.findMany({
        where: { celebrationId: celebration.id },
        orderBy: { service: "asc" },
      }),
      prisma.budgetLine.findMany({
        where: { weddingId: wedding.id },
        orderBy: { category: "asc" },
      }),
      prisma.task.findMany({
        where: { weddingId: wedding.id },
        orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }],
        take: 8,
      }),
      prisma.timelineItem.findMany({
        where: { event: { celebrationId: celebration.id } },
        orderBy: { startsAt: "asc" },
        take: 5,
      }),
    ]);

  const outsideCoverage = coverageItems.filter((item) => item.ownedBy === "outside_vendor").length;
  const tbdCoverage = coverageItems.filter((item) => item.ownedBy === "tbd").length;
  const estimatedTotal = budgetLines.reduce((sum, line) => sum + line.estimatedCents, 0);
  const actualTotal = budgetLines.reduce((sum, line) => sum + (line.actualCents ?? 0), 0);
  const openTasks = tasks.filter((task) => task.status !== "done").length;

  return (
    <AppShell>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-ink/55">Guests</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{guestCount}</p>
          <p className="mt-2 text-sm text-ink/60">{attendingCount} event RSVPs attending</p>
        </Card>
        <Card>
          <p className="text-sm text-ink/55">Coverage gaps</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{outsideCoverage}</p>
          <p className="mt-2 text-sm text-ink/60">{tbdCoverage} services still need an owner</p>
        </Card>
        <Card>
          <p className="text-sm text-ink/55">Budget</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{formatCents(estimatedTotal)}</p>
          <p className="mt-2 text-sm text-ink/60">{formatCents(actualTotal)} actual so far</p>
        </Card>
        <Card>
          <p className="text-sm text-ink/55">Checklist</p>
          <p className="mt-2 text-4xl font-semibold text-ink">{openTasks}</p>
          <p className="mt-2 text-sm text-ink/60">open priority tasks loaded</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">
                Planner sections
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">What is ready to use</h2>
            </div>
            <form action={seedDemoData}>
              <button className={buttonClass} type="submit">
                Add demo data
              </button>
            </form>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-7">
            {sections.map((section) => (
              <div className="rounded-2xl bg-linen p-4 text-sm font-medium text-ink" key={section}>
                {section}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sage">Fast links</p>
          <div className="mt-5 grid gap-3">
            {[
              ["/guests", "Add guests by name, age, gender, and side"],
              ["/coverage", "Review services the venue does not cover"],
              ["/budget", "Track estimates, actuals, and payers"],
              ["/seating", "Create tables and assign confirmed guests"],
              ["/checklist", "Manage planning tasks and chains"],
              ["/timeline", "Build the day-of run of show"],
            ].map(([href, label]) => (
              <Link className="rounded-2xl bg-linen p-4 text-sm font-medium text-ink" href={href} key={href}>
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold text-ink">Next tasks</h2>
          <div className="mt-4 divide-y divide-ink/10">
            {tasks.map((task) => (
              <div className="flex items-center justify-between gap-4 py-3" key={task.id}>
                <div>
                  <p className="font-medium text-ink">{task.title}</p>
                  <p className="text-sm text-ink/55">{task.category ?? "General"} | {task.status}</p>
                </div>
                <p className="text-sm text-ink/45">
                  {task.dueDate ? task.dueDate.toLocaleDateString("en-US") : "No date"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-ink">Upcoming timeline</h2>
          <div className="mt-4 divide-y divide-ink/10">
            {timelineItems.map((item) => (
              <div className="py-3" key={item.id}>
                <p className="font-medium text-ink">{item.title}</p>
                <p className="text-sm text-ink/55">
                  {item.startsAt.toLocaleString("en-US")} | {item.owner ?? "Unassigned"}
                </p>
              </div>
            ))}
            {timelineItems.length === 0 ? <p className="text-sm text-ink/55">No timeline yet.</p> : null}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
