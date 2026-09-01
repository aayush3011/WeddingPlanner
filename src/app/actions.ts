"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatCents, optionalString, parseCents, parseOptionalDate, requiredString } from "@/lib/format";
import { getAmericanCelebration } from "@/lib/wedding";

function refresh(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function addGuest(formData: FormData) {
  const { wedding, celebration } = await getAmericanCelebration();
  const householdName =
    optionalString(formData.get("householdName")) ??
    requiredString(formData.get("firstName"), "First name");
  await prisma.$transaction(async (tx) => {
    const household = await tx.household.create({
      data: {
        weddingId: wedding.id,
        name: householdName,
        rsvpCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
      },
    });

    const guest = await tx.guest.create({
      data: {
        householdId: household.id,
        firstName: requiredString(formData.get("firstName"), "First name"),
        lastName: "",
        side: requiredString(formData.get("side"), "Side"),
        ageBand: requiredString(formData.get("ageBand"), "Age band"),
        dietary: optionalString(formData.get("dietary")),
        notes: optionalString(formData.get("notes")),
      },
    });

    const ceremonyEvents = celebration.events.filter((event) => event.kind === "ceremony");
    await tx.eventInvitation.createMany({
      data: ceremonyEvents.map((event) => ({
        eventId: event.id,
        guestId: guest.id,
        rsvpStatus: "pending",
      })),
    });
  });

  refresh(["/", "/guests", "/seating"]);
}

export async function addFamily(formData: FormData) {
  const { wedding, celebration } = await getAmericanCelebration();
  const firstNames = formData.getAll("firstName");
  const sides = formData.getAll("side");
  const ageBands = formData.getAll("ageBand");
  const dietary = formData.getAll("dietary");

  if (firstNames.length === 0) throw new Error("Add at least one family member");

  await prisma.$transaction(async (tx) => {
    const family = await tx.household.create({
      data: {
        weddingId: wedding.id,
        name: requiredString(formData.get("familyName"), "Family name"),
        rsvpCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
      },
    });

    for (let index = 0; index < firstNames.length; index += 1) {
      const guest = await tx.guest.create({
        data: {
          householdId: family.id,
          firstName: requiredString(firstNames[index], "First name"),
          lastName: "",
          side: requiredString(sides[index], "Side"),
          ageBand: requiredString(ageBands[index], "Guest type"),
          dietary: optionalString(dietary[index]),
        },
      });

      const ceremonyEvents = celebration.events.filter((event) => event.kind === "ceremony");
      await tx.eventInvitation.createMany({
        data: ceremonyEvents.map((event) => ({
          eventId: event.id,
          guestId: guest.id,
          rsvpStatus: "pending",
        })),
      });
    }
  });

  refresh(["/", "/guests", "/seating"]);
}

export async function removeGuest(formData: FormData) {
  const guestId = requiredString(formData.get("guestId"), "Guest");
  await prisma.$transaction([
    prisma.seat.updateMany({ where: { guestId }, data: { guestId: null } }),
    prisma.guest.delete({ where: { id: guestId } }),
  ]);
  refresh(["/", "/guests", "/seating"]);
}

export async function removeFamily(formData: FormData) {
  const familyId = requiredString(formData.get("familyId"), "Family");
  const members = await prisma.guest.findMany({ where: { householdId: familyId }, select: { id: true } });
  const guestIds = members.map((member) => member.id);
  await prisma.$transaction([
    prisma.seat.updateMany({ where: { guestId: { in: guestIds } }, data: { guestId: null } }),
    prisma.household.delete({ where: { id: familyId } }),
  ]);
  refresh(["/", "/guests", "/seating"]);
}

export async function updateInvitation(formData: FormData) {
  await prisma.eventInvitation.update({
    where: {
      id: requiredString(formData.get("invitationId"), "Invitation"),
    },
    data: {
      rsvpStatus: requiredString(formData.get("rsvpStatus"), "RSVP status"),
      mealChoice: optionalString(formData.get("mealChoice")),
      respondedAt: new Date(),
    },
  });

  refresh(["/", "/guests", "/seating"]);
}

export async function updateCoverage(formData: FormData) {
  await prisma.coverageItem.update({
    where: {
      id: requiredString(formData.get("coverageId"), "Coverage item"),
    },
    data: {
      ownedBy: requiredString(formData.get("ownedBy"), "Owner"),
      notes: optionalString(formData.get("notes")),
    },
  });

  refresh(["/", "/coverage"]);
}

export async function addVendor(formData: FormData) {
  const { wedding } = await getAmericanCelebration();

  await prisma.vendor.create({
    data: {
      weddingId: wedding.id,
      name: requiredString(formData.get("name"), "Name"),
      category: requiredString(formData.get("category"), "Category"),
      status: requiredString(formData.get("status"), "Status"),
      contactName: optionalString(formData.get("contactName")),
      email: optionalString(formData.get("email")),
      phone: optionalString(formData.get("phone")),
      website: optionalString(formData.get("website")),
      quoteCents: parseCents(formData.get("quote")),
      notes: optionalString(formData.get("notes")),
    },
  });

  refresh(["/", "/vendors", "/coverage", "/budget"]);
}

export async function addBudgetLine(formData: FormData) {
  const { wedding, celebration } = await getAmericanCelebration();

  await prisma.budgetLine.create({
    data: {
      weddingId: wedding.id,
      celebrationId: celebration.id,
      category: requiredString(formData.get("category"), "Category"),
      label: requiredString(formData.get("label"), "Label"),
      estimatedCents: parseCents(formData.get("estimated")),
      actualCents: parseCents(formData.get("actual")),
      paidBy: optionalString(formData.get("paidBy")),
      notes: optionalString(formData.get("notes")),
    },
  });

  refresh(["/", "/budget"]);
}

export async function addTask(formData: FormData) {
  const { wedding, celebration } = await getAmericanCelebration();

  await prisma.task.create({
    data: {
      weddingId: wedding.id,
      celebrationId: celebration.id,
      title: requiredString(formData.get("title"), "Title"),
      category: optionalString(formData.get("category")),
      bucket: optionalString(formData.get("bucket")),
      dueDate: parseOptionalDate(formData.get("dueDate")),
      assignee: optionalString(formData.get("assignee")),
      chain: optionalString(formData.get("chain")),
      description: optionalString(formData.get("description")),
    },
  });

  refresh(["/", "/checklist"]);
}

export async function updateTaskStatus(formData: FormData) {
  await prisma.task.update({
    where: {
      id: requiredString(formData.get("taskId"), "Task"),
    },
    data: {
      status: requiredString(formData.get("status"), "Status"),
    },
  });

  refresh(["/", "/checklist"]);
}

export async function addTable(formData: FormData) {
  const eventId = requiredString(formData.get("eventId"), "Event");
  const capacity = Number(requiredString(formData.get("capacity"), "Capacity"));

  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new Error("Capacity must be a positive whole number");
  }

  const table = await prisma.seatingTable.create({
    data: {
      eventId,
      name: requiredString(formData.get("name"), "Name"),
      shape: requiredString(formData.get("shape"), "Shape"),
      capacity,
    },
  });

  await prisma.seat.createMany({
    data: Array.from({ length: capacity }, (_, index) => ({
      tableId: table.id,
      eventId,
      position: index + 1,
    })),
  });

  refresh(["/", "/seating"]);
}

