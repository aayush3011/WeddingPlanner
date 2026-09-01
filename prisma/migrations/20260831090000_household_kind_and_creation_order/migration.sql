-- Distinguish standalone guests from family groups and retain creation order.
ALTER TABLE "Household"
ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'family',
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Older standalone guests were stored as one-person households whose generated
-- household name matched the guest name. Preserve them as individual guests.
UPDATE "Household" AS household
SET "kind" = 'individual'
WHERE (
  SELECT COUNT(*)
  FROM "Guest" AS guest
  WHERE guest."householdId" = household."id"
) = 1
AND EXISTS (
  SELECT 1
  FROM "Guest" AS guest
  WHERE guest."householdId" = household."id"
    AND guest."firstName" = household."name"
);

CREATE INDEX "Household_weddingId_kind_createdAt_idx"
ON "Household"("weddingId", "kind", "createdAt");
