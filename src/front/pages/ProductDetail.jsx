import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { addToCart } from "../services/cart";

const BASE = import.meta.env.VITE_BACKEND_URL || "/api";

export default function ProductDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setItem(null); setErr("");
    fetch(`${BASE}/products/${id}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setItem)
      .catch(() => setErr("Producto no encontrado"));
  }, [id]);

  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!item) return <div style={{ padding: 16 }}>Cargando…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{item.name}</h2>
      <p>ID: {item.id}</p>
      {"price" in item && <p>Precio: {Number(item.price).toFixed(2)} €</p>}

      <button
        onClick={async () => {
          setMsg("");
          try {
            await addToCart(Number(id), 1);
            setMsg("Añadido al carrito 🧺");
          } catch {
            setMsg("Error al añadir al carrito");
          }
        }}
      >
        Añadir al carrito
      </button>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
