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
  const [aboutExpanded, setAboutExpanded] = useState(false);

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

  const softBtn = {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#F4A261",
    color: "#fff",
    fontWeight: 600,
    boxShadow: "0 2px 6px rgba(0,0,0,.08)",
    cursor: "pointer",
  };

  const ghostBtn = {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    fontWeight: 700,
    boxShadow: "0 2px 6px rgba(0,0,0,.06)",
    cursor: "pointer",
  };

  const greenUnderline = {
    color: "#62746cff",
    textDecoration: "underline",
    textDecorationThickness: "2px",
    textUnderlineOffset: "3px",
  };

  return (
    // Wrapper EXTERIOR (fondo a ancho completo)
    <div
      style={{
        minHeight: "100dvh",
        background: `
          radial-gradient(1200px 380px at -10% 6%, rgba(244,162,97,.08), rgba(244,162,97,0) 60%),
          radial-gradient(900px 320px at 110% 32%, rgba(99,151,128,.07), rgba(99,151,128,0) 60%),
          linear-gradient(180deg, #FFFCF6 0%, #FAF3E7 42%, #F7EEDD 100%)
        `,
        padding: "24px 0",
      }}
    >
      {/* Wrapper INTERIOR (contenido centrado) */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
        {/* DESTACADOS */}
        <section style={{ textAlign: "center" }}>
          {loading && <div>Cargando…</div>}
          {err && <div style={{ color: "crimson" }}>{err}</div>}

          {!loading && !err && (
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
                      e.currentTarget.style.boxShadow =
                        "0 10px 22px rgba(0,0,0,.12)";
                      const img = e.currentTarget.querySelector(".feat-img");
                      if (img) img.style.transform = "scale(1.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,.08)";
                      const img = e.currentTarget.querySelector(".feat-img");
                      if (img) img.style.transform = "scale(1)";
                    }}
                  >
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

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        lineHeight: 1.2,
                        padding: "0 2px",
                        textAlign: "center",
                      }}
                    >
                      {p.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* SOBRE NOSOTROS — mismo fondo que el home, sin bordes ni sombras */}
        <section
          style={{
            maxWidth: 1100,
            margin: "28px auto 0",
            borderRadius: 18,
            padding: 28,
            background: "transparent",
            border: "none",
            boxShadow: "none",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 26, margin: 0 }}>Sobre nosotros</h2>

          <div
            id="about-story"
            style={{
              maxWidth: 900,
              margin: "12px auto 16px",
              lineHeight: 1.65,
              opacity: 0.96,
              textAlign: "center",
              ...(aboutExpanded
                ? {}
                : {
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }),
            }}
          >
            Senda Suds nace de una mesa de cocina y una idea sencilla: transformar
            el gesto cotidiano de lavarse las manos en un pequeño ritual de bienestar.
            Empezamos probando lotes diminutos con ingredientes cercanos (aceites
            vegetales, extractos botánicos, arcillas) hasta dar con fórmulas que
            limpiaran sin agredir la piel. Entre ferias locales, opiniones de amigos
            y muchas libretas de notas, fuimos puliendo aromas e identidades:
            <em> Carbón Activo</em> para una limpieza profunda y elegante,
            <em> Menta Alpina</em> para un frescor limpio,
            <em> Cítrico Amanecer</em> como abrazo energético al despertar,
            <em> Rosa Mosqueta</em> para una suavidad reconfortante. Con el tiempo
            llegó un pequeño taller, mejores procesos de curado y un compromiso
            firme con la sostenibilidad: lotes cortos para evitar mermas, proveedores
            cercanos cuando es posible y un packaging tan honesto como nuestras
            etiquetas. No buscamos ser los más grandes; queremos ser coherentes:
            productos sencillos y bien hechos, que respeten tu piel y el planeta, y
            que te recuerden por un momento la calma de un paseo por la senda.
          </div>

          <button
            onClick={() => setAboutExpanded((v) => !v)}
            aria-expanded={aboutExpanded}
            aria-controls="about-story"
            title={aboutExpanded ? "Mostrar menos" : "Mostrar más"}
            style={{
              background: "transparent",
              border: "none",
              boxShadow: "none",
              padding: "8px 14px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
              color: "#624a3a",
            }}
          >
            {aboutExpanded ? "−" : "+"}
          </button>
        </section>

        {/* MISIÓN / VALORES / COMPROMISO */}
        <section
          style={{ maxWidth: 1100, margin: "22px auto 0", textAlign: "center" }}
        >
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            <InfoCard title="Nuestra misión" titleStyle={greenUnderline}>
              Crear productos cotidianos que aporten bienestar real: fórmulas
              claras, ingredientes responsables y un diseño cálido.
            </InfoCard>
            <InfoCard title="Nuestros valores" titleStyle={greenUnderline}>
              Transparencia en etiquetas, coherencia ambiental y fabricación
              cercana. Creemos en lo sencillo y bien hecho.
            </InfoCard>
            <InfoCard title="Compromiso" titleStyle={greenUnderline}>
              Materias primas de origen vegetal y procesos de bajo impacto.
              Packaging reducido y reciclable.
            </InfoCard>
          </div>
        </section>

        {/* CÓMO LO HACEMOS — Triangular */}
        <section
          style={{ maxWidth: 1100, margin: "26px auto 0", textAlign: "center" }}
        >
          <h3 style={{ marginBottom: 10 }}>Cómo lo hacemos</h3>

          <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
              <Step n="1" icon="🧪" title="Formulación">
                Equilibramos aceites vegetales, extractos y aromas naturales para
                una barra cremosa y efectiva.
              </Step>
            </div>

            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
                width: "100%",
                maxWidth: 900,
                justifyContent: "center",
                alignItems: "start",
              }}
            >
              <div>
                <Step n="2" icon="⏳" title="Curado">
                  Cada lote reposa el tiempo necesario para estabilizar el pH y
                  lograr una limpieza respetuosa con la piel.
                </Step>
              </div>
              <div>
                <Step n="3" icon="✂️" title="Corte & Etiqueta">
                  Cortamos, revisamos y etiquetamos a mano con materiales
                  reciclables.
                </Step>
              </div>
            </div>
          </div>
        </section>

        {/* SOSTENIBILIDAD — 3 columnas x 1 (cards sin caja, mismo fondo que el Home) */}
        <section
          style={{
            maxWidth: 1100,
            margin: "26px auto 0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 6 }}>♻️</div>
          <h3 style={{ marginBottom: 16 }}>Sostenibilidad</h3>

          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              justifyContent: "center",
              alignItems: "stretch",
            }}
          >
            <SustCard
              items={[
                "Packaging reciclable y minimalista",
                "Reducción de plásticos en todo el ciclo",
                "Tintas y adhesivos de menor impacto",
                "Prioridad a proveedores locales",
              ]}
            />
            <SustCard
              items={[
                "Lotes pequeños para evitar mermas",
                "Optimización de agua y residuos en taller",
                "Transparencia en ingredientes y etiquetado",
              ]}
            />
            <SustCard
              items={[
                "Preferencia por materias de origen vegetal",
                "Sin testeo animal",
                "Logística ajustada para menor huella",
              ]}
            />
          </div>
        </section>

        {/* CTA FINAL */}
        <section
          style={{ maxWidth: 1100, margin: "26px auto 6px", textAlign: "center" }}
        >
          <Link to="/products">
            <button style={{ ...softBtn, padding: "12px 18px" }}>
              Explorar productos
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ title, titleStyle, children }) {
  return (
    <div
      style={{
        border: "none",
        borderRadius: 12,
        padding: 16,
        background: "#f7e9d1df",
        boxShadow: "none",
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 6, ...(titleStyle || {}) }}>
        {title}
      </div>
      <div style={{ opacity: 0.92 }}>{children}</div>
    </div>
  );
}

function Step({ n, icon, title, children }) {
  return (
    <div
      style={{
        borderRadius: 12,
        padding: 16,
        background: "linear-gradient(180deg, #F7FFF8 0%, #EAF7EE 100%)",
        border: "1px solid #e8f0e9",
        textAlign: "center",
      }}
    >
      {icon && <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F4A261",
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {n}
        </span>
        <strong>{title}</strong>
      </div>
      <div style={{ opacity: 0.92, maxWidth: 820, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

function SustCard({ items }) {
  return (
    <div
      style={{
        width: "100%",
        background: "transparent", // ← mismo fondo que el Home
        border: "none",            // ← sin bordes
        boxShadow: "none",         // ← sin sombras
        borderRadius: 0,
        padding: 0,
        textAlign: "left",
        margin: "0 auto",
      }}
    >
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((txt, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 2px",
            }}
          >
            <span style={{ fontSize: 14 }}>🌿</span>
            <span style={{ opacity: 0.95 }}>{txt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
