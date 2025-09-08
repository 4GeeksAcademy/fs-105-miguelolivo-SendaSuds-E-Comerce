const BASE = import.meta.env.VITE_BACKEND_URL || "/api";

export async function login(email, password) {
  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  // Mensaje de error legible
  if (!r.ok) {
    const msg = await r.text().catch(()=>"");
    throw new Error(msg || `Login failed: ${r.status}`);
  }
  return r.json(); // { ok, token, user }
}

export async function register(email, password) {
  const r = await fetch(`${(import.meta.env.VITE_BACKEND_URL || "/api")}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const msg = await r.text().catch(()=>"");
    throw new Error(msg || `Register failed: ${r.status}`);
  }
  return r.json(); // { ok, user }
}
