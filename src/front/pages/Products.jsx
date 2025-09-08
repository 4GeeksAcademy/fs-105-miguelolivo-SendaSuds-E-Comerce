import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/products";
import { addToCart } from "../services/cart";

const PALETTE = {
  1: { from: "#FFF4E0", to: "#FFE5C2" }, // Coco Tropical
  2: { from: "#FFF1DA", to: "#FFD0A8" }, // Cítrico Amanecer
  3: { from: "#E6FAF1", to: "#C8EFE0" }, // Menta Alpina
  4: { from: "#F0F1F3", to: "#E4E7EA" }, // Carbón Activo
  5: { from: "#FFE6EC", to: "#FFC8D6" }, // Rosa Mosqueta
  6: { from: "#FFF7E0", to: "#FFE8B3" }, // Avena & Miel
  7: { from: "#F3EDFF", to: "#E3DAFF" }, // Lavanda Serena
  8: { from: "#E9F9EE", to: "#CFEFD9" }, // Aloe Vera
  9: { from: "#E7F5F0", to: "#CAE9E1" }, // Bosque Fresco
};

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [okId, setOkId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

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
      window.dispatchEvent(new Event("cart:changed"));
      setOkId(id);
      setTimeout(() => setOkId(null), 1200);
    } catch {
      alert("No se pudo añadir al carrito");
    } finally {
      setAddingId(null);
    }
  }

  const normalized = (s) =>
    (s || "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const visible = useMemo(() => {
    const q = normalized(query);
    let list = items.filter(p => {
      if (!q) return true;
      const haystack = normalized(`${p.name} ${p.description || ""}`);
      return haystack.includes(q);
    });

    switch (sortBy) {
      case "price-asc":
        list = list.slice().sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price-desc":
        list = list.slice().sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      default:
        list = list.slice().sort((a, b) => normalized(a.name).localeCompare(normalized(b.name)));
    }
    return list;
  }, [items, query, sortBy]);

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (error)   return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;

  const btnStyle = {
    background: "#F4A261",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .06s ease, opacity .2s ease, background .2s ease",
  };
  const btnHover = { background: "#E76F51" };
  const btnDisabled = { opacity: 0.6, cursor: "not-allowed" };

  // estilo base de tarjeta + función para aplicar el degradado por producto
  const cardBase = {
    border: "1px solid rgba(0,0,0,.05)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
    transition: "transform .18s ease, box-shadow .18s ease",
  };
  const cardBg = (id) => {
    const pal = PALETTE[id] || { from: "#F7F7F7", to: "#EFEFEF" };
    return { background: `linear-gradient(180deg, ${pal.from} 0%, ${pal.to} 100%)` };
  };

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Productos</h2>

      {/* Controles */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Buscar por nombre o descripción…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, minWidth: 260, flex: "1 1 260px" }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="name-asc">Nombre (A–Z)</option>
          <option value="price-asc">Precio (menor a mayor)</option>
          <option value="price-desc">Precio (mayor a menor)</option>
        </select>
        <div style={{ marginLeft: "auto", opacity: 0.75, fontSize: 13 }}>
          {visible.length} resultados
        </div>
      </div>

      {/* Grid 3×3 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {visible.map(p => {
          const isHovered = hoveredId === p.id;
          return (
            <div
              key={p.id}
              style={{
                ...cardBase,
                ...cardBg(p.id),
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                boxShadow: isHovered ? "0 6px 18px rgba(0,0,0,.12)" : cardBase.boxShadow,
              }}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Imagen clicable → detalle (con zoom suave en hover) */}
              <Link
                to={`/products/${p.id}`}
                style={{ display: "block", width: "100%", aspectRatio: "4/3", overflow: "hidden", borderRadius: 10 }}
                aria-label={`Ver detalles de ${p.name}`}
              >
                <img
                  src={p.image || "/images/products/coco-tropical.jpg"}
                  alt={p.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/rigo-baby.jpg"; }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    cursor: "pointer",
                    transition: "transform .25s ease",
                    transform: isHovered ? "scale(1.02)" : "scale(1)",
                  }}
                />
              </Link>

              {/* Título (enlaza al detalle) */}
              <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                <Link to={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  {p.name}
                </Link>
              </div>

              {/* Precio oculto en el listado */}

              {/* Descripción resumida */}
              {p.description && (
                <div
                  style={{
                    fontSize: 13,
                    opacity: 0.8,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.description}
                </div>
              )}

              {/* Footer: botón a la derecha */}
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => onAdd(p.id)}
                  disabled={addingId === p.id}
                  aria-busy={addingId === p.id}
                  style={{
                    ...btnStyle,
                    ...(addingId === p.id ? btnDisabled : null),
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseEnter={(e) => (e.currentTarget.style.background = btnHover.background)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = btnStyle.background)}
                >
                  {addingId === p.id ? "Añadiendo…" : "Añadir"}
                </button>
              </div>

              {okId === p.id && (
                <div style={{ color: "green", fontSize: 12, alignSelf: "flex-end", marginTop: 6 }}>✓ añadido</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
