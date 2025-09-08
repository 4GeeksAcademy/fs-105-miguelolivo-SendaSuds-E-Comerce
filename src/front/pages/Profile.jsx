import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateMe, deleteMe } from "../services/users";

export default function Profile(){
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getMe()
      .then(data => { setMe(data); setName(data.name || ""); })
      .catch(e => setErr(e.message || "No se pudo cargar el perfil"))
      .finally(() => setLoading(false));
  }, []);

  async function onSave(e){
    e.preventDefault();
    setErr(""); setOk("");
    const n = (name || "").trim();
    if (!n) { setErr("El nombre no puede estar vacío"); return; }
    try {
      const updated = await updateMe({ name: n });
      setMe(updated);
      setOk("Perfil actualizado");
    } catch (e) {
      setErr(e.message || "Error al actualizar");
    }
  }

  async function onDelete(){
    if (!confirm("¿Seguro que quieres eliminar tu cuenta? Esta acción es irreversible.")) return;
    try {
      await deleteMe();
      localStorage.removeItem("token"); // salir
      navigate("/", { replace: true });
    } catch (e) {
      setErr(e.message || "Error al eliminar la cuenta");
    }
  }

  function onLogout(){
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  if (loading) return <div style={{padding:16}}>Cargando…</div>;
  if (err) return <div style={{padding:16, color:"crimson"}}>{err}</div>;
  if (!me) return null;

  return (
    <div style={{ padding: 16, maxWidth: 480 }}>
      <h2>Perfil</h2>
      <p><strong>Email:</strong> {me.email}</p>
      <form onSubmit={onSave} style={{ marginTop: 12 }}>
        <label>Nombre</label><br />
        <input value={name} onChange={e=>setName(e.target.value)} />
        <div style={{ marginTop: 8 }}>
          <button type="submit">Guardar</button>
          <button type="button" onClick={onLogout} style={{ marginLeft: 8 }}>Cerrar sesión</button>
          <button type="button" onClick={onDelete} style={{ marginLeft: 8, color:"white", background:"#c0392b" }}>Eliminar cuenta</button>
        </div>
      </form>
      {ok && <div style={{ color: "green", marginTop: 8 }}>{ok}</div>}
    </div>
  );
}
