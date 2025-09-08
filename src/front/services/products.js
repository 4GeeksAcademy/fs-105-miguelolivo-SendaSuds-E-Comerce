const BASE = import.meta.env.VITE_BACKEND_URL || "/api";

export async function fetchProducts() {
  const r = await fetch(`${BASE}/products/`);
  if (!r.ok) throw new Error(`GET /products/ failed: ${r.status}`);
  return r.json(); // { results: [...] }
}
