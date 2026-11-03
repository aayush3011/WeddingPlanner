# Deployment

The cheapest deployment path is a private Next.js website on a free web host plus a free hosted
Postgres database.

## Recommended low-cost setup

| Piece | Choice | Why |
|---|---|---|
| Web app | Vercel Hobby | Free for a personal private app, easiest Next.js deploy path |
| Database | Supabase Free or Neon Free Postgres | Free hosted Postgres, no server to maintain |
| Access control | Basic auth environment variables | Good enough for a two-person private planner, no paid auth service |
| Domain | Vercel preview URL first | Avoid domain cost until the app is worth sharing broadly |

Expected cost: **$0/month** while usage stays within free-tier limits.

## Current implementation target

Local development uses SQLite:

```env
DATABASE_URL="file:./dev.db"
```

Before deploying with hosted Postgres, change the Prisma datasource provider from `sqlite` to
`postgresql`, set `DATABASE_URL` to the hosted Postgres connection string, and run the initial
Prisma migration against that database.

## Required production environment variables

```env
DATABASE_URL="postgresql://..."   # pooled connection (Neon host ending in -pooler)
DIRECT_URL="postgresql://..."     # direct connection, used by prisma migrate during the build
BASIC_AUTH_USERNAME="..."
BASIC_AUTH_PASSWORD="..."
```

If `BASIC_AUTH_USERNAME` or `BASIC_AUTH_PASSWORD` is missing, password protection is disabled.
That is convenient locally but should not be used for the shared deployment.

`prisma migrate deploy` takes a Postgres advisory lock, which does not work through Neon's
connection pooler, so `DIRECT_URL` must point at the direct host (the pooled host without
`-pooler`). Without it, builds fail with `P1002 ... Timed out trying to acquire a postgres advisory lock`.

## Later upgrade path

When the guest-facing RSVP portal is added, keep the planner itself private and expose only
`/rsvp/[code]` publicly. At that point, replace shared basic auth with real user accounts or
email magic links if separate permissions become useful.
