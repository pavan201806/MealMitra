import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../contexts/CartContext";
import api from "../../services/api";
import Navbar from "../../components/user/Navbar";

function CartPage() {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { restaurantId, setCartCount } = useCart();

  const userId = localStorage.getItem("userId");

  // -----------------------------------
  // LOAD CART + ITEMS
  // -----------------------------------
  useEffect(() => {
    if (!userId) {
      toast.info("Please login to view cart");
      navigate("/log");
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
      
      // 1️⃣ Get active cart
      const cartRes = await api.get("/api/cart/active", {
        params: { userId, restaurantId },
      });

      setCart(cartRes.data);

      // 2️⃣ Get cart items
      const itemsRes = await api.get(
        `/api/cart/${cartRes.data.id}/items`
      );

      setItems(itemsRes.data);
      
      // 3️⃣ Update cart count in context
      const totalQuantity = itemsRes.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQuantity);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        // No active cart, that's okay
        setItems([]);
        setCartCount(0);
      } else {
        toast.error("❌ Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------
  // REMOVE ITEM
  // -----------------------------------
  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/api/cart/item/${cartItemId}`);
      toast.success("🗑️ Item removed");
      // loadCart will update cart count automatically
      loadCart();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to remove item");
    }
  };

  // -----------------------------------
  // PRICE CALCULATION
  // -----------------------------------
  const subtotal = items.reduce(
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0
  );

  const deliveryFee = subtotal > 0 ? 50 : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  // -----------------------------------
  // UI
  // -----------------------------------
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2 className="mb-4">Your Cart</h2>

      <div className="row">
        {/* CART ITEMS */}
        <div className="col-md-8">
          {items.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.menuItem.name}</td>
                    <td>₹{item.menuItem.price}</td>
                    <td>{item.quantity}</td>
                    <td>
                      ₹{item.menuItem.price * item.quantity}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* SUMMARY */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Order Summary</h5>
              <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p>Delivery: ₹{deliveryFee.toFixed(2)}</p>
              <p>Tax (5%): ₹{tax.toFixed(2)}</p>
              <hr />
              <h5>Total: ₹{total.toFixed(2)}</h5>

              <button
                className="btn btn-primary w-100 mt-3"
                disabled={items.length === 0}
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default CartPage;
