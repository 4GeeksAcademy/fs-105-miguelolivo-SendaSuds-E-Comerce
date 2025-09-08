const BASE = import.meta.env.VITE_BACKEND_URL || "/api";

/**
 * Crea un intento de pago (amount en centimos, p.ej. 12.34 € => 1234)
 * => { ok, payment_intent_id, client_secret }
 */
export async function createPayment(amount) {
  const r = await fetch(`${BASE}/checkout/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });
  if (!r.ok) {
    const msg = await r.text().catch(()=>"");
    throw new Error(msg || `createPayment failed: ${r.status}`);
  }
  return r.json();
}

/**
 * Confirma el intento de pago (simulado en el backend)
 * => { ok, status: "succeeded", payment_intent_id }
 */
export async function confirmPayment(payment_intent_id) {
  const r = await fetch(`${BASE}/checkout/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payment_intent_id })
  });
  if (!r.ok) {
    const msg = await r.text().catch(()=>"");
    throw new Error(msg || `confirmPayment failed: ${r.status}`);
  }
  return r.json();
}
