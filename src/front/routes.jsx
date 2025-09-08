import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./pages/ProtectedRoute";
import NotFound from "./pages/NotFound";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Profile from "./pages/Profile";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      {/* rutas hijas RELATIVAS */}
      <Route index element={<Home />} />

      {/* catálogo */}
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<ProductDetail />} />
      {/* alias opcional: /product/:id */}
      <Route path="product/:id" element={<ProductDetail />} />

      {/* auth + perfil */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* carrito + checkout */}
      <Route path="cart" element={<Cart />} />
      <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

      {/* otras */}
      <Route path="single/:theId" element={<Single />} />
      <Route path="demo" element={<Demo />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);
