import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, setQty, removeItem } from "../services/cart";
import { fetchProducts } from "../services/products";

export default function Cart(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();

  async function load(){
    try {
      setLoading(true);
      const [cart, prods] = await Promise.all([getCart(), fetchProducts()]);
      const nameMap  = new Map(prods.results.map(p => [p.id, p.name]));
      const priceMap = new Map(prods.results.map(p => [p.id, p.price ?? null]));
      const merged = (cart.items || []).map(it => ({
        ...it,
        name: nameMap.get(it.product_id) || `Producto ${it.product_id}`,
        price: priceMap.get(it.product_id) // puede ser null si no hay precio
      }));
      setItems(merged);
    } catch (e) {
      setErr(e.message || "No se pudo cargar el carrito");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function changeQty(id, qty){
    setErr(""); setBusyId(id);
    const nextQty = Math.max(0, qty);

    // Actualización optimista (sin parpadeo)
    setItems(prev =>
      prev
        .map(it => it.product_id === id ? { ...it, qty: nextQty } : it)
        .filter(it => it.qty > 0)
    );

    try {
      await setQty(id, nextQty);
      window.dispatchEvent(new Event("cart:changed")); // <- notifica a Navbar
    } catch (e) {
      setErr(e.message || "Error al actualizar cantidad");
      await load(); // recupera estado real si falla
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id){
    setErr(""); setBusyId(id);

    // Optimista: quita en UI al instante
    setItems(prev => prev.filter(it => it.product_id !== id));

    try {
      await removeItem(id);
      window.dispatchEvent(new Event("cart:changed")); // <- notifica a Navbar
    } catch (e) {
      setErr(e.message || "Error al eliminar");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div style={{padding:16}}>Cargando…</div>;
  if (err) return <div style={{padding:16, color:"crimson"}}>{err}</div>;
  if (items.length === 0) return <div style={{padding:16}}>Tu carrito está vacío.</div>;

  const total = items.reduce((sum, it) => sum + (it.price != null ? it.price * it.qty : 0), 0);

  return (
    <div style={{padding:16}}>
      <h2>Carrito</h2>
      <ul style={{listStyle:"none", padding:0}}>
        {items.map(it => (
          <li key={it.product_id} style={{display:"flex", gap:12, alignItems:"center", marginBottom:10, flexWrap:"wrap"}}>
            <div style={{minWidth:240}}>{it.name}</div>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <button disabled={busyId===it.product_id} onClick={()=>changeQty(it.product_id, it.qty-1)}>−</button>
              <span>{it.qty}</span>
              <button disabled={busyId===it.product_id} onClick={()=>changeQty(it.product_id, it.qty+1)}>+</button>
            </div>
            <div style={{marginLeft:8}}>
              {it.price != null
                ? <>Precio: {it.price.toFixed(2)} € — Subtotal: {(it.price * it.qty).toFixed(2)} €</>
                : <span>Sin precio</span>}
            </div>
            <button disabled={busyId===it.product_id} onClick={()=>remove(it.product_id)} style={{marginLeft:8}}>Quitar</button>
          </li>
        ))}
      </ul>

      <hr />
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <strong>Total: {total.toFixed(2)} €</strong>
        <button onClick={()=>navigate("/checkout")}>Ir a checkout</button>
      </div>
      {items.some(it => it.price == null) && (
        <div style={{marginTop:6, fontSize:12, opacity:.7}}>
          * Hay artículos sin precio; no se incluyen en el total.
        </div>
      )}
    </div>
  );
}
