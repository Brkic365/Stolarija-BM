import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Called daily by Vercel Cron (see vercel.json) so the free Supabase project never pauses
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "Supabase env vars missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("health").select("ok").limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
