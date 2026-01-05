import { useEffect, useState } from "react";

import Sidebar from "../../components/admin/Sidebar";
import Menubar from "../../components/admin/Menubar";
import { toast } from "react-toastify"; // ✅ Import toast
import api from "../../services/api";

function ListFood() {
  const [data, setData] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  const getData = async () => {
    try {
      const res = await api.get("/api/admin/getall");
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load items");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const del = async (id) => {
    try {
      await api.delete(`/api/admin/delete/${id}`);
      toast.success("✅ Item deleted");
      getData();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete");
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item.id);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category
    });
  };

  const saveUpdate = async (id) => {
    if (Number(editForm.price) <= 0) {
      toast.error("❌ Price must be greater than 0");
      return;
    }

    try {
      await api.put(
        `/api/admin/update/${id}`,
        editForm
      );
      toast.success("✅ Item updated");
      setEditItem(null);
      getData();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update");
    }
  };

  return (
    <div className="d-flex" id="wrapper">
      <Sidebar />

      <div id="page-content-wrapper">
        <Menubar />

        <div className="container-fluid">
          <div className="container mt-4">
            {data.length === 0 ? (
              <p>No menu items available.</p>
            ) : (
              <div className="row">
                {data.map((d) => (
                  <div key={d.id} className="col-md-4 mb-4">
                    <div className="card h-100 shadow-sm">
                      <img
                        src={`/api/admin/images/${d.imageUrl}`}
                        className="card-img-top"
                        alt={d.name}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{d.name}</h5>
                        <p className="card-text">{d.description}</p>
                        <p className="card-text">
                          <strong>Category:</strong> {d.category}
                        </p>
                        <p className="card-text">
                          <strong>Price:</strong> ₹{d.price}
                        </p>

                        {editItem === d.id && (
                          <div className="mt-3">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value
                                })
                              }
                              placeholder="Name"
                              className="form-control mb-2"
                            />
                            <textarea
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  description: e.target.value
                                })
                              }
                              placeholder="Description"
                              className="form-control mb-2"
                            ></textarea>
                            <input
                              type="number"
                              value={editForm.price}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  price: e.target.value
                                })
                              }
                              placeholder="Price"
                              className="form-control mb-2"
                            />
                            <input
                              type="text"
                              value={editForm.category}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category: e.target.value
                                })
                              }
                              placeholder="Category"
                              className="form-control mb-2"
                            />
                            <button
                              className="btn btn-success btn-sm me-2"
                              onClick={() => saveUpdate(d.id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditItem(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="card-footer text-end">
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleEditClick(d)}
                        >
                          Update
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => del(d.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListFood;

