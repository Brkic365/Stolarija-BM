import { supabaseAdmin } from "@/lib/server/supabaseAdmin";
import { fail, json, requireAdmin } from "@/lib/server/http";
import { isResource, updateFields } from "@/lib/server/adminResources";

export const dynamic = "force-dynamic";

type Params = { params: { resource: string; id: string } };

function parseId(id: string) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// PATCH /api/admin/orders/5 {status} | messages/5 {read} | products/5 {...}
export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isResource(params.resource)) return fail("Not found", 404);
  const id = parseId(params.id);
  if (!id) return fail("Invalid id");

  const body = await request.json().catch(() => null);
  if (!body) return fail("Invalid JSON");

  const { out, errors } = updateFields(params.resource, body);
  if (errors.length) return fail(`Invalid fields: ${errors.join(", ")}`);

  const { error } = await supabaseAdmin()
    .from(params.resource)
    .update(out)
    .eq("id", id);

  if (error) return fail(error.message, 500);
  return json({ ok: true });
}

// DELETE /api/admin/orders/5 | messages/5 | products/5
export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isResource(params.resource)) return fail("Not found", 404);
  const id = parseId(params.id);
  if (!id) return fail("Invalid id");

  const { error } = await supabaseAdmin()
    .from(params.resource)
    .delete()
    .eq("id", id);

  if (error) return fail(error.message, 500);
  return json({ ok: true });
}
