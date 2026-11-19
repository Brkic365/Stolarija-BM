// What the admin dashboard may read and change, per table
export const RESOURCES = ["orders", "messages", "products"] as const;
export type Resource = (typeof RESOURCES)[number];

export const CATEGORIES = ["kitchens", "rooms", "furniture", "closets"];
export const ORDER_STATUSES = ["waiting", "working", "done"];

export function isResource(value: string): value is Resource {
  return (RESOURCES as readonly string[]).includes(value);
}

type Images = { url: string; pathname: string }[];

function cleanImages(value: unknown): Images | null {
  if (!Array.isArray(value)) return null;
  const images: Images = [];
  for (const item of value) {
    if (
      !item ||
      typeof item.url !== "string" ||
      typeof item.pathname !== "string"
    ) {
      return null;
    }
    images.push({ url: item.url, pathname: item.pathname });
  }
  return images;
}

// Validates a product body. partial=true for updates.
export function productFields(body: any, partial: boolean) {
  const out: Record<string, unknown> = {};
  const errors: string[] = [];

  if (body.name !== undefined || !partial) {
    if (typeof body.name !== "string" || !body.name.trim()) errors.push("name");
    else out.name = body.name.trim().slice(0, 200);
  }
  if (body.description !== undefined || !partial) {
    if (typeof body.description !== "string") errors.push("description");
    else out.description = body.description.slice(0, 5000);
  }
  if (body.price !== undefined || !partial) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) errors.push("price");
    else out.price = price;
  }
  if (body.category !== undefined || !partial) {
    if (!CATEGORIES.includes(body.category)) errors.push("category");
    else out.category = body.category;
  }
  if (body.images !== undefined || !partial) {
    const images = cleanImages(body.images);
    if (!images) errors.push("images");
    else out.images = images;
  }

  return { out, errors };
}

export function updateFields(resource: Resource, body: any) {
  if (resource === "orders") {
    if (!ORDER_STATUSES.includes(body.status)) {
      return { out: {}, errors: ["status"] };
    }
    return { out: { status: body.status }, errors: [] };
  }
  if (resource === "messages") {
    if (typeof body.read !== "boolean") return { out: {}, errors: ["read"] };
    return { out: { read: body.read }, errors: [] };
  }
  return productFields(body, true);
}