export async function assignSeat(formData: FormData) {
  const guestId = optionalString(formData.get("guestId"));

  await prisma.seat.update({
    where: {
      id: requiredString(formData.get("seatId"), "Seat"),
    },
    data: {
      guestId,
    },
  });

  refresh(["/", "/seating"]);
}

export async function addTimelineItem(formData: FormData) {
  await prisma.timelineItem.create({
    data: {
      eventId: requiredString(formData.get("eventId"), "Event"),
      startsAt: parseOptionalDate(formData.get("startsAt")) ?? new Date(),
      durationMinutes: Number(optionalString(formData.get("durationMinutes")) ?? 0) || null,
      title: requiredString(formData.get("title"), "Title"),
      location: optionalString(formData.get("location")),
      owner: optionalString(formData.get("owner")),
      notes: optionalString(formData.get("notes")),
    },
  });

  refresh(["/", "/timeline"]);
}

export async function seedDemoData() {
  const { wedding, celebration } = await getAmericanCelebration();
  const existingGuestCount = await prisma.guest.count();

  if (existingGuestCount === 0) {
    await prisma.$transaction(async (tx) => {
      const samples = [
        ["Aayush Family", "Aarav", "Kataria", 32, "male", "aayush"],
        ["Grace Family", "Mia", "Johnson", 29, "female", "grace"],
        ["Shared Friends", "Sam", "Lee", 30, "non_binary", "both"],
      ] as const;

      for (const [householdName, firstName, lastName, age, gender, side] of samples) {
        const household = await tx.household.create({
          data: {
            weddingId: wedding.id,
            name: householdName,
            rsvpCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
          },
        });

        const guest = await tx.guest.create({
          data: {
            householdId: household.id,
            firstName,
            lastName,
            age,
            gender,
            side,
          },
        });

        await tx.eventInvitation.createMany({
          data: celebration.events.map((event) => ({
            eventId: event.id,
            guestId: guest.id,
            rsvpStatus: firstName === "Sam" ? "attending" : "pending",
          })),
        });
      }
    });
  }

  const existingTimelineCount = await prisma.timelineItem.count();

  if (existingTimelineCount === 0) {
    const ceremony = celebration.events.find((event) => event.kind === "ceremony");

    if (ceremony) {
      await prisma.timelineItem.createMany({
        data: [
          {
            eventId: ceremony.id,
            startsAt: new Date("2027-10-02T21:00:00.000Z"),
            durationMinutes: 30,
            title: "Ceremony",
            owner: "Officiant",
          },
          {
            eventId: ceremony.id,
            startsAt: new Date("2027-10-02T22:00:00.000Z"),
            durationMinutes: 60,
            title: "Family photos",
            owner: "Photographer",
          },
        ],
      });
    }
  }

  console.log(`Seeded demo planner data. Current spend estimate: ${formatCents(0)}.`);
  refresh(["/", "/guests", "/seating", "/timeline"]);
}
