"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

// Definimos los tipos basados en lo que devuelve la API
export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    price: string;
    stock: number;
    product: {
      id: string;
      name: string;
      images: { url: string; isMain: boolean }[];
    };
  };
}

export interface CartData {
  id: string;
  userId: string;
  items: CartItem[];
}

interface CartContextType {
  cart: CartData | null;
  isLoading: boolean;
  totalItems: number;
  subtotal: number;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = async () => {
    if (status !== "authenticated") {
      setCart(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [status]);

  const addToCart = async (variantId: string, quantity = 1) => {
    if (status !== "authenticated") return false;
    
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });
      
      if (res.ok) {
        await refreshCart();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return false;
    
    // Optimistic update
    const previousCart = cart;
    if (cart) {
      setCart({
        ...cart,
        items: cart.items.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      });
    }

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      
      if (!res.ok) throw new Error();
      return true;
    } catch {
      setCart(previousCart); // Rollback
      return false;
    }
  };

  const removeItem = async (itemId: string) => {
    // Optimistic update
    const previousCart = cart;
    if (cart) {
      setCart({
        ...cart,
        items: cart.items.filter(item => item.id !== itemId)
      });
    }

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error();
      return true;
    } catch {
      setCart(previousCart); // Rollback
      return false;
    }
  };

  const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal = cart?.items.reduce((acc, item) => acc + (Number(item.variant.price) * item.quantity), 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      totalItems,
      subtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
