import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import ProductCard from '../components/common/ProductCard';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { wishlist, wishlistCount, loadingWishlist } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!authLoading && !isAuthenticated) {
      navigate('/account/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/account/login');
  };

  return (
    <div className="account-scope min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumb Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-xs text-stone-400 mb-2 font-medium">
            <Link to="/" className="text-[#586c38] hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link to="/account" className="text-[#586c38] hover:underline">
              My Account
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-semibold">My Wishlist</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-heading font-medium text-stone-900">
            My Wishlist ({wishlistCount})
          </h1>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountSidebar user={user} onLogout={handleLogout} />

          {/* Wishlist Content */}
          <div className="flex-1 w-full bg-white border border-[#e5e5e5] rounded-lg p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f0]">
              <div>
                <h2 className="text-lg font-heading font-semibold text-stone-900">
                  Saved Healthcare Products
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Products you've saved to purchase later
                </p>
              </div>
            </div>

            {loadingWishlist ? (
              <div className="py-16 text-center text-stone-500">
                <div className="w-8 h-8 border-3 border-[#586c38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">Loading your wishlist...</p>
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#fef9ea] rounded-full flex items-center justify-center mx-auto mb-4 text-[#586c38]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-semibold text-stone-900 mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-sm text-stone-600 max-w-sm mx-auto mb-6">
                  Save your favorite Ayurvedic remedies, drops, and formulations here for easy ordering later.
                </p>
                <Link
                  to="/collections/all"
                  className="inline-block px-6 py-2.5 bg-[#2f3e10] hover:bg-[#586c38] text-white text-xs uppercase tracking-wider font-semibold rounded transition"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {wishlist.map((item) => {
                  const normalizedProduct = {
                    _id: item.productId || item._id || item.id,
                    name: item.name || item.title,
                    title: item.title || item.name,
                    slug: item.slug,
                    price: item.price,
                    comparePrice: item.comparePrice,
                    primaryImage: item.image || item.primaryImage,
                    secondaryImage: item.image || item.primaryImage,
                    inStock: item.inStock !== undefined ? item.inStock : true,
                  };

                  return (
                    <ProductCard
                      key={String(normalizedProduct._id)}
                      product={normalizedProduct}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

