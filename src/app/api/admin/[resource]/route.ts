import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { fail, json, requireAdmin } from "@/lib/server/http";
import { isResource, productFields } from "@/lib/server/adminResources";

export const dynamic = "force-dynamic";

// GET /api/admin/orders | messages | products  -> newest first
export async function GET(
  _request: Request,
  { params }: { params: { resource: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isResource(params.resource)) return fail("Not found", 404);

  const { data, error } = await supabaseAdmin()
    .from(params.resource)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return json(data ?? []);
}

// POST /api/admin/products  -> create a product
export async function POST(
  request: Request,
  { params }: { params: { resource: string } }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (params.resource !== "products") return fail("Not allowed", 405);

  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid JSON");

  const { out, errors } = productFields(body, false);
  if (errors.length) return fail(`Invalid fields: ${errors.join(", ")}`);

  const { data, error } = await supabaseAdmin()
    .from("products")
    .insert(out)
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return json(data, 201);
}
