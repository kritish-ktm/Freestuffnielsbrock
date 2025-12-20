import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [interested, setInterested] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedInterested = localStorage.getItem("interested");
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedInterested) setInterested(JSON.parse(savedInterested));
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Save interested to localStorage
  useEffect(() => {
    localStorage.setItem("interested", JSON.stringify(interested));
  }, [interested]);

  // Cart functions
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // Interested functions
  const addToInterested = (product) => {
    setInterested((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (!exists) {
        return [...prev, product];
      }
      return prev;
    });
  };

  const removeFromInterested = (id) => {
    setInterested((prev) => prev.filter((item) => item.id !== id));
  };

  const isInterested = (id) => {
    return interested.some((item) => item.id === id);
  };

  const clearInterested = () => setInterested([]);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        clearCart,
        interested,
        addToInterested,
        removeFromInterested,
        isInterested,
        clearInterested
      }}
    >
      {children}
    </CartContext.Provider>
  );
}