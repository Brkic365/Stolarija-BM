# Supabase setup

The web shop, orders and contact form read and write a Supabase project. If the site shows
"Ponuda se trenutno ne može učitati", the project is most likely paused or deleted.

## Restore an existing project

1. Log into the Supabase account that owns the project (`zaaervhrwkmakgvoslio`).
2. If it says **Paused**, click **Restore project** and wait a few minutes.

## Create a new project

1. Create a project (region `eu-central-1` or `eu-west-1`).
2. Open **SQL Editor**, paste `schema.sql`, run it.
3. In **Project Settings -> API**, copy the URL and the `anon` key into Vercel env vars
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (all environments).
4. Replace the old hostname in `next.config.js` -> `images.domains` with the new
   `<ref>.supabase.co`.
5. Redeploy on Vercel, then add products again from `/admin`.

## Keep it from pausing

Free projects pause after about a week without traffic. `vercel.json` schedules a daily
call to `/api/keep-alive`, which reads one row from the `health` view. Optionally set
`CRON_SECRET` on Vercel; Vercel sends it automatically and the route then rejects
other callers.
