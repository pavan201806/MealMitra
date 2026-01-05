import { useEffect, useState } from "react";
import api from "../../services/api";

function Admindashboard() {

  const [data, setData] = useState([]);
  const [isupdate, setisupdate] = useState(false);
  const [id, setid] = useState(null);

  const [form, setForm] = useState({
    name: "",        
    description: "",
    category: "",
    price:""
  });

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (!isupdate) {
        const res = await api.post("/api/admin/addItem", form

        );
        alert(res.data);
      } else {
        await api.put(`/api/admin/update/${id}`, form);
        alert("Task updated");
        setisupdate(false);
        setid(null);
      }

      // ✅ FIXED: correct form reset fields
      setForm({ name: "", description: "", category: "", price: "" }); // Reset form
      getData(); // Refresh data
    } catch (err) {
      alert(err.response?.data || "Error occurred");
      console.log(err);
    }
  };


  const getData = async () => {
    try {
      const res = await api.get("/api/admin/getall");
      console.log(res);
      setData(res.data);
    } 
    catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getData();
  }, []);


  const update = (d) => {
    // ✅ FIXED: correct field names
    setForm({
      name: d.name,
      description: d.description,
      category: d.category,
      price: d.price
    });
    setisupdate(true);
    setid(d.id);
  };

  const del = async (id) => {
    try {
      await api.delete(`/api/admin/delete/${id}`);
      alert("Task deleted");
      getData(); // Refresh
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1>Admin Dashboard</h1>

      <form onSubmit={submit}>
        <input value={form.name} onChange={change} name="name" placeholder="Name" type="text" required/>
        <input value={form.description} onChange={change} name="description" placeholder="Description" type="text" required/>
        <input value={form.price} onChange={change} name="price" placeholder="price" type="number" required/>
        
        <select name="category" value={form.category} onChange={change} required>
          <option value="">Select Category</option>
          <option value="biryani">Biryani</option>
          <option value="meal">Meals</option>
        </select>
        <button type="submit" >
          {isupdate ? "Update Task" : "Add Task"}
        </button>
      </form>

      <table border="1" style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th colSpan="2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan="7">No tasks available</td></tr>
          ) : (
            data.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.description}</td>
                <td>{d.category}</td>
                <td>{d.price}</td>
                {/* ✅ FIXED: correct handlers */}
                <td><button onClick={() => del(d.id)}>Delete</button></td>
                <td><button onClick={() => update(d)}>Update</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>


      
    </>
  );
}

export default Admindashboard;

