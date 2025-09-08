import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCart } from "../services/cart";


export function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  async function loadCartCount() {
    try {
      const data = await getCart();
      const n = (data.items || []).reduce((sum, it) => sum + Number(it.qty || 0), 0);
      setCartCount(n);
    } catch {
      setCartCount(0);
    }
  }

  // Recalcula al cambiar de ruta (ligero y sin parpadeos)
  useEffect(() => { loadCartCount(); }, [location]);
    // Actualiza el contador cuando cualquier parte de la app dispare "cart:changed"
  useEffect(() => {
    const onChange = () => loadCartCount();
    window.addEventListener("cart:changed", onChange);
    return () => window.removeEventListener("cart:changed", onChange);
  }, []);


  function logout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <nav style={{display:"flex", gap:16, padding:12, borderBottom:"1px solid #eee"}}>
      <Link to="/">React Boilerplate</Link>
      <div style={{marginLeft:"auto", display:"flex", gap:12}}>
        <Link to="/products">Productos</Link>
        <Link to="/cart">Carrito ({cartCount})</Link>
        {token ? (
          <>
            <Link to="/profile">Perfil</Link>
            <button onClick={logout} style={{background:"transparent", border:"none", cursor:"pointer"}}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}
