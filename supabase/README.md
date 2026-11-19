# Supabase setup

The web shop, orders and contact form read and write a Supabase project. If the site shows
"Ponuda se trenutno ne može učitati", the project is most likely paused or deleted.

## Restore an existing project

1. Log into the Supabase account that owns the project (`zaaervhrwkmakgvoslio`).
2. If it says **Paused**, click **Restore project** and wait a few minutes.

## Create a new project

1. Create a project (region `eu-central-1` or `eu-west-1`).
2. Open **SQL Editor**, paste `schema.sql`, run it.
3. In **Project Settings -> API**, copy into Vercel env vars (all environments):
   - URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY` (secret; server only, never prefix it with `NEXT_PUBLIC_`)
4. Replace the old hostname in `next.config.js` -> `images.domains` with the new
   `<ref>.supabase.co`.
5. Redeploy on Vercel, then add products again from `/admin`.

## Keep it from pausing

Free projects pause after about a week without traffic. `vercel.json` schedules a daily
call to `/api/keep-alive`, which reads one row from the `health` view. Optionally set
`CRON_SECRET` on Vercel; Vercel sends it automatically and the route then rejects
other callers.

## Existing project

Run `schema.sql` on the restored project too. It is safe to re-run and it replaces the old,
permissive table policies so the public key can only read products.

## Environment variables (Vercel)

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reading products in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin dashboard, orders, contact form, uploads (server only) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Admin login sessions |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin login (falls back to the old `USER` / `PASSWORD`) |
| `RESEND_API_KEY` | Order notification emails |
| `ORDER_NOTIFY_EMAIL` | Optional: inbox for order emails |
| `CRON_SECRET` | Optional: protects `/api/keep-alive` |

`DEV_URL` and `SECRET_KEY` are no longer used and can be deleted.
