// Browser-side helper for the admin dashboard. All writes go through /api/admin,
// which checks the NextAuth session and uses the service-role key on the server.
type Result<T> = { data: T | null; error: string | null };

async function call<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(`/api/admin${path}`, {
      ...init,
      headers:
        init?.body instanceof FormData
          ? init?.headers
          : { "Content-Type": "application/json", ...init?.headers },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: body?.error ?? res.statusText };
    return { data: body as T, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

export type Resource = "orders" | "messages" | "products";
export type UploadedImage = { url: string; pathname: string };

export const adminApi = {
  list: <T = any>(resource: Resource) => call<T[]>(`/${resource}`),
  create: <T = any>(resource: "products", body: unknown) =>
    call<T>(`/${resource}`, { method: "POST", body: JSON.stringify(body) }),
  update: (resource: Resource, id: number, body: unknown) =>
    call(`/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (resource: Resource, id: number) =>
    call(`/${resource}/${id}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return call<UploadedImage>("/upload", { method: "POST", body: form });
  },
  deleteImage: (pathname: string) =>
    call(`/upload?path=${encodeURIComponent(pathname)}`, { method: "DELETE" }),
};
