
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axiosInstance from '../api/axiosInstance';

const CartContext = createContext();

const emptyCart = {
  items: [],
  itemCount: 0,
  subtotal: 0
};

// Add authentication token to API requests
const getAuthConfig = () => {
  const token = localStorage.getItem('accessToken');

  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  // Fetch cart items from the backend
  const fetchCart = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setCart(emptyCart);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        '/cart',
        getAuthConfig()
      );

      const data = response.data;

      setCart(data.cart || emptyCart);

      return data;
    } catch (err) {
      console.error(
        'Failed to load cart:',
        err.response?.data?.message || err.message
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Fetch cart whenever the authenticated user changes
  useEffect(() => {
    fetchCart().catch(() => {});
  }, [fetchCart]);

  // Add a product to the cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add products to your cart');
    }

    try {
      const response = await axiosInstance.post(
        '/cart',
        { productId, quantity },
        getAuthConfig()
      );

      const data = response.data;

      setCart(data.cart || emptyCart);

      return data;
    } catch (err) {
      console.error(
        'Failed to add product:',
        err.response?.data?.message || err.message
      );

      throw err;
    }
  };

  // Update the quantity of a cart item
  const updateQuantity = async (cartItemId, quantity, stock) => {
    try {
      if (quantity <= 0) {
        return await removeFromCart(cartItemId);
      }

      if (Number.isFinite(stock) && quantity > stock) {
        alert('No more items available. All available stock is already in your cart.');
        return;
      }

      const response = await axiosInstance.patch(
        `/cart/${cartItemId}`,
        { quantity },
        getAuthConfig()
      );

      const data = response.data;

      setCart(data.cart || emptyCart);

      return data;
    } catch (err) {
      console.error(
        'Cart quantity update failed:',
        err.response?.data?.message || err.message
      );

      throw err;
    }
  };

  // Remove an individual item from the cart
  const removeFromCart = async (cartItemId) => {
    try {
      const response = await axiosInstance.delete(
        `/cart/${cartItemId}`,
        getAuthConfig()
      );

      const data = response.data;

      setCart(data.cart || emptyCart);

      return data;
    } catch (err) {
      console.error(
        'Cart item removal failed:',
        err.response?.data?.message || err.message
      );

      throw err;
    }
  };

  // Clear all items from the cart
  const clearCart = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.delete(
        '/cart',
        getAuthConfig()
      );

      const data = response.data;

      setCart(data.cart || emptyCart);

      return data;
    } catch (err) {
      console.error(
        'Failed to clear cart:',
        err.response?.data?.message || err.message
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const visibleCart = user ? cart : emptyCart;

  return (
    <CartContext.Provider
      value={{
        cart: visibleCart,
        itemCount: visibleCart.itemCount || 0,
        subtotal: visibleCart.subtotal || 0,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
