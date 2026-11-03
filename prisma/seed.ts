import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const standardServices = [
  "venue",
  "catering",
  "bar",
  "furniture",
  "decor",
  "photography",
  "videography",
  "officiant",
  "hair_makeup",
  "attire",
  "florist",
  "music",
  "transport",
  "baker",
  "rentals",
  "seating",
] as const;

const outsideVendorServices = new Set(["photography", "officiant", "hair_makeup", "attire", "seating"]);

async function main() {
  const wedding = await prisma.wedding.upsert({
    where: { id: "default-wedding" },
    update: {
      partnerAName: "Aayush",
      partnerBName: "Grace",
    },
    create: {
      id: "default-wedding",
      partnerAName: "Aayush",
      partnerBName: "Grace",
    },
  });

  const celebration = await prisma.celebration.upsert({
    where: {
      weddingId_kind: {
        weddingId: wedding.id,
        kind: "american",
      },
    },
    update: {
      name: "American Wedding",
      date: new Date("2027-09-19T19:00:00.000Z"),
    },
    create: {
      weddingId: wedding.id,
      kind: "american",
      name: "American Wedding",
      date: new Date("2027-09-19T19:00:00.000Z"),
      timezone: "America/Los_Angeles",
    },
  });

  await prisma.event.upsert({
    where: { id: "american-ceremony" },
    update: {},
    create: {
      id: "american-ceremony",
      celebrationId: celebration.id,
      kind: "ceremony",
      name: "Ceremony",
      sortOrder: 1,
    },
  });

  await prisma.event.upsert({
    where: { id: "american-reception" },
    update: {},
    create: {
      id: "american-reception",
      celebrationId: celebration.id,
      kind: "reception",
      name: "Reception",
      sortOrder: 2,
    },
  });

  await Promise.all(
    standardServices.map((service) =>
      prisma.coverageItem.upsert({
        where: {
          celebrationId_service: {
            celebrationId: celebration.id,
            service,
          },
        },
        update: {},
        create: {
          celebrationId: celebration.id,
          service,
          ownedBy: outsideVendorServices.has(service) ? "outside_vendor" : "tbd",
        },
      }),
    ),
  );

  await Promise.all([
    // Earlier seeds added empty placeholder expenses; remove them unless they've been filled in.
    prisma.budgetLine.deleteMany({
      where: { id: { in: ["budget-venue", "budget-photography"] }, estimatedCents: 0, actualCents: null },
    }),
    prisma.task.upsert({
      where: { id: "task-book-photographer" },
      update: {},
      create: {
        id: "task-book-photographer",
        weddingId: wedding.id,
        celebrationId: celebration.id,
        title: "Book photographer",
        category: "photography",
        bucket: "9_12_months",
        sortOrder: 1,
      },
    }),
    prisma.task.upsert({
      where: { id: "task-research-officiant" },
      update: {},
      create: {
        id: "task-research-officiant",
        weddingId: wedding.id,
        celebrationId: celebration.id,
        title: "Research officiant options",
        category: "officiant",
        bucket: "9_12_months",
        sortOrder: 2,
      },
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
