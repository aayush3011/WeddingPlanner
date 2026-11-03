import { defineConfig } from "prisma/config";

// Migrations need Neon's direct host; the pooled one breaks Prisma's advisory lock.
// Derive it from DATABASE_URL (same host without "-pooler") unless DIRECT_URL is set.
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL.replace("-pooler.", ".");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
