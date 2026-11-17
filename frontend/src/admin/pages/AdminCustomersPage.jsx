import React, { useState } from 'react';
import { useAdmin } from '../AdminContext';

export default function AdminCustomersPage() {
  const { customers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-heading font-bold text-stone-900">
          Customer Management ({customers.length})
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          View customer profiles, purchase frequency, lifetime values and contact info
        </p>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search customers by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-xs border border-stone-300 rounded focus:outline-none focus:border-[#586c38]"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white border border-[#e5e5e5] rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Total Orders</th>
              <th className="py-3 px-4">Lifetime Spend</th>
              <th className="py-3 px-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#fef9ea] border border-[#586c38]/30 text-[#2f3e10] flex items-center justify-center font-bold text-xs">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{c.name}</p>
                      <p className="text-[11px] text-stone-400">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-stone-700">
                  {c.phone}
                </td>
                <td className="py-3 px-4 text-stone-600">
                  {c.city}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 font-semibold text-stone-700">
                    {c.totalOrders} order(s)
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-stone-900">
                  {formatPrice(c.totalSpent)}
                </td>
                <td className="py-3 px-4 text-stone-500">
                  {c.joinedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

