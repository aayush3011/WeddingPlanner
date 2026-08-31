# Plan — American Wedding

## 1. Why we're building instead of reusing

Searched GitHub and the commercial landscape before writing any code.

| Repo | Stars | Why not |
|---|---|---|
| `wedding-planner-app/wedding-planner` | 25 | Student "major project", stale, no real data model |
| `restylianos/bulma-wedding-planner-template` | 21 | Static HTML template, not an app |
| `nonomu/Wedding-Planner` | 12 | Vendor-marketplace concept, abandoned |
| `Soccerbeats/weddingwebsite` | 2 | A *wedding website*, not a planner; non-standard license |
| `streambinder/foedus` | 0 | Go, single-wedding site, GPL-3.0 (viral) |
| `RajwanYair/Wedding` | 0 | Vanilla JS PWA, Hebrew-first, Google Sheets as the database |
| `jrga03/wedding-dashboard` | 0 | Closest on features, but **no license** — legally unusable |
| LibreWeddingPlanner (Codeberg) | — | Rails + Next split, heavy, hard to extend |

Nothing above ~25 stars. All hobby or coursework projects, and every one of them assumes a
single-day Western wedding — the one assumption we can't afford, since an Indian celebration
follows. Forking any of them costs more than starting clean.

Ideas worth borrowing from the commercial tools: Zola's budget clarity, WeddingWire's
drag-and-drop seating, Joy's guest data capture, The Knot's vendor pipeline.

## 2. What makes this wedding different

The venue is **all-inclusive** — food, furniture, decor, and its own vendor network. That
removes most of what generic planners are built for. There is no vendor hunt across forty
florists. There is one large venue contract, and a short list of things the package doesn't
touch.

So the app is not organized around "manage your vendors." It's organized around
**coverage**: for every standard wedding service, who owns it — the venue package, an outside
vendor we book, ourselves, or nobody because we don't need it.

Five services are confirmed gaps. They are the product.

## 3. The five gaps

### 📸 Photographer

Book 9–12 months out; good ones go early. Deposit is typically 30–50% to hold the date.

**Compare on:**
- Style — documentary, editorial, fine-art film, or traditional posed
- Coverage hours, and whether a second shooter is included
- Engagement session and album included or à la carte
- Videographer bundled or separate

**Contract terms that actually matter** (and that people forget to ask about):
- Number of edited images delivered, and turnaround time (6–10 weeks is normal)
- Print and usage rights — can we print, post, and share freely?
- Raw file policy
- Backup-shooter clause if they fall ill
- Vendor meal requirement, and the overtime rate

**Downstream effects:** the *first look* decision restructures the entire day-of timeline,
and golden hour dictates when we step away from the reception. The family formal shot list
is a real deliverable we owe them before the day.

### 💍 Officiant

**Type** — religious officiant, civil (judge or justice of the peace), or a friend ordained
online. Each has different paperwork.

**Ceremony deliverables:** script, vow format (written or traditional), readings and who
delivers them, any unity ritual, processional and recessional order, and the pronouncement.
Confirm whether they attend the rehearsal.

**The marriage license chain** — the highest-risk item in the whole plan, because it's a
*window*, not a deadline. Apply too early and it expires; too late and the waiting period
hasn't cleared. State-specific, and it needs to be modeled as a dated chain:

1. Where to apply (county clerk) and whether both parties must appear
2. ID and documentation requirements
3. Waiting period between issue and ceremony — 0 days in many states, up to several elsewhere
4. Validity window — commonly 30–90 days, so there's an earliest *and* latest apply date
5. Witness count required at signing
6. Who files it afterward, and by when
7. Certified copies ordered — needed for any name change

### 💄 Hair & makeup

This is the **first thing that happens on the wedding day**, and it's scheduled backwards
from the ready-by time. Getting it wrong makes the couple late to their own ceremony.

- **Trial** — usually 1–3 months out, billed separately. Pairing it with engagement photos
  is efficient.
- **Headcount** drives everything: bride, bridesmaids, mothers, grandmothers. Budget roughly
  45–75 minutes of hair and 45–60 of makeup per person.
- **Artist count** sets the parallelism. Total time ≈ (people × minutes per service) ÷ artists.
- On-site vs. salon, travel fee, parking
- Add-ons: airbrush, lashes, extensions, touch-up kit, and whether an artist stays through
  the ceremony
- Who pays — the couple usually covers their own; attendants often cover theirs

**Feature:** given a ready-by time, the headcount, and the number of artists, generate the
getting-ready schedule and push it straight into the day-of timeline.

### 👗 Attire

The longest lead-time item in the entire plan, and the one most likely to blow up quietly.
Everything reverse-plans from the wedding date.

- **Gown:** 6–9 months to order (some designers 9–12), then 2–3 alterations across 2–3 months,
  with the final fitting 2–4 weeks out. Bring the actual shoes and undergarments to every fitting.
- **Accessories:** veil, shoes, jewelry, undergarments
- **Suit or tux:** buy vs. rent. Rentals have pickup and return dates that land in the chaos
  window; custom runs 8–12 weeks
- **Wedding party:** colors, sizes, order deadline, and who pays
- **After:** cleaning and preservation

**Feature:** a deadline chain generated from the wedding date, so a slipped order date visibly
pushes every fitting after it.

### 🪑 Seat map

Blocked on RSVPs closing. Needs the venue's floor plan (table count, shapes, capacity).

- Tables with shape and capacity, positioned on a canvas
- Drag-and-drop assignment, restricted to guests who actually confirmed
- Constraints: must-sit-together and must-not-sit-together, surfaced as warnings
- **Outputs:** escort cards, place cards, the seating list the venue needs, and meal counts
  per table for the caterer

## 4. Milestones

| # | Milestone | Contents |
|---|---|---|
| M0 | Foundation | Next.js + TS scaffold, Prisma schema, seed data, app shell and nav |
| M1 | Guests & RSVP | Household → guest, sides, tags, plus-ones, age bands, meals, dietary, CSV in/out, non-responder list |
| M2 | Coverage & vendors | Coverage matrix, plus tracking for the five gaps with quote comparison |
| M3 | Budget | Venue contract as anchor line, payment/deposit schedule, estimated → actual → paid |
| M4 | Seat map | Tables, drag-and-drop, constraint warnings, card and meal-count exports |
| M5 | Checklist & timeline | Date-generated checklist, license and attire deadline chains, day-of run of show |
| M6 | Dashboard | Countdown, rollups, what's due next |

M1 comes before M4 because the seat map is meaningless without confirmed RSVPs.

## 5. Deliberately out of scope for now

- The Indian celebration — the schema supports it (see [`DATA-MODEL.md`](DATA-MODEL.md)),
  but no UI work until the American wedding is done
- Public guest-facing RSVP website — the `rsvpCode` field is reserved for it
- House fund / gift tracking — planned, not yet scoped
- Vendor marketplace or discovery — the venue covers this
- Multi-tenant anything. This is one couple's app.
