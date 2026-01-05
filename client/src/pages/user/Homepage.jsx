import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "../../components/user/Carousel";
import api from "../../services/api";
import { toast } from "react-toastify";

function Homepage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get("/api/restaurants");
        setRestaurants(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}/menu`);
  };

  return (
    <main>
        {/* Hero Carousel */}
        <section>
          <Carousel />
        </section>

        {/* Restaurants Section */}
        <section className="container py-5">
          <h2 className="mb-4 text-center fw-bold">Our Restaurants</h2>
          
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="row g-4">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="col-md-4 col-lg-3">
                  <div
                    className="card shadow-sm h-100"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRestaurantClick(restaurant.id)}
                  >
                    <div
                      className="card-img-top bg-secondary"
                      style={{
                        height: "200px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "3rem",
                      }}
                    >
                      <i className="bi bi-shop"></i>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{restaurant.name}</h5>
                      <p className="card-text text-muted small mb-2">
                        <i className="bi bi-geo-alt"></i> {restaurant.location || "Location not available"}
                      </p>
                      <span
                        className={`badge ${
                          restaurant.isOpen ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info text-center">
              No restaurants available at the moment.
            </div>
          )}
        </section>
      </main>
  );
}

export default Homepage;

