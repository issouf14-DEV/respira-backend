import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

// Fonction pour obtenir la clé du panier spécifique à l'utilisateur
const getCartKey = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return `cart_${userData._id || userData.id}`;
    } catch (e) {
      return 'cart_guest';
    }
  }
  return 'cart_guest';
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Mettre à jour le panier quand l'utilisateur change
  useEffect(() => {
    const handleStorageChange = () => {
      const cartKey = getCartKey();
      const savedCart = localStorage.getItem(cartKey);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };

    const handleAuthChange = () => {
      // Recharger le panier quand l'authentification change
      setTimeout(handleStorageChange, 100); // Petit délai pour laisser le localStorage se mettre à jour
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-changed', handleStorageChange);
    window.addEventListener('auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-changed', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (vehicle, options = {}) => {
    const existingItem = cartItems.find(item => 
      item.id === vehicle.id && 
      JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === vehicle.id && JSON.stringify(item.options) === JSON.stringify(options)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        ...vehicle, 
        quantity: 1,
        options,
        addedAt: new Date().toISOString()
      }]);
    }
  };

  const removeFromCart = (vehicleId, options) => {
    setCartItems(cartItems.filter(item => 
      !(item.id === vehicleId && JSON.stringify(item.options) === JSON.stringify(options))
    ));
  };

  const updateQuantity = (vehicleId, options, quantity) => {
    if (quantity <= 0) {
      removeFromCart(vehicleId, options);
      return;
    }

    setCartItems(cartItems.map(item =>
      item.id === vehicleId && JSON.stringify(item.options) === JSON.stringify(options)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    const cartKey = getCartKey();
    localStorage.removeItem(cartKey);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = parseFloat(item.price) || 0;
      const optionsPrice = Object.values(item.options || {}).reduce((sum, opt) => sum + (parseFloat(opt.price) || 0), 0);
      return total + ((basePrice + optionsPrice) * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const refreshCart = () => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
export default CartProvider;