import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('fashion_cube_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fashion_cube_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  // Add item with size and color selection
  const addToCart = (product, selectedSize, selectedColor, quantity = 1) => {
    setCartItems(prev => {
      const size = selectedSize || (product.size ? product.size.split(',')[0].trim() : 'Standard');
      const color = selectedColor || product.color || 'Standard';

      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        // Don't exceed available stock if known
        updated[existingIndex].quantity = product.quantity ? Math.min(newQty, product.quantity) : newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            ...product,
            selectedSize: size,
            selectedColor: color,
            quantity: Math.min(quantity, product.quantity || 99),
          },
        ];
      }
    });
  };

  const updateQuantity = (cartItemId, size, color, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId, size, color);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === cartItemId && item.selectedSize === size && item.selectedColor === color) {
          const clampedQty = item.quantity ? Math.min(newQuantity, item.stock || item.quantity || 99) : newQuantity;
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId, size, color) => {
    setCartItems(prev =>
      prev.filter(item => !(item.id === cartItemId && item.selectedSize === size && item.selectedColor === color))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + parseFloat(item.price) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
