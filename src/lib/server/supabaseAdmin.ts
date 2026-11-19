import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client with the service-role key. Never import this from a client component.
let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("supabaseAdmin must only be used on the server");
  }
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var"
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const BUCKET = "productImages";
