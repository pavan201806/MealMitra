import { useState } from "react";


import Sidebar from "../../components/admin/Sidebar";
import Menubar from "../../components/admin/Menubar";
import { toast } from "react-toastify"; // ✅ Import toast
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../services/api";

function AddFood() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    type: ""
  });

  const change = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (Number(form.price) <= 0) {
      toast.error("❌ Price must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      for (let key in form) {
        formData.append(key, form[key]);
      }
      if (image) {
        formData.append("image", image);
      }

      const res = await api.post(
        "/api/admin/addItem",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(`✅ ${res.data}`);

      // Reset form
      setForm({
        name: "",
        description: "",
        category: "",
        price: "",
        type: ""
      });
      setImage(null);

    } catch (err) {
      console.error(err);
      toast.error(`❌ ${err.response?.data || "Error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar />

      <div id="page-content-wrapper" className="w-100">
        <Menubar />

        <div className="container mt-4">
          <h2 className="mb-4">Add New Food Item</h2>

          <form onSubmit={submit} encType="multipart/form-data">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                value={form.name}
                onChange={change}
                name="name"
                placeholder="Enter food name"
                type="text"
                required
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                value={form.description}
                onChange={change}
                name="description"
                placeholder="Enter description"
                required
                className="form-control"
                rows="3"
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Price (₹)</label>
              <input
                value={form.price}
                onChange={change}
                name="price"
                placeholder="Enter price"
                type="number"
                required
                className="form-control"
                min="1"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={change}
                required
                className="form-select"
              >
                <option value="">-- Select Category --</option>
                <option value="biryani">Biryani</option>
                <option value="meals">Meals</option>
                <option value="tiffins">Tiffins</option>
                <option value="pizzas">Pizzas</option>
                <option value="burgers">Burgers</option>
                <option value="ice_cream">Ice Cream</option>
                <option value="desserts">Desserts</option>
                <option value="noodles">Noodles</option>
                <option value="tea">Tea</option>
                <option value="samosa">Samosa</option>
                <option value="paratha">Paratha</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={change}
                required
                className="form-select"
              >
                <option value="">-- Select Type --</option>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                accept="image/*"
                name="image"
                onChange={handleImageChange}
                required
                className="form-control"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Add Food Item"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddFood;

