# Data Model

Prisma + SQLite locally, Postgres in production. Only the provider string changes.

> Verified against `prisma validate` and `prisma migrate diff` — generates 22 tables and
> 10 unique indexes cleanly. Copy the block below straight into `prisma/schema.prisma`.

## Design decisions

**1. RSVP lives on `EventInvitation`, never on `Guest`.**
The single most important choice here. An American wedding is one or two events; an Indian
wedding is three or more, each with a genuinely different guest list — Haldi is family only,
Sangeet is a party, the reception is everyone. If we put `rsvpStatus` on `Guest`, adding the
Indian celebration later becomes a painful data migration. Putting it on the join costs nothing
today, and the American UI simply doesn't render an event switcher.

**2. `Celebration` sits between `Wedding` and `Event`.**
The two celebrations have separate dates, venues, budgets, guest lists, and possibly different
payers. That's a real entity, not a tag.

**3. Money is stored as integer cents.**
No floats, no `Decimal` portability problems across SQLite and Postgres. Format at the edge.

**4. `Household` → `Guest`.**
Invitations and addresses belong to a household; RSVPs and meal choices belong to a person.
Conflating them is why guest lists get messy. `rsvpCode` lives on the household, reserved for
the public RSVP portal later.

**5. Coverage is first-class.**
With an all-inclusive venue, "who owns this service" is the central question, so `CoverageItem`
is a real table rather than a view over vendors. `PackageInclusion` records what the venue
contract actually covers, so the matrix can show gaps automatically.

**6. `Task.chain` groups reverse-planned deadlines.**
The marriage license and attire timelines are chains of dated steps where slipping one pushes
everything after it. `TaskDependency` models that ordering.

**7. `Seat` carries a denormalized `eventId`.**
So `@@unique([eventId, guestId])` can enforce one seat per guest per event at the database level
rather than in application code.

---

## Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // "postgresql" in production
  url      = env("DATABASE_URL")
}

// ---------- Core ----------

model Wedding {
  id           String   @id @default(cuid())
  partnerAName String
  partnerBName String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  celebrations Celebration[]
  households   Household[]
  guestTags    Tag[]
  vendors      Vendor[]
  budgetLines  BudgetLine[]
  tasks        Task[]
  partyMembers WeddingPartyMember[]
}

model Celebration {
  id          String    @id @default(cuid())
  weddingId   String
  wedding     Wedding   @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  kind        String    // american | indian
  name        String
  date        DateTime?
  timezone    String    @default("America/Los_Angeles")
  budgetCents Int?
  venueId     String?
  venue       Vendor?   @relation(fields: [venueId], references: [id])

  events      Event[]
  coverage    CoverageItem[]
  budgetLines BudgetLine[]
  tasks       Task[]

  @@unique([weddingId, kind])
}

model Event {
  id            String      @id @default(cuid())
  celebrationId String
  celebration   Celebration @relation(fields: [celebrationId], references: [id], onDelete: Cascade)
  kind          String      // ceremony | reception | rehearsal_dinner | sangeet | haldi
  name          String
  startsAt      DateTime?
  endsAt        DateTime?
  location      String?
  dressCode     String?
  sortOrder     Int         @default(0)

  invitations   EventInvitation[]
  eventVendors  EventVendor[]
  tables        SeatingTable[]
  seats         Seat[]
  constraints   SeatingConstraint[]
  timelineItems TimelineItem[]
}

// ---------- Guests ----------

model Household {
  id                String    @id @default(cuid())
  weddingId         String
  wedding           Wedding   @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  name              String
  addressLine1      String?
  addressLine2      String?
  city              String?
  state             String?
  postalCode        String?
  country           String    @default("USA")
  email             String?
  phone             String?
  saveTheDateSentAt DateTime?
  inviteSentAt      DateTime?
  rsvpCode          String    @unique
  notes             String?

  guests            Guest[]
}

