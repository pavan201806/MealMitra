import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import api from "../../services/api";

function Fooddisplay() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { setCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/admin/getall");
        setItems(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const addToCart = async (menuItemId) => {
    const role = localStorage.getItem("role");

    if (!role || role === "admin") {
      toast.info("⚠️ Please sign in as a customer to add items to your cart.", {
        onClose: () => navigate("/login"),
      });
      return;
    }

    try {
      await api.post(
        "/api/cart/add",
        null,
        {
          params: {
            menuItemId: menuItemId,
            quantity: 1,
          }
        }
      );

      const countRes = await api.get("/api/cart/count"
      );
      setCartCount(countRes.data);

      toast.success("✅ Item added to your cart!");
    } catch (err) {
      console.log(err);
      toast.error("❌ Something went wrong. Please try again.");
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      {/* ✅ Heading */}
      <h2 className="text-center mb-4">Our Delicious Menu</h2>

      {/* ✅ Search bar */}
      <div className="d-flex justify-content-center mb-4">
        <div className="input-group" style={{ maxWidth: "400px" }}>
          <span className="input-group-text rounded-start-5 bg-white">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control rounded-end-5"
            placeholder="Search for food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Food cards */}
      <div className="row">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="col-md-4 mb-4 d-flex">
              <div className="card shadow-sm rounded-4 overflow-hidden w-100">
                <img
                  src={`/api/admin/images/${item.imageUrl}`}
                  className="card-img-top"
                  alt={item.name}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                  <p
                    className="card-text text-muted"
                    style={{ minHeight: "48px" }}
                  >
                    {item.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="h5 mb-0">
                      ₹ {item.price.toLocaleString("en-IN")}
                    </span>
                    <div>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-half text-warning"></i>
                      <small className="text-muted ms-1">(4.5)</small>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-light border-0 d-flex justify-content-center">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => addToCart(item.id)}
                  >
                    <i className="bi bi-cart"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p>No items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Fooddisplay;

