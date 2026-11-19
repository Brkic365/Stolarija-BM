import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { fail, json, optStr, str } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/messages {name, email, telephone, message} -> contact form
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid JSON");

  // Honeypot: real visitors never fill this hidden field
  if (optStr(body.website, 200)) return json({ ok: true });

  const name = str(body.name, 150);
  const email = str(body.email, 200);
  const telephone = optStr(body.telephone, 50);
  const message = str(body.message, 5000);

  if (!name || !email || !EMAIL_RE.test(email) || !message) {
    return fail("Molimo Vas ispravno popunite sva polja.");
  }

  const { error } = await supabaseAdmin()
    .from("messages")
    .insert({ name, email, telephone, message });

  if (error) return fail("Greška prilikom slanja poruke.", 500);
  return json({ ok: true }, 201);
}
