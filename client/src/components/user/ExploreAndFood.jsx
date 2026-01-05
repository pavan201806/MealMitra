import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import { categories } from "../../assets/assets";
import api from "../../services/api";
import Navbar from "./Navbar";

function ExploreAndFood() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { setCartCount, setRestaurantId } = useCart();

  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVegType, setSelectedVegType] = useState(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  // ------------------------------------
  // FETCH RESTAURANT & MENU ITEMS
  // ------------------------------------
  useEffect(() => {
    if (!restaurantId) {
      toast.error("Restaurant ID missing");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch restaurant details
        const restaurantRes = await api.get(`/api/restaurants/${restaurantId}`);
        setRestaurant(restaurantRes.data);
        
        // Set restaurantId in context
        setRestaurantId(parseInt(restaurantId));

        // Fetch menu items
        const menuRes = await api.get(`/api/menu/restaurant/${restaurantId}`);
        setAllItems(menuRes.data);
        setFilteredItems(menuRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load restaurant menu");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId, navigate, setRestaurantId]);

  // ------------------------------------
  // FRONTEND FILTERING
  // ------------------------------------
  useEffect(() => {
    let items = [...allItems];

    if (selectedCategory !== "all") {
      items = items.filter(
        (i) =>
          i.category?.name?.toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    if (selectedVegType) {
      items = items.filter(
        (i) => i.type?.toLowerCase() === selectedVegType
      );
    }

    items = items.filter(
      (i) => i.price >= minPrice && i.price <= maxPrice
    );

    setFilteredItems(items);
  }, [selectedCategory, selectedVegType, minPrice, maxPrice, allItems]);

  // ------------------------------------
  // ADD TO CART
  // ------------------------------------
  const addToCart = async (menuItemId) => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (!userId || !role) {
      toast.info("Please login to add items to cart");
      navigate("/log");
      return;
    }

    if (role === "admin") {
      toast.info("Admins cannot add items to cart");
      return;
    }

    try {
      await api.post("/api/cart/add", null, {
        params: {
          userId,
          restaurantId: parseInt(restaurantId),
          menuItemId,
          quantity: 1,
        },
      });

      // Reload cart to get accurate count
      // For immediate feedback, increment count
      setCartCount((prev) => prev + 1);
      toast.success("Item added to cart");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add item");
    }
  };

  const scrollLeft = () =>
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });

  const scrollRight = () =>
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-menu px-4">
      <Navbar />
      
      {restaurant && (
        <div className="mb-4">
          <h2 className="fw-bold">{restaurant.name}</h2>
          <p className="text-muted">
            <i className="bi bi-geo-alt"></i> {restaurant.location || "Location not available"}
            {" "}
            <span className={`badge ${restaurant.isOpen ? "bg-success" : "bg-danger"} ms-2`}>
              {restaurant.isOpen ? "Open" : "Closed"}
            </span>
          </p>
        </div>
      )}

      <h3 className="d-flex justify-content-between align-items-center mb-4">
        Explore Menu
        <div>
          <i className="bi bi-arrow-left-circle fs-3 me-2" onClick={scrollLeft} style={{ cursor: "pointer" }} />
          <i className="bi bi-arrow-right-circle fs-3" onClick={scrollRight} style={{ cursor: "pointer" }} />
        </div>
      </h3>

      {/* CATEGORY SCROLL */}
      <div ref={scrollRef} className="d-flex gap-4 overflow-auto py-3">
        {categories.map((c) => (
          <div
            key={c.category}
            onClick={() => setSelectedCategory(c.category)}
            style={{ cursor: "pointer" }}
            className="text-center"
          >
            <img
              src={c.icon}
              alt={c.category}
              style={{ width: 120, height: 120, borderRadius: "50%" }}
            />
            <p>{c.category}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="d-flex gap-3 my-3">
        <button
          className={`btn btn-sm ${
            selectedVegType === null ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setSelectedVegType(null)}
        >
          All
        </button>
        <button
          className={`btn btn-sm ${
            selectedVegType === "veg"
              ? "btn-success"
              : "btn-outline-success"
          }`}
          onClick={() => setSelectedVegType("veg")}
        >
          Veg
        </button>
        <button
          className={`btn btn-sm ${
            selectedVegType === "non-veg"
              ? "btn-danger"
              : "btn-outline-danger"
          }`}
          onClick={() => setSelectedVegType("non-veg")}
        >
          Non-Veg
        </button>
      </div>

      {/* FOOD GRID */}
      <div className="row">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100">
                <img
                  src={
                    item.imageUrl
                      ? `${api.defaults.baseURL}/admin/images/${item.imageUrl}`
                      : categories[0].icon
                  }
                  className="card-img-top"
                  style={{ height: 200, objectFit: "cover" }}
                  onError={(e) => (e.target.src = categories[0].icon)}
                />
                <div className="card-body">
                  <h5>{item.name}</h5>
                  <p className="text-muted">{item.description}</p>
                  <div className="d-flex justify-content-between">
                    <strong>₹ {item.price}</strong>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => addToCart(item.id)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No items found</p>
        )}
      </div>
    </div>
  );
}

export default ExploreAndFood;