model Guest {
  id             String    @id @default(cuid())
  householdId    String
  household      Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  firstName      String
  lastName       String
  side           String?   // partnerA | partnerB | both
  ageBand        String    @default("adult") // adult | child | infant
  isPlusOne      Boolean   @default(false)
  plusOneAllowed Boolean   @default(false)
  dietary        String?
  notes          String?

  tags         GuestTag[]
  invitations  EventInvitation[]
  seats        Seat[]
  constraintsA SeatingConstraint[] @relation("ConstraintGuestA")
  constraintsB SeatingConstraint[] @relation("ConstraintGuestB")
}

model Tag {
  id        String  @id @default(cuid())
  weddingId String
  wedding   Wedding @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  label     String
  color     String?

  guests    GuestTag[]

  @@unique([weddingId, label])
}

model GuestTag {
  guestId String
  tagId   String
  guest   Guest @relation(fields: [guestId], references: [id], onDelete: Cascade)
  tag     Tag   @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([guestId, tagId])
}

model EventInvitation {
  id          String    @id @default(cuid())
  eventId     String
  guestId     String
  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  guest       Guest     @relation(fields: [guestId], references: [id], onDelete: Cascade)
  rsvpStatus  String    @default("pending") // pending | attending | declined | tentative
  respondedAt DateTime?
  mealChoice  String?
  notes       String?

  @@unique([eventId, guestId])
}

// ---------- Vendors & coverage ----------

model Vendor {
  id             String  @id @default(cuid())
  weddingId      String
  wedding        Wedding @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  name           String
  category       String  // venue | photographer | videographer | officiant | hair_makeup | attire | florist | music | transport | baker | rentals
  status         String  @default("researching") // researching | contacted | quoted | shortlisted | booked | completed | passed
  contactName    String?
  email          String?
  phone          String?
  website        String?
  quoteCents     Int?
  isAllInclusive Boolean @default(false)
  rating         Int?
  notes          String?

  inclusions    PackageInclusion[]
  coverageItems CoverageItem[]
  eventVendors  EventVendor[]
  budgetLines   BudgetLine[]
  timelineItems TimelineItem[]
  documents     Document[]
  venueFor      Celebration[]
}

/// What an all-inclusive venue package actually covers.
model PackageInclusion {
  id       String  @id @default(cuid())
  vendorId String
  vendor   Vendor  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  service  String
  included Boolean @default(true)
  notes    String?

  @@unique([vendorId, service])
}

/// One row per standard wedding service. Drives the coverage matrix.
model CoverageItem {
  id            String      @id @default(cuid())
  celebrationId String
  celebration   Celebration @relation(fields: [celebrationId], references: [id], onDelete: Cascade)
  service       String
  ownedBy       String      @default("tbd") // venue_package | outside_vendor | diy | not_needed | tbd
  vendorId      String?
  vendor        Vendor?     @relation(fields: [vendorId], references: [id])
  notes         String?

  @@unique([celebrationId, service])
}

model EventVendor {
  id       String    @id @default(cuid())
  eventId  String
  vendorId String
  event    Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  vendor   Vendor    @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  callTime DateTime?
  role     String?

  @@unique([eventId, vendorId])
}

// ---------- Budget ----------

model BudgetLine {
  id             String       @id @default(cuid())
  weddingId      String
  wedding        Wedding      @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  celebrationId  String?
  celebration    Celebration? @relation(fields: [celebrationId], references: [id])
  category       String
  label          String
  estimatedCents Int          @default(0)
  actualCents    Int?
  vendorId       String?
  vendor         Vendor?      @relation(fields: [vendorId], references: [id])
  paidBy         String?      // us | partnerA_family | partnerB_family
  notes          String?

  payments       Payment[]
}

model Payment {
  id           String     @id @default(cuid())
  budgetLineId String
  budgetLine   BudgetLine @relation(fields: [budgetLineId], references: [id], onDelete: Cascade)
  label        String     // Deposit, Second installment, Final balance
  amountCents  Int
  dueDate      DateTime?
  paidAt       DateTime?
  method       String?
}

