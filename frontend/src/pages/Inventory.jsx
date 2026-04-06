import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const Inventory = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory').then((res) => res.data.data),
  });

  if (isLoading) return <div className="flex justify-center p-8 text-slate-500">Loading inventory...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Status</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time stock levels and warehouse distribution.</p>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Warehouse</th>
              <th className="px-6 py-3 text-right">Qty On Hand</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.map((item) => {
              const p = item.Product;
              const isLowStock = item.quantity <= p.reorder_level;
              const isCritical = item.quantity <= p.reorder_level / 2;

              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-800">{p.sku}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.warehouse_id || 'Main'}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-right">{item.quantity}</td>
                  <td className="px-6 py-4">
                    {isCritical ? (
                      <span className="px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold uppercase tracking-wider">Critical</span>
                    ) : isLowStock ? (
                      <span className="px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold uppercase tracking-wider">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">Healthy</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
