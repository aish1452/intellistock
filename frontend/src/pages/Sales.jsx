import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Sales = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => api.get('/sales?limit=25').then((res) => res.data.data),
  });

  if (isLoading) return <div className="flex justify-center p-8 text-slate-500">Loading sales data...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Records</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage recent transactions.</p>
        </div>
        {(user?.role !== 'viewer') && (
          <button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
            Record Sale
          </button>
        )}
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3 text-right">Qty</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3">Region/Channel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">{sale.sale_date}</td>
                <td className="px-6 py-4 text-slate-800 font-medium">
                  {sale.Product?.name} <span className="text-slate-400 font-mono text-[11px] ml-1">({sale.Product?.sku})</span>
                </td>
                <td className="px-6 py-4 text-right text-slate-700">{sale.quantity}</td>
                <td className="px-6 py-4 text-right text-slate-600">${parseFloat(sale.unit_price).toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">${parseFloat(sale.total_price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-700 text-xs font-semibold uppercase tracking-wider">{sale.region}</span>
                    <span className="text-slate-500 text-[10px] mt-0.5">{sale.channel}</span>
                  </div>
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                 <td colSpan="6" className="text-center py-8 text-slate-500">No recent sales found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
