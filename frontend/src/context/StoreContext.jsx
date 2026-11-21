import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService, productService, wishlistService } from '../services/api';
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

  // Sync cart from backend when user logs in or mounts with authenticated session
  useEffect(() => {
    let isMounted = true;
    const fetchBackendCart = async () => {
      // If user is not authenticated, cart is maintained in localStorage for guest sessions
      if (!isAuthenticated) return;

      try {
        setLoadingCart(true);

        // Fetch current user's authenticated cart from backend API
        const backendCart = await cartService.getCart();
        const serverItems = Array.isArray(backendCart?.items) ? backendCart.items : [];

        // Check if guest/local cart items exist to merge into user account
        let localItems = [];
        try {
          const savedLocalCart = localStorage.getItem('leafinlife_cart');
          localItems = savedLocalCart ? JSON.parse(savedLocalCart) : [];
        } catch {
          localItems = [];
        }

        // If guest items exist, merge any new items into backend cart
        if (Array.isArray(localItems) && localItems.length > 0) {
          const existingServerProductIds = new Set(serverItems.map((it) => String(it.productId)));
          let didUploadGuestItem = false;

          for (const item of localItems) {
            const pId = String(item.productId || item.key);
            // If item is not already in backend cart, add it
            if (pId && !existingServerProductIds.has(pId)) {
              try {
                await cartService.addToCart(pId, item.quantity || 1);
                didUploadGuestItem = true;
              } catch (err) {
                console.warn('Failed to merge guest cart item to backend:', err.message);
              }
            }
          }

          // If we merged items, refetch updated cart from server
          if (didUploadGuestItem) {
            const updatedBackendCart = await cartService.getCart();
            if (isMounted && updatedBackendCart && Array.isArray(updatedBackendCart.items)) {
              const mapped = updatedBackendCart.items.map((it) => ({
                key: String(it.productId),
                productId: it.productId,
                title: it.name,
                name: it.name,
                price: it.price,
                image: it.image,
                quantity: it.quantity,
                subtotal: it.subtotal,
              }));
              setCart(mapped);
              return;
            }
          }
        }

        // Synchronize server items to state
        if (isMounted) {
          const mappedItems = serverItems.map((it) => ({
            key: String(it.productId),
            productId: it.productId,
            title: it.name,
            name: it.name,
            price: it.price,
            image: it.image,
            quantity: it.quantity,
            subtotal: it.subtotal,
          }));

          // If backend has items, populate state with user's authenticated cart
          if (mappedItems.length > 0) {
            setCart(mappedItems);
          } else if (Array.isArray(localItems) && localItems.length > 0) {
            // If backend was empty and guest had items that failed individual merge, attempt direct upload
            for (const item of localItems) {
              try {
                await cartService.addToCart(item.productId, item.quantity);
              } catch {
                // ignore
              }
            }
            const finalCart = await cartService.getCart();
            if (isMounted && finalCart && Array.isArray(finalCart.items) && finalCart.items.length > 0) {
              setCart(
                finalCart.items.map((it) => ({
                  key: String(it.productId),
                  productId: it.productId,
                  title: it.name,
                  name: it.name,
                  price: it.price,
                  image: it.image,
                  quantity: it.quantity,
                  subtotal: it.subtotal,
                }))
              );
            }
          } else {
            // Both are empty
            setCart([]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch backend cart:', err.message);
      } finally {
        if (isMounted) setLoadingCart(false);
      }
    };

    fetchBackendCart();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Sync wishlist from backend when user logs in or mounts with authenticated session
  useEffect(() => {
    let isMounted = true;
    const fetchBackendWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        setLoadingWishlist(true);
        const backendWishlist = await wishlistService.getWishlist();
        const serverItems = Array.isArray(backendWishlist?.items) ? backendWishlist.items : [];

        // Check if local guest wishlist has items to merge
        let localItems = [];
        try {
          const savedLocal = localStorage.getItem('leafinlife_wishlist');
          localItems = savedLocal ? JSON.parse(savedLocal) : [];
        } catch {
          localItems = [];
        }

        if (Array.isArray(localItems) && localItems.length > 0) {
          const existingIds = new Set(
            serverItems.map((it) => String(it.productId || it._id || it.id))
          );
          let didUpload = false;

          for (const item of localItems) {
            const pId = String(item.productId || item._id || item.id);
            if (pId && !existingIds.has(pId)) {
              try {
                await wishlistService.addToWishlist(pId, item);
                didUpload = true;
              } catch (err) {
                console.warn('Failed to merge guest wishlist item:', err.message);
              }
            }
          }

          if (didUpload) {
            const reloaded = await wishlistService.getWishlist();
            if (isMounted && reloaded && Array.isArray(reloaded.items)) {
              setWishlist(reloaded.items);
              return;
            }
          }
        }

        if (isMounted) {
          if (serverItems.length > 0) {
            setWishlist(serverItems);
          } else if (Array.isArray(localItems) && localItems.length > 0) {
            // Upload local items directly
            for (const item of localItems) {
              const pId = String(item.productId || item._id || item.id);
              try {
                await wishlistService.addToWishlist(pId, item);
              } catch {
                // ignore
              }
            }
            const reloaded = await wishlistService.getWishlist();
            if (isMounted && reloaded && Array.isArray(reloaded.items)) {
              setWishlist(reloaded.items);
            }
          } else {
            setWishlist([]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch backend wishlist:', err.message);
      } finally {
        if (isMounted) setLoadingWishlist(false);
      }
    };

    fetchBackendWishlist();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);
  const syncCartPrices = (catalogProducts) => {
    if (!Array.isArray(catalogProducts) || catalogProducts.length === 0) return;
    setCart((prevCart) => {
      if (!Array.isArray(prevCart) || prevCart.length === 0) return prevCart;
      let hasChanges = false;
      const updated = prevCart.map((item) => {
        const prod = catalogProducts.find(
          (p) => String(p._id || p.id) === String(item.productId)
        );
        if (!prod) return item;
        const currentPrice = prod.discountPrice ? prod.discountPrice : prod.price;
        if (currentPrice !== undefined && currentPrice !== item.price) {
          hasChanges = true;
          return {
            ...item,
            price: currentPrice,
            subtotal: Math.round(currentPrice * item.quantity * 100) / 100,
          };
        }
        return item;
      });
      return hasChanges ? updated : prevCart;
    });
  };

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
  const toggleWishlist = async (product) => {
    const pId = String(product._id || product.id || product.productId);
    const currentlyInWishlist = wishlist.some(
      (p) => String(p._id || p.id || p.productId) === pId
    );

    // Optimistic local update
    if (currentlyInWishlist) {
      setWishlist((prev) =>
        prev.filter((p) => String(p._id || p.id || p.productId) !== pId)
      );
    } else {
      setWishlist((prev) => [
        ...prev,
        {
          _id: pId,
          id: pId,
          productId: pId,
          title: product.name || product.title,
          name: product.name || product.title,
          slug: product.slug,
          image:
            product.primaryImage ||
            (product.images && product.images[0]) ||
            product.image ||
            '',
          primaryImage:
            product.primaryImage ||
            (product.images && product.images[0]) ||
            product.image ||
            '',
          price: product.discountPrice || product.price,
          comparePrice: product.comparePrice,
          inStock: product.stock !== undefined ? Number(product.stock) > 0 : true,
          addedAt: new Date().toISOString(),
        },
      ]);
    }

    // Persist to backend if authenticated
    if (isAuthenticated) {
      try {
        if (currentlyInWishlist) {
          await wishlistService.removeFromWishlist(pId);
        } else {
          await wishlistService.addToWishlist(pId, product);
        }
      } catch (err) {
        console.error('Failed to sync wishlist with backend:', err.message);
      }
    }
  };

  const isInWishlist = (productId) =>
    wishlist.some(
      (p) => String(p._id || p.id || p.productId) === String(productId)
    );

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
        syncCartPrices,
        wishlist,
        wishlistCount,
        loadingWishlist,
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
