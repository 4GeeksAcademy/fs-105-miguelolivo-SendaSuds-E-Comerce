import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/products";
import { addToCart } from "../services/cart";

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null); // desactivar botón mientras añade
  const [okId, setOkId] = useState(null);         // feedback rápido “añadido”

  useEffect(() => {
    fetchProducts()
      .then(d => setItems(d.results))
      .catch(e => setError(e.message || "Error cargando productos"))
      .finally(() => setLoading(false));
  }, []);

  async function onAdd(id) {
    try {
      setAddingId(id);
      await addToCart(id, 1);
      // 🔔 Notificar a la Navbar (y quien escuche) que cambió el carrito
      window.dispatchEvent(new Event("cart:changed"));
      setOkId(id);
      setTimeout(() => setOkId(null), 1200);
    } catch (e) {
      alert("No se pudo añadir al carrito");
    } finally {
      setAddingId(null);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (error)   return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Productos</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map(p => (
          <li key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <div style={{ minWidth: 260 }}>
              <Link to={`/products/${p.id}`}>{p.name}</Link>
              {"price" in p && p.price != null && (
                <span style={{ marginLeft: 8, opacity: 0.8 }}>
                  — {Number(p.price).toFixed(2)} €
                </span>
              )}
            </div>

            <button
              onClick={() => onAdd(p.id)}
              disabled={addingId === p.id}
              title="Añadir 1 unidad"
              aria-busy={addingId === p.id}
            >
              {addingId === p.id ? "Añadiendo…" : "Añadir al carrito"}
            </button>

            {okId === p.id && <span style={{ color: "green" }}>✓ añadido</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
