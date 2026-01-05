import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../contexts/CartContext";
import api from "../../services/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { restaurantId, setCartCount, setRestaurantId } = useCart();

  const userId = localStorage.getItem("userId");

  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------------
  // LOAD CART + ITEMS
  // ------------------------------------
  useEffect(() => {
    if (!userId) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    if (!restaurantId) {
      toast.info("Please select a restaurant first");
      navigate("/");
      return;
    }

    loadCart();
  }, [userId, restaurantId, navigate]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartRes = await api.get("/api/cart/active", {
        params: { userId, restaurantId },
      });
      setCart(cartRes.data);

      const itemsRes = await api.get(
        `/api/cart/${cartRes.data.id}/items`
      );
      setItems(itemsRes.data || []);
      
      // Update cart count
      const totalQuantity = (itemsRes.data || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQuantity);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        // No active cart
        setItems([]);
        setCartCount(0);
        toast.info("Your cart is empty");
        navigate("/");
      } else {
        toast.error("❌ Failed to load checkout data");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // PRICE CALCULATION
  // ------------------------------------
  const subtotal = items.reduce(
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const tax = subtotal * 0.05;
  const totalAmount = subtotal + deliveryFee + tax;

  // ------------------------------------
  // PLACE ORDER
  // ------------------------------------
  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      await api.post("/api/orders/place", null, {
        params: { userId, restaurantId },
      });

      // Reset cart state after successful order
      setCartCount(0);
      setRestaurantId(null);
      
      toast.success("✅ Order placed successfully!");
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Failed to place order");
    }
  };

  // ------------------------------------
  // UI
  // ------------------------------------
  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
        <h2 className="mb-4 fw-bold">Checkout</h2>

      <div className="row g-4">
        {/* LEFT */}
        <div className="col-md-7">
          <div className="card shadow p-4">
            <h4 className="mb-3">Delivery Address</h4>
            <textarea
              className="form-control mb-3"
              rows="3"
              placeholder="Delivery address (saved later)"
              disabled
            />

            <h4 className="mb-3">Payment Method</h4>
            <p className="text-muted">
              Cash on Delivery (default)
            </p>

            <button
              className="btn btn-success w-100 mt-3"
              disabled={items.length === 0}
              onClick={placeOrder}
            >
              Place Order
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-md-5">
          <div className="card shadow p-4">
            <h4 className="mb-3">Order Summary</h4>

            {items.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between mb-2"
                  >
                    <span>
                      {item.menuItem.name} × {item.quantity}
                    </span>
                    <span>
                      ₹{item.menuItem.price * item.quantity}
                    </span>
                  </div>
                ))}

                <hr />

                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
  );
}
