import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../services/auth";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/profile";

  function validate(){
    if (!email.includes("@")) return "Email inválido";
    if (password.length < 6) return "La contraseña debe tener 6+ caracteres";
    return "";
  }

  async function onSubmit(e){
    e.preventDefault();
    const v = validate();
    if (v){ setErr(v); return; }
    setErr(""); setLoading(true);
    try {
      const data = await login(email.trim(), password);
      localStorage.setItem("token", data.token); // stub
      navigate(from, { replace: true });
    } catch (e) {
      setErr(e.message || "Error de inicio de sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 420 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label><br/>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Contraseña</label><br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}/>
        </div>
        {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}
        <button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </form>
      <div style={{ marginTop: 12 }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </div>
    </div>
  );
}
