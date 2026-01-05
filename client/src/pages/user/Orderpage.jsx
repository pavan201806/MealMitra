import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

function Orderpage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      toast.info("Please login to view orders");
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [userId, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/orders/${userId}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">Your Orders</h2>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>

        {orders.length > 0 ? (
          orders.map((order) => {
            // Handle different response shapes - could be order.items or order.orderItems
            const orderItems = order.items || order.orderItems || [];
            const status = order.status || "PLACED";
            const totalAmount = order.totalAmount || 0;
            const createdAt = order.createdAt || order.created_at;

            return (
              <div key={order.id} className="card mb-4 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span className={`badge ${
                      status === "DELIVERED" ? "bg-success" :
                      status === "PLACED" ? "bg-primary" :
                      status === "PREPARING" ? "bg-warning" :
                      "bg-secondary"
                    }`}>
                      {status}
                    </span>
                    <span className="text-muted small">
                      {createdAt
                        ? new Date(createdAt).toLocaleString()
                        : "Date not available"}
                    </span>
                  </div>

                  <div className="mb-2">
                    <strong>Order ID:</strong> #{order.id}
                    {order.restaurant && (
                      <span className="ms-3">
                        <strong>Restaurant:</strong> {order.restaurant.name || "N/A"}
                      </span>
                    )}
                  </div>

                  {orderItems.length > 0 ? (
                    <>
                      <ul className="mb-2">
                        {orderItems.map((item, idx) => (
                          <li key={idx}>
                            {item.itemName || item.menuItem?.name || "Item"} × {item.quantity || 1} — ₹
                            {(item.itemPrice || item.menuItem?.price || 0) * (item.quantity || 1)}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2">
                        <strong>Total: ₹{totalAmount.toFixed(2)}</strong>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">No items in this order</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="alert alert-info">
            <strong>No orders found.</strong>
          </div>
        )}
      </div>
  );
}

export default Orderpage;
