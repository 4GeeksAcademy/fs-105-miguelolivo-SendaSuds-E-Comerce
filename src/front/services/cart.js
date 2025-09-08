const BASE = import.meta.env.VITE_BACKEND_URL || "/api";

export async function getCart() {
  const r = await fetch(`${BASE}/cart/`);
  if (!r.ok) throw new Error(`GET /cart failed: ${r.status}`);
  return r.json(); // { items: [{product_id, qty}] }
}

export async function addToCart(product_id, qty = 1) {
  const r = await fetch(`${BASE}/cart/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id, qty })
  });
  if (!r.ok) throw new Error(`POST /cart failed: ${r.status}`);
  return r.json();
}

export async function setQty(product_id, qty) {
  const r = await fetch(`${BASE}/cart/${product_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty })
  });
  if (!r.ok) throw new Error(`PATCH /cart/${product_id} failed: ${r.status}`);
  return r.json();
}

export async function removeItem(product_id) {
  const r = await fetch(`${BASE}/cart/${product_id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`DELETE /cart/${product_id} failed: ${r.status}`);
  return r.json();
}

export async function clearCart() {
  const r = await fetch(`${BASE}/cart/clear`, { method: "POST" });
  if (!r.ok) throw new Error(`POST /cart/clear failed: ${r.status}`);
  return r.json(); // { ok:true, items:[] }
}
