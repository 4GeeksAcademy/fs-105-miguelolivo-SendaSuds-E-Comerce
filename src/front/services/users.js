const BASE = import.meta.env.VITE_BACKEND_URL || "/api";

export async function getMe() {
  const r = await fetch(`${BASE}/users/me`);
  if (!r.ok) throw new Error(`GET /users/me failed: ${r.status}`);
  return r.json();
}

export async function updateMe(patch) {
  const r = await fetch(`${BASE}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) {
    const msg = await r.text().catch(()=>"");
    throw new Error(msg || `PATCH /users/me failed: ${r.status}`);
  }
  return r.json();
}

export async function deleteMe() {
  const r = await fetch(`${BASE}/users/me`, { method: "DELETE" });
  if (!r.ok) throw new Error(`DELETE /users/me failed: ${r.status}`);
  return r.json();
}
