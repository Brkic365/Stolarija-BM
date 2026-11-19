import { randomUUID } from "crypto";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate";
import { BUCKET, supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { fail, json, optStr, str } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const MAX_SKETCH_BYTES = 4 * 1024 * 1024;
const SKETCH_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "application/pdf": "pdf",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Where order notifications go. Set ORDER_NOTIFY_EMAIL on Vercel to the workshop's inbox.
const NOTIFY_TO = process.env.ORDER_NOTIFY_EMAIL ?? "brkic123antonio@gmail.com";

// POST /api/orders (multipart form) -> places a quote request for a product
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return fail("Invalid form");

  // Honeypot: real visitors never fill this hidden field
  if (optStr(form.get("website"), 200)) return json({ ok: true });

  const productId = Number(form.get("productId"));
  const firstName = str(form.get("first_name"), 100);
  const lastName = str(form.get("last_name"), 100);
  const email = str(form.get("email"), 200);
  const telephone = str(form.get("telephone"), 50);
  const address = str(form.get("address"), 300);
  let message = optStr(form.get("message"), 5000);

  if (
    !Number.isInteger(productId) ||
    !firstName ||
    !lastName ||
    !email ||
    !EMAIL_RE.test(email) ||
    !telephone ||
    !address
  ) {
    return fail("Molimo Vas ispravno popunite sva polja.");
  }

  let configuration: Record<string, string> | null = null;
  const rawConfig = form.get("configuration");
  if (typeof rawConfig === "string" && rawConfig.length < 5000) {
    try {
      const parsed = JSON.parse(rawConfig);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        configuration = Object.fromEntries(
          Object.entries(parsed)
            .filter(([, v]) => typeof v === "string")
            .slice(0, 30)
            .map(([k, v]) => [String(k).slice(0, 100), String(v).slice(0, 200)])
        );
      }
    } catch {
      // ignore malformed configuration
    }
  }

  const db = supabaseAdmin();

  // Price and name come from the database, never from the browser
  const { data: product, error: productError } = await db
    .from("products")
    .select("id, name, price, orders")
    .eq("id", productId)
    .single();
  if (productError || !product) return fail("Proizvod nije pronađen.", 404);

  // Optional sketch upload
  const sketch = form.get("sketch");
  if (sketch instanceof File && sketch.size > 0) {
    const ext = SKETCH_TYPES[sketch.type];
    if (!ext) return fail("Skica mora biti slika ili PDF.", 415);
    if (sketch.size > MAX_SKETCH_BYTES) return fail("Skica je veća od 4 MB.", 413);

    const path = `customer-uploads/${randomUUID()}.${ext}`;
    const storage = db.storage.from(BUCKET);
    const { error: uploadError } = await storage.upload(path, sketch, {
      contentType: sketch.type,
      upsert: false,
    });
    if (uploadError) return fail("Greška prilikom učitavanja datoteke.", 500);
    message = `${message}\n\nPriložena skica: ${storage.getPublicUrl(path).data.publicUrl}`;
  }

  const { error: insertError } = await db.from("orders").insert({
    product: product.name,
    price: product.price,
    first_name: firstName,
    last_name: lastName,
    email,
    telephone,
    address,
    message,
    configuration,
  });
  if (insertError) return fail("Greška prilikom narudžbe.", 500);

  await db
    .from("products")
    .update({ orders: (product.orders ?? 0) + 1 })
    .eq("id", product.id);

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Stolarija BM <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        reply_to: email,
        subject: `Novi upit: ${product.name} - ${firstName} ${lastName}`,
        react: EmailTemplate({
          product: product.name,
          price: product.price,
          firstName,
          lastName,
          email,
          telephone,
          address,
          message,
          configuration: configuration ?? undefined,
        }),
        text: `Novi upit za ${product.name} od ${firstName} ${lastName}. Tel: ${telephone}`,
      });
    } catch (err) {
      console.error("Order email failed", err);
    }
  }

  return json({ ok: true }, 201);
}
