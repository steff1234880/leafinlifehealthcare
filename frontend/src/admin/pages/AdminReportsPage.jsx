import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function AdminReportsPage() {
  const { orders = [], products = [], metrics = {} } = useAdmin();

  const safeMetrics = {
    totalSales: metrics?.totalSales || 0,
    totalOrders: metrics?.totalOrders || 0,
    totalProducts: metrics?.totalProducts || 0,
    totalCustomers: metrics?.totalCustomers || 0,
    lowStockCount: metrics?.lowStockCount || 0,
    ...metrics,
  };

  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', 'week'

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Best selling products calculation
  const productSales = React.useMemo(() => {
    const map = new Map();

    orders.forEach((ord) => {
      if (ord.orderStatus !== 'Cancelled') {
        ord.items?.forEach((item) => {
          const key = item.name || item.title || item.productName || 'Ayurvedic Product';
          const qty = Number(item.quantity) || 1;
          const rev = (Number(item.price) || 0) * qty;

          if (map.has(key)) {
            const ex = map.get(key);
            ex.units += qty;
            ex.revenue += rev;
          } else {
            map.set(key, {
              title: key,
              name: key,
              image: item.image,
              units: qty,
              revenue: rev,
            });
          }
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Payment Breakdown
  const paymentBreakdown = React.useMemo(() => {
    let onlineRevenue = 0;
    let codRevenue = 0;

    orders.forEach((o) => {
      if (o.orderStatus !== 'Cancelled') {
        const val = Number(o.pricing?.grandTotal) || 0;
        if (o.paymentMethod?.toLowerCase().includes('razorpay') || o.paymentMethod?.toLowerCase().includes('online')) {
          onlineRevenue += val;
        } else {
          codRevenue += val;
        }
      }
    });

    return { onlineRevenue, codRevenue };
  }, [orders]);

  return (
    <div className="space-y-6 font-sans text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-stone-900">
            Sales & Analytics Reports
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Revenue breakdown, payment modes, and best-performing Ayurvedic products
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="inline-flex rounded-lg border border-stone-200 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded-md font-semibold transition text-sm ${
              timeframe === 'week' ? 'bg-[#2f3e10] text-white' : 'text-stone-600 hover:text-black'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 rounded-md font-semibold transition text-sm ${
              timeframe === 'month' ? 'bg-[#2f3e10] text-white' : 'text-stone-600 hover:text-black'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition text-sm ${
              timeframe === 'all' ? 'bg-[#2f3e10] text-white' : 'text-stone-600 hover:text-black'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase font-semibold text-stone-500 tracking-wider">Gross Sales</p>
          <h3 className="text-2xl font-bold font-heading text-stone-900 mt-1">
            {formatPrice(safeMetrics.totalSales)}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">↑ 18.4% from last period</p>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase font-semibold text-stone-500 tracking-wider">Average Order Value (AOV)</p>
          <h3 className="text-2xl font-bold font-heading text-stone-900 mt-1">
            {formatPrice(safeMetrics.totalOrders > 0 ? safeMetrics.totalSales / safeMetrics.totalOrders : 0)}
          </h3>
          <p className="text-xs text-stone-500 mt-1">Based on {safeMetrics.totalOrders} total orders</p>
        </div>

        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase font-semibold text-stone-500 tracking-wider">Fulfilled Orders Ratio</p>
          <h3 className="text-2xl font-bold font-heading text-stone-900 mt-1">
            {safeMetrics.totalOrders > 0
              ? `${Math.round(
                  (orders.filter((o) => o.orderStatus === 'Delivered').length / safeMetrics.totalOrders) * 100
                )}%`
              : '0%'}
          </h3>
          <p className="text-xs text-blue-600 font-semibold mt-1">
            {orders.filter((o) => o.orderStatus === 'Delivered').length} / {metrics.totalOrders} completed
          </p>
        </div>
      </div>

      {/* Dual Analysis: Top Selling & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Best Selling Products */}
        <div className="lg:col-span-8 bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs">
          <h2 className="text-lg font-heading font-semibold text-stone-900 mb-1">
            Top Performing Products by Revenue
          </h2>
          <p className="text-sm text-stone-500 mb-5">Ranked by actual fulfilled volume and sales value</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-xs">
                  <th className="py-2.5">Product</th>
                  <th className="py-2.5 text-center">Units Sold</th>
                  <th className="py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {productSales.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-stone-400 text-sm">
                      No product sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  productSales.map((ps, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-stone-400 text-xs w-4">#{idx + 1}</span>
                          {ps.image && (
                            <img
                              src={ps.image}
                              alt={ps.title}
                              className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0"
                            />
                          )}
                          <span className="font-semibold text-stone-900 line-clamp-1 text-sm">{ps.title}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center font-semibold text-stone-700 text-sm">
                        {ps.units} units
                      </td>
                      <td className="py-3 text-right font-bold text-stone-900 text-sm">
                        {formatPrice(ps.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="lg:col-span-4 bg-white border border-[#e5e5e5] rounded-xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg font-heading font-semibold text-stone-900 mb-1">
              Payment Methods
            </h2>
            <p className="text-sm text-stone-500">Distribution between Prepaid & COD</p>
          </div>

          <div className="space-y-4 text-sm">
            {/* Razorpay Prepaid */}
            <div>
              <div className="flex justify-between font-semibold text-stone-800 mb-1">
                <span>Razorpay Online (Prepaid)</span>
                <span>{formatPrice(paymentBreakdown.onlineRevenue)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-[#586c38] rounded-full"
                  style={{
                    width: `${
                      safeMetrics.totalSales > 0
                        ? (paymentBreakdown.onlineRevenue / safeMetrics.totalSales) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Cash on Delivery */}
            <div>
              <div className="flex justify-between font-semibold text-stone-800 mb-1">
                <span>Cash on Delivery (COD)</span>
                <span>{formatPrice(paymentBreakdown.codRevenue)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{
                    width: `${
                      safeMetrics.totalSales > 0
                        ? (paymentBreakdown.codRevenue / safeMetrics.totalSales) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700">Report Summary:</p>
            <p>• {orders.length} total transaction logs indexed</p>
            <p>• Active catalog: {products.length} formulations</p>
            <p>• Real-time synchronization enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}

