import { prisma } from "@/lib/prisma";

export async function getWedding() {
  const wedding = await prisma.wedding.findFirst({
    include: {
      celebrations: {
        orderBy: {
          kind: "asc",
        },
        include: {
          events: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });

  if (!wedding) {
    throw new Error("No wedding found. Run npm run db:seed first.");
  }

  return wedding;
}

export async function getAmericanCelebration() {
  const wedding = await getWedding();
  const celebration = wedding.celebrations.find((item) => item.kind === "american");

  if (!celebration) {
    throw new Error("No American celebration found. Run npm run db:seed first.");
  }

  return { wedding, celebration };
}
