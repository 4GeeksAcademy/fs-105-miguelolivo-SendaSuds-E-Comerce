import { Link } from "react-router-dom";

export default function NotFound(){
  return (
    <div style={{padding:16}}>
      <h2>404 — Página no encontrada</h2>
      <p>La ruta que buscaste no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}
