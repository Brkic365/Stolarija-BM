import { randomUUID } from "crypto";
import { BUCKET, supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { fail, json, requireAdmin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

// POST /api/admin/upload (multipart "file") -> { url, pathname }
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("Missing file");
  if (file.size > MAX_BYTES) return fail("Slika je veća od 4 MB", 413);
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return fail("Dozvoljeni formati: JPG, PNG, WEBP, AVIF", 415);

  const pathname = `public/${randomUUID()}.${ext}`;
  const storage = supabaseAdmin().storage.from(BUCKET);
  const { error } = await storage.upload(pathname, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) return fail(error.message, 500);

  const { data } = storage.getPublicUrl(pathname);
  return json({ url: data.publicUrl, pathname }, 201);
}

// DELETE /api/admin/upload?path=public/xyz.jpg
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const path = new URL(request.url).searchParams.get("path") ?? "";
  if (!/^public\/[A-Za-z0-9 ._-]+$/.test(path)) return fail("Invalid path");

  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([path]);
  if (error) return fail(error.message, 500);
  return json({ ok: true });
}
