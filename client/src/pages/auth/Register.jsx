import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER", // ✅ default
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/user/register", form);

      toast.success("✅ Registered successfully! Please login.");

      setTimeout(() => {
        navigate("/log");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data || "❌ Registration failed");
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-4">Create Account</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Username"
              required
              onChange={handleChange}
            />
            <label>Username</label>
          </div>

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

          {/* ROLE */}
          <select
            className="form-select mb-3"
            name="role"
            onChange={handleChange}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button className="btn btn-success w-100">Register</button>

          <p className="text-center mt-3">
            Already have an account? <Link to="/log">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
