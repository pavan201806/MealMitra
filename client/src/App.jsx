import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

/* ===== GLOBAL CSS ===== */
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

/* ===== ADMIN PANEL ===== */
import AdminHome from "./pages/admin/AdminHome";
import Admindashboard from "./pages/admin/Admindashboard";
import Sidebar from "./components/admin/Sidebar";
import Menubar from "./components/admin/Menubar";
import AddFood from "./pages/admin/AddFood";
import ListFood from "./pages/admin/ListFood";
import AdminOrder from "./pages/admin/AdminOrder";

/* ===== USER PANEL ===== */
import Homepage from "./pages/user/Homepage";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import CartPage from "./pages/user/CartPage";
import Orderpage from "./pages/user/Orderpage";
import CheckoutPage from "./pages/user/Checkout";

import Carousel from "./components/user/Carousel";
import ExploreMenu from "./components/user/ExploreMenu";
import Fooddisplay from "./pages/user/Fooddisplay";
import ExploreAndFood from "./components/user/ExploreAndFood";
import About from "./pages/user/About";
import Explore from "./pages/Explore";

/* ===== CONTEXT ===== */
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/user/Navbar";



function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        {/* Global Toast Notifications */}
        <ToastContainer position="top-right" autoClose={2000} />

        <Routes>
          {/* ===== COMMON ===== */}
          <Route path="/" element={<Homepage />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/navbar" element={<Navbar />} />
          <Route path="/carousel" element={<Carousel />} />
          <Route path="/exploremenu" element={<ExploreMenu />} />
          <Route path="/fooddisplay" element={<Fooddisplay />} />
          <Route path="/exploreandfood" element={<ExploreAndFood />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />

          {/* ===== AUTH ===== */}
          <Route path="/reg" element={<Register />} />
          <Route path="/log" element={<Login />} />

          {/* ===== USER ===== */}
          <Route path="/restaurant/:restaurantId/menu" element={<ExploreAndFood />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<Orderpage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* ===== ADMIN ===== */}
          <Route path="/home" element={<AdminHome />} />
          <Route path="/admin" element={<Admindashboard />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/menubar" element={<Menubar />} />
          <Route path="/addfood" element={<AddFood />} />
          <Route path="/listfood" element={<ListFood />} />
          <Route path="/adminorder" element={<AdminOrder />} />
          
        </Routes>

      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
