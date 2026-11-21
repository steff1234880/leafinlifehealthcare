import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function AdminInventoryPage() {
  const { products, updateProductStock } = useAdmin();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'low', 'out'

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const stock = Number(p.stock) || 0;
    if (filterType === 'out') return matchesSearch && stock === 0;
    if (filterType === 'low') return matchesSearch && stock > 0 && stock <= 10;
    return matchesSearch;
  });

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleStockChange = (id, delta) => {
    const prod = products.find((p) => p._id === id);
    if (prod) {
      const current = Number(prod.stock) || 0;
      updateProductStock(id, Math.max(0, current + delta));
    }
  };

  return (
    <div className="space-y-6 font-sans text-sm">
      <div>
        <h1 className="text-2xl font-heading font-bold text-stone-900">
          Inventory & Stock Management
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Monitor warehouse quantities, set restocking levels and quick-adjust inventory
        </p>
      </div>

      {/* Stock Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === 'all'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Items</p>
          <p className="text-2xl font-bold font-heading mt-1">{products.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('low')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === 'low'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Low Stock (≤10)</p>
          <p className="text-2xl font-bold font-heading mt-1">
            {products.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10).length}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('out')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterType === 'out'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white border-rose-200 text-rose-800 hover:bg-rose-50'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Out of Stock (0)</p>
          <p className="text-2xl font-bold font-heading mt-1">
            {products.filter((p) => (Number(p.stock) || 0) === 0).length}
          </p>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search inventory by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm border border-stone-300 rounded focus:outline-none focus:border-[#586c38]"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Inventory Table with Quick Increment / Decrement */}
      <div className="bg-white border border-[#e5e5e5] rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider font-semibold text-xs">
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Current Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((prod) => {
              const stock = Number(prod.stock) || 0;
              return (
                <tr key={prod._id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={prod.primaryImage}
                        alt={prod.title}
                        className="w-12 h-12 object-cover rounded border border-stone-200 bg-stone-50 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-stone-900 line-clamp-1 text-sm">{prod.title}</p>
                        <p className="text-xs text-stone-500">SKU: {prod.sku || prod._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900 text-sm">
                    {formatPrice(prod.price)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    <input
                      type="number"
                      min="0"
                      value={prod.stock ?? 0}
                      onChange={(e) => updateProductStock(prod._id, e.target.value)}
                      className="w-20 h-9 text-center border border-stone-300 rounded font-bold text-sm focus:outline-none focus:border-[#586c38]"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                        stock === 0
                          ? 'bg-rose-100 text-rose-800'
                          : stock <= 10
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {stock === 0 ? 'Out of Stock' : stock <= 10 ? 'Low Stock' : 'Optimal Stock'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStockChange(prod._id, -1)}
                      disabled={stock === 0}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded text-xs disabled:opacity-40"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(prod._id, 1)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded text-xs"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(prod._id, 10)}
                      className="px-3.5 py-1.5 bg-[#2f3e10] hover:bg-[#586c38] text-white font-semibold rounded text-xs"
                    >
                      +10 Restock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

