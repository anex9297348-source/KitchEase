import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStore } from './StoreContext.tsx';

interface CartContextType {
  quantity: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (qty?: number) => void;
  updateQuantity: (qty: number) => void;
  removeItem: () => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  savings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kitchease_cart_qty';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { product } = useStore();
  const [quantity, setQuantity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? Math.max(0, parseInt(saved, 10)) : 1;
    } catch {
      return 1;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, quantity.toString());
  }, [quantity]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (qty: number = 1) => {
    setQuantity((prev) => {
      const current = prev === 0 ? 0 : prev;
      return Math.min(20, current + qty);
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (qty: number) => {
    if (qty <= 0) {
      setQuantity(0);
    } else {
      setQuantity(Math.min(20, qty));
    }
  };

  const removeItem = () => {
    setQuantity(0);
  };

  const clearCart = () => {
    setQuantity(0);
  };

  const unitPrice = product ? product.price : 29.99;
  const originalPrice = product ? product.originalPrice : 49.99;

  const subtotal = Math.round(unitPrice * quantity * 100) / 100;
  const originalTotal = Math.round(originalPrice * quantity * 100) / 100;
  const savings = Math.max(0, Math.round((originalTotal - subtotal) * 100) / 100);
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        quantity,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        total,
        savings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
