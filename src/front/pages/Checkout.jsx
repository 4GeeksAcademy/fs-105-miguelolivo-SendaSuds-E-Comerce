import { useEffect, useState } from "react";
import { getCart } from "../services/cart";
import { fetchProducts } from "../services/products";
import { createPayment, confirmPayment } from "../services/checkout";
import { clearCart } from "../services/cart";

export default function Checkout(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cart, prods] = await Promise.all([getCart(), fetchProducts()]);
        const priceMap = new Map(prods.results.map(p => [p.id, p.price ?? 0]));
        const merged = (cart.items || []).map(it => ({
          ...it,
          price: priceMap.get(it.product_id) ?? 0
        }));
        setItems(merged);
      } catch (e) {
        setErr(e.message || "No se pudo cargar el checkout");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = items.reduce((sum, it) => sum + (Number(it.price || 0) * it.qty), 0);
  const amountCents = Math.round(total * 100);

  async function pay() {
    setErr(""); setPaying(true); setStatus(null);
    try {
      const { payment_intent_id } = await createPayment(amountCents);
      const res = await confirmPayment(payment_intent_id);
      setStatus(res.status || "ok");

      // Si se aprobó, vaciamos el carrito y notificamos a la Navbar
      if (res.status === "succeeded") {
        await clearCart();
        window.dispatchEvent(new Event("cart:changed")); // ← NUEVO
        setItems([]);
      }
    } catch (e) {
      setErr(e.message || "Error durante el pago");
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <div style={{ padding:16 }}>Cargando…</div>;
  if (err) return <div style={{ padding:16, color:"crimson" }}>{err}</div>;

  return (
    <div style={{ padding:16 }}>
      <h2>Checkout</h2>

      {items.length > 0 ? (
        <ul>
          {items.map(it => (
            <li key={it.product_id}>
              #{it.product_id} × {it.qty}{" "}
              {it.price ? `— ${(it.price * it.qty).toFixed(2)} €` : "(sin precio)"}
            </li>
          ))}
        </ul>
      ) : (
        <div>Tu carrito está vacío.</div>
      )}

      <hr />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <strong>Total: {total.toFixed(2)} €</strong>
        <button onClick={pay} disabled={paying || amountCents <= 0}>
          {paying ? "Procesando…" : "Pagar (simulado)"}
        </button>
      </div>

      {amountCents <= 0 && (
        <div style={{ marginTop:8, fontSize:12, opacity:.7 }}>
          * Agrega productos con precio para poder pagar.
        </div>
      )}
      {status === "succeeded" && (
        <div style={{ marginTop:12, color:"green" }}>Pago aprobado ✅ — carrito vaciado.</div>
      )}
    </div>
  );
}
