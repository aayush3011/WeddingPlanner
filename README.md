# WeddingPlanner

A private wedding planning app for one couple with two celebrations — an **American wedding**
and an **Indian wedding**. Current focus: the American wedding.

The venue for the American wedding is all-inclusive (food, furniture, decor, and its own vendor
network), so this app is not a vendor marketplace. It exists to answer the questions the venue
*doesn't* cover:

- What do we still have to book ourselves?
- Who's coming, what are they eating, and where do they sit?
- What have we committed to spend, and what's due when?

## The five gaps

Everything else is handled by the venue package. These are ours:

| Gap | What the app does |
|---|---|
| 📸 Photographer | Compare packages on coverage hours, deliverables, and image rights |
| 💍 Officiant | Ceremony structure plus the marriage license deadline chain |
| 💄 Hair & makeup | Trial tracking and a per-person schedule that drives the day-of timeline |
| 👗 Attire | Lead times and fitting dates — the longest lead-time item in the whole plan |
| 🪑 Seat map | Drag-and-drop seating built from confirmed RSVPs |

## Stack

Next.js (App Router) · TypeScript · Prisma · SQLite locally → Postgres in production ·
Tailwind + shadcn/ui · dnd-kit for the seat map.

## Docs

- [`docs/PLAN.md`](docs/PLAN.md) — scope, the five gaps in detail, milestones
- [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — schema design and the reasoning behind it

## Status

Planning. Nothing scaffolded yet.