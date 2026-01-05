import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [restaurantId, setRestaurantId] = useState(null);

  // Load restaurantId from localStorage on mount
  useEffect(() => {
    const savedRestaurantId = localStorage.getItem("currentRestaurantId");
    if (savedRestaurantId) {
      setRestaurantId(parseInt(savedRestaurantId));
    }
  }, []);

  // Save restaurantId to localStorage when it changes
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem("currentRestaurantId", restaurantId.toString());
    } else {
      localStorage.removeItem("currentRestaurantId");
      // Reset cart count when restaurant is cleared
      setCartCount(0);
    }
  }, [restaurantId, setCartCount]);

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      setCartCount, 
      restaurantId, 
      setRestaurantId 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
