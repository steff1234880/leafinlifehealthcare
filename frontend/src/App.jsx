import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { AdminProvider } from './admin/AdminContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SearchModal from './components/layout/SearchModal';
import LoginModal from './components/layout/LoginModal';
import MobileToolbar from './components/layout/MobileToolbar';
import BackToTop from './components/layout/BackToTop';
import CartNotification from './components/layout/CartNotification';
import QuickAddModal from './components/common/QuickAddModal';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AboutUsPage from './pages/AboutUsPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import WishlistPage from './pages/WishlistPage';
import PlaceholderPage from './pages/PlaceholderPage';

// Admin Panel Components & Pages
import AdminLayout from './admin/components/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminProductsPage from './admin/pages/AdminProductsPage';
import AdminCategoriesPage from './admin/pages/AdminCategoriesPage';
import AdminOrdersPage from './admin/pages/AdminOrdersPage';
import AdminCustomersPage from './admin/pages/AdminCustomersPage';
import AdminInventoryPage from './admin/pages/AdminInventoryPage';
import AdminReportsPage from './admin/pages/AdminReportsPage';

function StoreLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {!isAdminRoute && (
        <>
          <Header />
          <SearchModal />
          <LoginModal />
          <CartNotification />
          <QuickAddModal />
        </>
      )}

      <div className="flex-1">
        <Routes>
          {/* Customer Facing Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/pages/about-us" element={<AboutUsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/collections/all" element={<ShopPage />} />
          <Route path="/collections/:category" element={<ShopPage />} />
          <Route path="/collections" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />
          <Route path="/blogs/news" element={<BlogListPage />} />
          <Route path="/blogs/news/:slug" element={<BlogDetailsPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/pages/contact" element={<PlaceholderPage title="Contact Us" />} />
          <Route path="/pages/wishlist" element={<WishlistPage />} />
          <Route path="/account/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<MyOrdersPage />} />
          <Route path="/account/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/account/login" element={<LoginPage />} />
          <Route path="/account/register" element={<SignupPage />} />
          <Route path="/account/recover" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Protected Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:orderId" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<PlaceholderPage title="Page" />} />
        </Routes>
      </div>

      {!isAdminRoute && (
        <>
          <Footer />
          <BackToTop />
          <MobileToolbar />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AdminProvider>
          <Router>
            <StoreLayout />
          </Router>
        </AdminProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
