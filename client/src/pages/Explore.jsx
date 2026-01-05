import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";




function Explore() {
  const [items, setItems] = useState([]);

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
  try {
    const res = await api.post(
      "/api/cart/add",
      null, // no request body needed, so `null`
      {
        params: {
          menuItemId: menuItemId,
          quantity: 1
        }      }
    );
    alert(res.data); // show backend's "Item added to cart"
    } 
    catch (err) {
      console.log(err);
      alert("Error adding to cart");
    }
  };


  return (
    <>
      <div className="items-container">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>₹ {item.price}</p>
            <button onClick={() => addToCart(item.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Explore;

