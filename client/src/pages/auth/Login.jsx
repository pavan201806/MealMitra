import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/api/user/login", form);

      const user = res.data;

      // ✅ SAVE LOGIN STATE
      localStorage.setItem("userId", user.id);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role.toLowerCase());

      // Dispatch event to update Navbar
      window.dispatchEvent(new Event("authStateChange"));

      toast.success("✅ Login successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data || "❌ Login failed");
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Sign In</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              required
              onChange={handleChange}
            />
            <label>Email</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Password"
              required
              onChange={handleChange}
            />
            <label>Password</label>
          </div>

          <button className="btn btn-primary w-100">Login</button>

          <p className="text-center mt-3">
            New here? <Link to="/reg">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
