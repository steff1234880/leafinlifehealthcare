import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService, productService } from '../services/api';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('leafinlife_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('leafinlife_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartNotificationOpen, setIsCartNotificationOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [loadingCart, setLoadingCart] = useState(false);

  // Sync cart from backend when user logs in
  useEffect(() => {
    const fetchBackendCart = async () => {
      if (!isAuthenticated) return;
      try {
        setLoadingCart(true);
        const backendCart = await cartService.getCart();
        if (backendCart && Array.isArray(backendCart.items)) {
          // Normalize items to match frontend schema
          const mappedItems = backendCart.items.map((it) => ({
            key: String(it.productId),
            productId: it.productId,
            title: it.name,
            name: it.name,
            price: it.price,
            image: it.image,
            quantity: it.quantity,
            subtotal: it.subtotal,
          }));
          setCart(mappedItems);
        }
      } catch (err) {
        console.warn('Could not fetch backend cart:', err.message);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchBackendCart();
  }, [isAuthenticated]);

  // Persist cart to localStorage for guest continuity & offline resiliency
  useEffect(() => {
    try {
      localStorage.setItem('leafinlife_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem('leafinlife_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  // Add to cart
  const addToCart = async (product, variant = null, quantity = 1) => {
    const pId = product._id || product.id;
    const itemPrice = product.discountPrice ? product.discountPrice : product.price;
    const itemImage =
      (product.images && product.images[0]) ||
      product.primaryImage ||
      product.image ||
      '';

    const itemTitle = product.name || product.title;

    // Optimistic local state update
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => String(i.productId) === String(pId));
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          subtotal: Math.round(newQty * itemPrice * 100) / 100,
        };
        return updated;
      }
      return [
        ...prev,
        {
          key: String(pId),
          productId: pId,
          title: itemTitle,
          name: itemTitle,
          slug: product.slug,
          url: `/products/${product.slug || pId}`,
          price: itemPrice,
          image: itemImage,
          quantity,
          subtotal: Math.round(quantity * itemPrice * 100) / 100,
        },
      ];
    });

    setLastAddedItem({
      title: itemTitle,
      image: itemImage,
      price: itemPrice,
    });
    setIsCartNotificationOpen(true);

    // If authenticated, sync with backend cart API
    if (isAuthenticated) {
      try {
        await cartService.addToCart(pId, quantity);
      } catch (err) {
        console.error('Failed to sync item with backend cart:', err.message);
      }
    }
  };

  // Update item quantity
  const updateCartItemQuantity = async (key, newQuantity) => {
    const qty = parseInt(newQuantity, 10);

    if (Number.isNaN(qty) || qty <= 0) {
      removeFromCart(key);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.key === key || String(item.productId) === String(key)
          ? { ...item, quantity: qty, subtotal: Math.round(qty * item.price * 100) / 100 }
          : item
      )
    );

    if (isAuthenticated) {
      try {
        await cartService.updateItemQuantity(key, qty);
      } catch (err) {
        console.error('Failed to update quantity on backend:', err.message);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key && String(item.productId) !== String(key)));

    if (isAuthenticated) {
      try {
        await cartService.removeItem(key);
      } catch (err) {
        console.error('Failed to remove item from backend cart:', err.message);
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    setCart([]);
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.error('Failed to clear backend cart:', err.message);
      }
    }
  };

  // Wishlist methods
  const toggleWishlist = (product) => {
    const pId = product._id || product.id;
    setWishlist((prev) => {
      const exists = prev.some((p) => (p._id || p.id) === pId);
      if (exists) {
        return prev.filter((p) => (p._id || p.id) !== pId);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => wishlist.some((p) => (p._id || p.id) === productId);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = Math.round(
    cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0) * 100
  ) / 100;
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        loadingCart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        quickViewProduct,
        setQuickViewProduct,
        isSearchOpen,
        setIsSearchOpen,
        isLoginOpen,
        setIsLoginOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isCartNotificationOpen,
        setIsCartNotificationOpen,
        lastAddedItem,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
