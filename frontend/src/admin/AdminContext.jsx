import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { adminService, productService } from '../services/api';
import apiClient from '../services/apiClient';
import { getProductImageUrl } from '../utils/imageUtils';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // Admin authentication state
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('leafinlife_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Load products from backend
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await adminService.getAdminProducts({ limit: 100 });
      const list = res.products || (Array.isArray(res) ? res : []);
      const mapped = list.map((p) => {
        const rawPrimary = (p.images && p.images[0]) || p.primaryImage || '/assets/images/prod-p2.jpg';
        const sellingPrice = p.price;
        const compareAtPrice = p.comparePrice !== undefined && p.comparePrice !== null
          ? p.comparePrice
          : (p.discountPrice && p.discountPrice < p.price ? p.price : undefined);

        return {
          ...p,
          _id: p._id || p.id,
          id: p._id || p.id,
          title: p.name || p.title,
          price: sellingPrice,
          comparePrice: compareAtPrice,
          primaryImage: getProductImageUrl(rawPrimary),
          stock: p.stock !== undefined ? p.stock : 0,
          inStock: Number(p.stock) > 0,
          sku: p.sku || `LIL-${p._id}`,
          status: p.status || 'active',
        };
      });
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load categories from backend
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const list = await productService.getCategories();
      if (Array.isArray(list)) {
        setCategories(
          list.map((c) => ({
            id: c._id || c.id || c.slug,
            name: c.name || c.label,
            slug: c.slug,
            description: c.description || 'Authentic Kerala herbal formulation',
            image: c.image || '',
            isActive: c.isActive !== false,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load orders from backend
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const list = await adminService.getAllOrders();
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load customers from backend
  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await adminService.getCustomers({ limit: 50 });
      setCustomers(res.customers || []);
    } catch (err) {
      console.error('Failed to load admin customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Load dashboard stats
  const loadDashboardStats = async () => {
    setLoadingDashboard(true);
    try {
      const data = await adminService.getDashboardStats();
      if (data && data.stats) {
        setDashboardStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadProducts();
      loadCategories();
      loadOrders();
      loadCustomers();
      loadDashboardStats();
    }
  }, [adminUser]);

  // Admin login via real backend API
  const adminLogin = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (data.success && data.user) {
        if (data.user.role !== 'admin') {
          return {
            success: false,
            message: 'Access denied: You do not have administrator privileges.',
          };
        }

        setAdminUser(data.user);
        localStorage.setItem('leafinlife_admin_user', JSON.stringify(data.user));
        localStorage.setItem('leafinlife_admin_token', data.token);
        localStorage.setItem('leafinlife_user_token', data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Invalid admin credentials.',
      };
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('leafinlife_admin_user');
    localStorage.removeItem('leafinlife_admin_token');
  };

  // Product CRUD
  const addProduct = async (productData, imageFile = null) => {
    try {
      let finalImages = productData.images;

      // If a new image File was selected, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append('images', imageFile);
        const uploadRes = await adminService.uploadImages(formData);
        if (uploadRes?.urls && uploadRes.urls.length > 0) {
          finalImages = uploadRes.urls;
        }
      }

      if (!finalImages || finalImages.length === 0) {
        finalImages = [productData.primaryImage || '/assets/images/prod-p2.jpg'];
      }

      const created = await adminService.createProduct({
        name: productData.title || productData.name,
        description: productData.description || '',
        price: Number(productData.price) || 0,
        discountPrice: productData.comparePrice ? Number(productData.price) : undefined,
        comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
        category: productData.category || 'Ayurvedic Drops',
        stock: Number(productData.stock) || 0,
        sku: productData.sku || `SKU-LIL-${Date.now().toString().slice(-4)}`,
        images: finalImages,
        status: 'active',
      });
      await loadProducts();
      return created;
    } catch (err) {
      console.error('Failed to create product:', err);
      throw err;
    }
  };

  const editProduct = async (id, updatedFields, imageFile = null) => {
    try {
      let finalImages = updatedFields.images;

      // If a new image File was selected, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append('images', imageFile);
        const uploadRes = await adminService.uploadImages(formData);
        if (uploadRes?.urls && uploadRes.urls.length > 0) {
          finalImages = uploadRes.urls;
        }
      }

      // If neither a new file was uploaded nor updatedFields.images was provided,
      // but updatedFields.primaryImage is explicitly set to a custom URL, use it
      if (!finalImages && updatedFields.primaryImage) {
        finalImages = [updatedFields.primaryImage];
      }

      const updatePayload = {
        name: updatedFields.title || updatedFields.name,
        description: updatedFields.description,
        price: updatedFields.price !== undefined ? Number(updatedFields.price) : undefined,
        comparePrice: updatedFields.comparePrice !== undefined
          ? (updatedFields.comparePrice ? Number(updatedFields.comparePrice) : null)
          : undefined,
        stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : undefined,
        category: updatedFields.category,
        sku: updatedFields.sku,
        status: updatedFields.status,
      };

      // Only pass images if a new image was uploaded or provided, preserving existing otherwise
      if (finalImages !== undefined && finalImages.length > 0) {
        updatePayload.images = finalImages;
      }

      const updated = await adminService.updateProduct(id, updatePayload);
      await loadProducts();
      return updated;
    } catch (err) {
      console.error('Failed to edit product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await adminService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => String(p._id) !== String(id)));
    } catch (err) {
      console.error('Failed to delete product:', err);
      throw err;
    }
  };

  const updateProductStock = async (id, newStock) => {
    try {
      await adminService.updateStock(id, newStock);
      setProducts((prev) =>
        prev.map((p) => (String(p._id) === String(id) ? { ...p, stock: Number(newStock) } : p))
      );
    } catch (err) {
      console.error('Failed to update stock:', err);
      throw err;
    }
  };

  // Category CRUD
  const addCategory = async (catData) => {
    try {
      const created = await adminService.createCategory(catData);
      await loadCategories();
      return created;
    } catch (err) {
      console.error('Failed to add category:', err);
      throw err;
    }
  };

  const editCategory = async (id, catData) => {
    try {
      const updated = await adminService.updateCategory(id, catData);
      await loadCategories();
      return updated;
    } catch (err) {
      console.error('Failed to edit category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await adminService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      throw err;
    }
  };

  // Order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      return updated;
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
  };

  // Order cancellation
  const cancelOrder = async (orderId, reason = 'Cancelled by administrator') => {
    try {
      const { data } = await apiClient.patch(`/orders/${orderId}/cancel`, { reason });
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: 'Cancelled', cancellationReason: reason } : o))
      );
      return data.order || data;
    } catch (err) {
      console.error('Failed to cancel order:', err);
      throw err;
    }
  };

  // Image Upload helper
  const uploadProductImage = async (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append('images', file));
    } else {
      formData.append('images', files);
    }
    const res = await adminService.uploadImages(formData);
    return res.urls || [];
  };

  // Computed metrics with fallback if API dashboardStats is pending or loading
  const metrics = useMemo(() => {
    const stats = dashboardStats?.stats;
    const computedSales = orders
      .filter((o) => o.paymentStatus === 'Completed' || o.orderStatus === 'Delivered')
      .reduce((sum, o) => sum + (Number(o.pricing?.grandTotal) || 0), 0);

    const lowStock = products.filter((p) => (Number(p.stock) || 0) <= 10).length;

    return {
      totalSales: stats?.totalRevenue !== undefined ? stats.totalRevenue : computedSales,
      totalOrders: stats?.totalOrders !== undefined ? stats.totalOrders : orders.length,
      totalProducts: stats?.totalProducts !== undefined ? stats.totalProducts : products.length,
      totalCustomers: stats?.totalCustomers !== undefined ? stats.totalCustomers : customers.length,
      pendingOrders: stats?.pendingOrders !== undefined ? stats.pendingOrders : orders.filter((o) => o.orderStatus === 'Pending').length,
      deliveredOrders: stats?.deliveredOrders !== undefined ? stats.deliveredOrders : orders.filter((o) => o.orderStatus === 'Delivered').length,
      lowStockCount: lowStock,
    };
  }, [dashboardStats, orders, products, customers]);

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        adminLogin,
        adminLogout,
        metrics,
        cancelOrder,
        products,
        loadingProducts,
        addProduct,
        editProduct,
        deleteProduct,
        updateProductStock,
        loadProducts,
        categories,
        loadingCategories,
        addCategory,
        editCategory,
        deleteCategory,
        loadCategories,
        orders,
        loadingOrders,
        updateOrderStatus,
        loadOrders,
        customers,
        loadingCustomers,
        loadCustomers,
        dashboardStats,
        loadingDashboard,
        loadDashboardStats,
        uploadProductImage,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
