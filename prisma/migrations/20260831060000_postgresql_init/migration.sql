-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "partnerAName" TEXT NOT NULL,
    "partnerBName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Celebration" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "budgetCents" INTEGER,
    "venueId" TEXT,

    CONSTRAINT "Celebration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "celebrationId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "location" TEXT,
    "dressCode" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "email" TEXT,
    "phone" TEXT,
    "saveTheDateSentAt" TIMESTAMP(3),
    "inviteSentAt" TIMESTAMP(3),
    "rsvpCode" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "side" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "ageBand" TEXT NOT NULL DEFAULT 'adult',
    "isPlusOne" BOOLEAN NOT NULL DEFAULT false,
    "plusOneAllowed" BOOLEAN NOT NULL DEFAULT false,
    "dietary" TEXT,
    "notes" TEXT,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestTag" (
    "guestId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "GuestTag_pkey" PRIMARY KEY ("guestId","tagId")
);

-- CreateTable
CREATE TABLE "EventInvitation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "rsvpStatus" TEXT NOT NULL DEFAULT 'pending',
    "respondedAt" TIMESTAMP(3),
    "mealChoice" TEXT,
    "notes" TEXT,

    CONSTRAINT "EventInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'researching',
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "quoteCents" INTEGER,
    "isAllInclusive" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageInclusion" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "PackageInclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageItem" (
    "id" TEXT NOT NULL,
    "celebrationId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "ownedBy" TEXT NOT NULL DEFAULT 'tbd',
    "vendorId" TEXT,
    "notes" TEXT,

    CONSTRAINT "CoverageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVendor" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "callTime" TIMESTAMP(3),
    "role" TEXT,

    CONSTRAINT "EventVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "celebrationId" TEXT,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "estimatedCents" INTEGER NOT NULL DEFAULT 0,
    "actualCents" INTEGER,
    "vendorId" TEXT,
    "paidBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "budgetLineId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "method" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "celebrationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "bucket" TEXT,
    "dueDate" TIMESTAMP(3),
    "assignee" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "chain" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("taskId","dependsOnId")
);

-- CreateTable
CREATE TABLE "SeatingTable" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shape" TEXT NOT NULL DEFAULT 'round',
    "capacity" INTEGER NOT NULL DEFAULT 8,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "SeatingTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "guestId" TEXT,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingConstraint" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "guestAId" TEXT NOT NULL,
    "guestBId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,

    CONSTRAINT "SeatingConstraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineItem" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "owner" TEXT,
    "vendorId" TEXT,
    "notes" TEXT,

    CONSTRAINT "TimelineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingPartyMember" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "side" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "attireSize" TEXT,
    "attirePaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "WeddingPartyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT,
    "label" TEXT NOT NULL,
    "kind" TEXT,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Celebration_weddingId_kind_key" ON "Celebration"("weddingId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Household_rsvpCode_key" ON "Household"("rsvpCode");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_weddingId_label_key" ON "Tag"("weddingId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "EventInvitation_eventId_guestId_key" ON "EventInvitation"("eventId", "guestId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageInclusion_vendorId_service_key" ON "PackageInclusion"("vendorId", "service");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageItem_celebrationId_service_key" ON "CoverageItem"("celebrationId", "service");

-- CreateIndex
CREATE UNIQUE INDEX "EventVendor_eventId_vendorId_key" ON "EventVendor"("eventId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_tableId_position_key" ON "Seat"("tableId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_eventId_guestId_key" ON "Seat"("eventId", "guestId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatingConstraint_eventId_guestAId_guestBId_key" ON "SeatingConstraint"("eventId", "guestAId", "guestBId");

-- AddForeignKey
ALTER TABLE "Celebration" ADD CONSTRAINT "Celebration_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Celebration" ADD CONSTRAINT "Celebration_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestTag" ADD CONSTRAINT "GuestTag_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestTag" ADD CONSTRAINT "GuestTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvitation" ADD CONSTRAINT "EventInvitation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageInclusion" ADD CONSTRAINT "PackageInclusion_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageItem" ADD CONSTRAINT "CoverageItem_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageItem" ADD CONSTRAINT "CoverageItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVendor" ADD CONSTRAINT "EventVendor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVendor" ADD CONSTRAINT "EventVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_budgetLineId_fkey" FOREIGN KEY ("budgetLineId") REFERENCES "BudgetLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_celebrationId_fkey" FOREIGN KEY ("celebrationId") REFERENCES "Celebration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingTable" ADD CONSTRAINT "SeatingTable_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "SeatingTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingConstraint" ADD CONSTRAINT "SeatingConstraint_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingConstraint" ADD CONSTRAINT "SeatingConstraint_guestAId_fkey" FOREIGN KEY ("guestAId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingConstraint" ADD CONSTRAINT "SeatingConstraint_guestBId_fkey" FOREIGN KEY ("guestBId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineItem" ADD CONSTRAINT "TimelineItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineItem" ADD CONSTRAINT "TimelineItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeddingPartyMember" ADD CONSTRAINT "WeddingPartyMember_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