// ---------- Checklist ----------

model Task {
  id            String       @id @default(cuid())
  weddingId     String
  wedding       Wedding      @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  celebrationId String?
  celebration   Celebration? @relation(fields: [celebrationId], references: [id])
  title         String
  description   String?
  category      String?
  bucket        String?      // 12_plus_months | 9_12_months | 6_9_months | ... | day_of | after
  dueDate       DateTime?
  assignee      String?
  status        String       @default("pending") // pending | in_progress | done | blocked | skipped
  chain         String?      // marriage_license | attire
  sortOrder     Int          @default(0)

  dependencies TaskDependency[] @relation("Dependent")
  dependents   TaskDependency[] @relation("Blocker")
}

model TaskDependency {
  taskId      String
  dependsOnId String
  task        Task   @relation("Dependent", fields: [taskId], references: [id], onDelete: Cascade)
  dependsOn   Task   @relation("Blocker", fields: [dependsOnId], references: [id], onDelete: Cascade)

  @@id([taskId, dependsOnId])
}

// ---------- Seating ----------

model SeatingTable {
  id       String @id @default(cuid())
  eventId  String
  event    Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  name     String
  shape    String @default("round") // round | rectangle | head | sweetheart
  capacity Int    @default(8)
  x        Float  @default(0)
  y        Float  @default(0)
  rotation Float  @default(0)

  seats    Seat[]
}

model Seat {
  id       String       @id @default(cuid())
  tableId  String
  table    SeatingTable @relation(fields: [tableId], references: [id], onDelete: Cascade)
  eventId  String
  event    Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  position Int
  guestId  String?
  guest    Guest?       @relation(fields: [guestId], references: [id])

  @@unique([tableId, position])
  @@unique([eventId, guestId])
}

model SeatingConstraint {
  id       String @id @default(cuid())
  eventId  String
  event    Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  guestAId String
  guestBId String
  guestA   Guest  @relation("ConstraintGuestA", fields: [guestAId], references: [id], onDelete: Cascade)
  guestB   Guest  @relation("ConstraintGuestB", fields: [guestBId], references: [id], onDelete: Cascade)
  kind     String // together | apart

  @@unique([eventId, guestAId, guestBId])
}

// ---------- Day-of ----------

model TimelineItem {
  id              String   @id @default(cuid())
  eventId         String
  event           Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  startsAt        DateTime
  durationMinutes Int?
  title           String
  location        String?
  owner           String?
  vendorId        String?
  vendor          Vendor?  @relation(fields: [vendorId], references: [id])
  notes           String?
}

// ---------- People & files ----------

model WeddingPartyMember {
  id         String  @id @default(cuid())
  weddingId  String
  wedding    Wedding @relation(fields: [weddingId], references: [id], onDelete: Cascade)
  name       String
  role       String  // maid_of_honor | best_man | bridesmaid | groomsman | officiant | usher | flower_girl | ring_bearer | parent
  side       String?
  email      String?
  phone      String?
  attireSize String?
  attirePaid Boolean @default(false)
  notes      String?
}

model Document {
  id         String   @id @default(cuid())
  vendorId   String?
  vendor     Vendor?  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  label      String
  kind       String?  // contract | invoice | coi | license
  filePath   String
  uploadedAt DateTime @default(now())
}
```

## Seed data

On first run, seed:

- One `Wedding` and one `Celebration` of kind `american`
- Its `Event` rows — ceremony and reception
- `CoverageItem` rows for every standard service, defaulting to `tbd`, with the five known
  gaps (photography, officiant, hair & makeup, attire, seating) pre-flagged as `outside_vendor`
- The American checklist template, with `dueDate` computed backwards from the wedding date
- The marriage license and attire task chains
- Default budget categories
