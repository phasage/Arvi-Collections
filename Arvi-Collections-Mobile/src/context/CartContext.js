import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = async (items) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product._id);
      
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prevItems, {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || null,
          quantity: quantity,
        }];
      }
      
      saveCartToStorage(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      saveCartToStorage(newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      saveCartToStorage(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveCartToStorage([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};