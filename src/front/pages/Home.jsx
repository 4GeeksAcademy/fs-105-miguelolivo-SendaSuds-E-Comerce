// src/front/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/products";

const FEATURED_IDS = [4, 3, 2, 5]; // Carbón Activo, Menta Alpina, Cítrico Amanecer, Rosa Mosqueta

const PALETTE = {
  1: { from: "#FFF4E0", to: "#FFE5C2" },
  2: { from: "#FFF1DA", to: "#FFD0A8" },
  3: { from: "#E6FAF1", to: "#C8EFE0" },
  4: { from: "#F0F1F3", to: "#E4E7EA" },
  5: { from: "#FFE6EC", to: "#FFC8D6" },
  6: { from: "#FFF7E0", to: "#FFE8B3" },
  7: { from: "#F3EDFF", to: "#E3DAFF" },
  8: { from: "#E9F9EE", to: "#CFEFD9" },
  9: { from: "#E7F5F0", to: "#CAE9E1" },
};

export function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchProducts()
      .then((d) => {
        const byId = new Map(d.results.map((p) => [p.id, p]));
        const ordered = FEATURED_IDS.map((id) => byId.get(id)).filter(Boolean);
        setFeatured(ordered);
      })
      .catch((e) => setErr(e.message || "No se pudieron cargar los destacados"))
      .finally(() => setLoading(false));
  }, []);

  const cardBase = {
    position: "relative",
    borderRadius: 18,
    padding: 18,
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
    transition: "transform .18s ease, box-shadow .18s ease",
    textDecoration: "none",
    color: "inherit",
    outline: "none",
  };

  return (
    <div style={{ padding: 16, maxWidth: 1280, margin: "0 auto" }}>
      <section>
        <h2 style={{ fontSize: 28, margin: "16px 0 18px" }}>Destacados</h2>

        {loading && <div>Cargando…</div>}
        {err && <div style={{ color: "crimson" }}>{err}</div>}

        {!loading && !err && (
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))", // 4 x 1
            }}
          >
            {featured.map((p) => {
              const pal = PALETTE[p.id] || { from: "#F7F7F7", to: "#EFEFEF" };
              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  aria-label={`Ver ${p.name}`}
                  style={{
                    ...cardBase,
                    background: `linear-gradient(180deg, ${pal.from} 0%, ${pal.to} 100%)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,.12)";
                    const img = e.currentTarget.querySelector(".feat-img");
                    if (img) img.style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)";
                    const img = e.currentTarget.querySelector(".feat-img");
                    if (img) img.style.transform = "scale(1)";
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(244,162,97,.45)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)";
                  }}
                >
                  {/* Imagen grande centrada SIN borde/blanco */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      borderRadius: 14,
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <img
                      className="feat-img"
                      src={p.image || "/images/products/coco-tropical.jpg"}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/rigo-baby.jpg";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform .25s ease",
                        transform: "scale(1)",
                      }}
                    />
                  </div>

                  {/* Título debajo de la imagen */}
                  <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2, padding: "0 2px" }}>
                    {p.name}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 22, margin: "0 0 8px" }}>Sobre nosotros</h3>
        <p style={{ maxWidth: 820, opacity: 0.9 }}>
          Nacimos con una idea sencilla: jabones honestos, hechos a mano y con
          ingredientes que respetan tu piel y el planeta.
        </p>
        <Link to="/products">
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#F4A261",
              color: "#fff",
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
            }}
          >
            Ver catálogo
          </button>
        </Link>
      </section>
    </div>
  );
}
