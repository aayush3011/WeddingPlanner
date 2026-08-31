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
    update: {},
    create: {
      id: "default-wedding",
      partnerAName: "Partner A",
      partnerBName: "Partner B",
    },
  });

  const celebration = await prisma.celebration.upsert({
    where: {
      weddingId_kind: {
        weddingId: wedding.id,
        kind: "american",
      },
    },
    update: {},
    create: {
      weddingId: wedding.id,
      kind: "american",
      name: "American Wedding",
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
    prisma.budgetLine.upsert({
      where: { id: "budget-venue" },
      update: {},
      create: {
        id: "budget-venue",
        weddingId: wedding.id,
        celebrationId: celebration.id,
        category: "venue",
        label: "Venue package",
        estimatedCents: 0,
      },
    }),
    prisma.budgetLine.upsert({
      where: { id: "budget-photography" },
      update: {},
      create: {
        id: "budget-photography",
        weddingId: wedding.id,
        celebrationId: celebration.id,
        category: "photography",
        label: "Photography",
        estimatedCents: 0,
      },
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
