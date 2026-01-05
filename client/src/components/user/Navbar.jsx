import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { cartCount, setCartCount } = useCart();

  // role and userId from localStorage
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));

  // Update role and userId on mount and when localStorage changes
  useEffect(() => {
    const updateAuthState = () => {
      setRole(localStorage.getItem("role"));
      setUserId(localStorage.getItem("userId"));
    };

    // Check on mount
    updateAuthState();

    // Listen to storage events (cross-tab)
    window.addEventListener("storage", updateAuthState);
    
    // Listen to custom event for same-tab updates
    window.addEventListener("authStateChange", updateAuthState);
    
    return () => {
      window.removeEventListener("storage", updateAuthState);
      window.removeEventListener("authStateChange", updateAuthState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setUserId(null);
    setCartCount(0);
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary px-4">
      <div className="container-fluid">

        {/* LOGO */}
        <Link className="navbar-brand" to="/">
          <img
            src="/assets/munchly.png"
            alt="Munchly"
            style={{ height: "55px" }}
          />
        </Link>

        {/* LEFT MENU */}
        {role !== "admin" && (
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/explore">Explore</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
          </ul>
        )}

        {/* RIGHT MENU */}
        <div className="d-flex align-items-center gap-3">

          {/* ADMIN LINKS */}
          {role === "admin" && (
            <>
              <Link className="nav-link" to="/admin">Dashboard</Link>
              <Link className="nav-link" to="/adminorder">Orders</Link>
            </>
          )}

          {/* USER LINKS */}
          {role && role !== "admin" && (
            <>
              <Link className="nav-link" to="/orders">Orders</Link>

              {userId && (
                <Link to="/cart" className="position-relative">
                  <i className="bi bi-cart4 fs-4"></i>
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
            </>
          )}

          {/* AUTH BUTTON */}
          {role ? (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/log")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
