import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../AdminContext';

export default function AdminDashboardPage() {
  const { metrics = {}, orders = [], products = [] } = useAdmin();

  const safeMetrics = {
    totalSales: metrics?.totalSales || 0,
    totalOrders: metrics?.totalOrders || 0,
    totalProducts: metrics?.totalProducts || 0,
    totalCustomers: metrics?.totalCustomers || 0,
    lowStockCount: metrics?.lowStockCount || 0,
    ...metrics,
  };

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: formatPrice(safeMetrics.totalSales),
      subtitle: 'Net confirmed revenue',
      icon: (
        <svg className="w-6 h-6 text-[#586c38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-emerald-50/60',
    },
    {
      title: 'Total Orders',
      value: safeMetrics.totalOrders,
      subtitle: `${(orders || []).filter((o) => o?.orderStatus === 'Delivered').length} delivered successfully`,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      bg: 'bg-blue-50/60',
    },
    {
      title: 'Active Products',
      value: safeMetrics.totalProducts,
      subtitle: `${safeMetrics.lowStockCount} items low stock`,
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bg: 'bg-amber-50/60',
    },
    {
      title: 'Registered Customers',
      value: safeMetrics.totalCustomers,
      subtitle: 'Active wellness buyers',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bg: 'bg-purple-50/60',
    },
  ];

  return (
    <div className="space-y-8 font-sans text-sm">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-heading font-bold text-stone-900">
            Welcome to Leaf In Life Admin
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time analytics and store management overview
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products?action=new"
            className="px-4 py-2 bg-[#2f3e10] hover:bg-[#586c38] text-white text-sm font-semibold rounded uppercase tracking-wider transition-colors shadow-xs"
          >
            + Add New Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-semibold rounded uppercase tracking-wider transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold font-heading text-stone-900 mt-1">
                {card.value}
              </h3>
              <p className="text-xs text-stone-500 mt-1">{card.subtitle}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Dual Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0f0f0]">
            <div>
              <h2 className="text-lg font-heading font-semibold text-stone-900">
                Recent Store Orders
              </h2>
              <p className="text-sm text-stone-500">Latest customer transactions</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-[#586c38] hover:underline"
            >
              See all ({orders.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-xs">
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.orderId} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 font-medium text-stone-900 text-sm">
                      <Link
                        to={`/admin/orders/${order.orderId}`}
                        className="text-[#586c38] hover:underline font-semibold"
                      >
                        #{order.orderId}
                      </Link>
                    </td>
                    <td className="py-3 text-stone-700 text-sm">
                      <p className="font-medium">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                      </p>
                      <p className="text-xs text-stone-400">{order.customer?.emailOrPhone}</p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.orderStatus || 'Processing'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-stone-900 text-sm">
                      {formatPrice(order.pricing?.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock & Inventory Attention (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0f0f0]">
            <div>
              <h2 className="text-lg font-heading font-semibold text-stone-900">
                Inventory Alerts
              </h2>
              <p className="text-sm text-stone-500">Low or depleted stock items</p>
            </div>
            <Link
              to="/admin/inventory"
              className="text-sm font-semibold text-[#586c38] hover:underline"
            >
              Inventory Manager →
            </Link>
          </div>

          <div className="space-y-3">
            {products
              .filter((p) => (Number(p.stock) || 0) <= 15)
              .slice(0, 5)
              .map((prod) => (
                <div
                  key={prod._id}
                  className="p-3 rounded-lg border border-stone-200 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={prod.primaryImage}
                      alt={prod.title}
                      className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-stone-900 truncate max-w-[180px] text-sm">
                        {prod.title}
                      </p>
                      <p className="text-xs text-stone-500">{formatPrice(prod.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                        (Number(prod.stock) || 0) === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {prod.stock || 0} in stock
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

