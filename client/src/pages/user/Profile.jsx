import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Please login to view profile");
      navigate("/login");
      return;
    }

    // Fetch user data if API endpoint exists
    // For now, just show basic info from localStorage
    const userData = {
      id: localStorage.getItem("userId"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
    };
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">User Profile</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5>Account Information</h5>
                <hr />
                <div className="mb-3">
                  <strong>User ID:</strong> {user?.id}
                </div>
                <div className="mb-3">
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="mb-3">
                  <strong>Role:</strong>{" "}
                  <span className="badge bg-secondary">
                    {user?.role?.toUpperCase() || "USER"}
                  </span>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate("/orders")}
                >
                  View Orders
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
