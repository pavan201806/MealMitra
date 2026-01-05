import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

/* ===== GLOBAL CSS ===== */
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

/* ===== LAYOUTS ===== */
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

/* ===== ADMIN PAGES ===== */
import AdminHome from "./pages/admin/AdminHome";
import AddFood from "./pages/admin/AddFood";
import ListFood from "./pages/admin/ListFood";
import AdminOrder from "./pages/admin/AdminOrder";

/* ===== USER PAGES ===== */
import Homepage from "./pages/user/Homepage";
import CartPage from "./pages/user/CartPage";
import Orderpage from "./pages/user/Orderpage";
import CheckoutPage from "./pages/user/Checkout";
import Fooddisplay from "./pages/user/Fooddisplay";
import About from "./pages/user/About";
import Profile from "./pages/user/Profile";
import Explore from "./pages/Explore";
import ExploreAndFood from "./components/user/ExploreAndFood";

/* ===== AUTH PAGES ===== */
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";

/* ===== COMMON ===== */
import NotFound from "./pages/NotFound";

/* ===== CONTEXT ===== */
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        {/* Global Toast Notifications */}
        <ToastContainer position="top-right" autoClose={2000} />

        <Routes>
          {/* ===== ROOT & USER ROUTES (with UserLayout) ===== */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<Orderpage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/fooddisplay" element={<Fooddisplay />} />
            <Route path="/restaurant/:restaurantId/menu" element={<ExploreAndFood />} />
          </Route>

          {/* ===== ADMIN ROUTES (with AdminLayout) ===== */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminHome />} />
            <Route path="add-food" element={<AddFood />} />
            <Route path="list-food" element={<ListFood />} />
            <Route path="orders" element={<AdminOrder />} />
            {/* Legacy route for backward compatibility */}
            <Route path="menubar" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* ===== AUTH ROUTES (no layout) ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Legacy auth routes for backward compatibility */}
          <Route path="/log" element={<Navigate to="/login" replace />} />
          <Route path="/reg" element={<Navigate to="/register" replace />} />

          {/* Legacy admin routes for backward compatibility */}
          <Route path="/home" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/addfood" element={<Navigate to="/admin/add-food" replace />} />
          <Route path="/listfood" element={<Navigate to="/admin/list-food" replace />} />
          <Route path="/adminorder" element={<Navigate to="/admin/orders" replace />} />

          {/* ===== 404 NOT FOUND ===== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
