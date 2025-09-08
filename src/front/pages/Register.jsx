import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, login } from "../services/auth";

export default function Register(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate(){
    if (!email.includes("@")) return "Email inválido";
    if (password.length < 6) return "La contraseña debe tener 6+ caracteres";
    if (password !== confirm) return "Las contraseñas no coinciden";
    return "";
  }

  async function onSubmit(e){
    e.preventDefault();
    const v = validate();
    if (v){ setErr(v); return; }
    setErr(""); setLoading(true);
    try {
      await register(email.trim(), password);
      // auto-login tras registro (stub)
      const data = await login(email.trim(), password);
      localStorage.setItem("token", data.token);
      navigate("/profile", { replace: true });
    } catch (e) {
      setErr(e.message || "Error de registro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label><br/>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Contraseña</label><br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Confirmar contraseña</label><br/>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={6} />
        </div>
        {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
        <button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear cuenta"}</button>
      </form>
      <div style={{ marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
      </div>
    </div>
  );
}
