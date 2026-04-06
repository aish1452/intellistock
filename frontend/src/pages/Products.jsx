import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { X } from 'lucide-react';

const Products = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: '', name: '', category: '', unit_price: '', reorder_level: ''
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products?limit=50').then((res) => res.data.data),
  });

  const createProduct = useMutation({
    mutationFn: (newProduct) => api.post('/products', newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setFormData({ sku: '', name: '', category: '', unit_price: '', reorder_level: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProduct.mutate({
      ...formData,
      unit_price: parseFloat(formData.unit_price),
      reorder_level: parseInt(formData.reorder_level, 10)
    });
  };

  if (isLoading) return <div className="flex justify-center p-8 text-slate-500">Loading products...</div>;

  return (
    <div className="space-y-6 pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view your product definitions.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold transition-colors"
          >
            + Add Product
          </button>
        )}
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Unit Price</th>
              <th className="px-6 py-3">Reorder Lvl</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-800">{product.sku}</td>
                <td className="px-6 py-4 text-slate-800 font-medium">{product.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px] uppercase font-bold tracking-wider">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">${product.unit_price}</td>
                <td className="px-6 py-4 text-slate-600">{product.reorder_level}</td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Add New Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">SKU</label>
                  <input required type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors outline-none text-sm text-slate-800" placeholder="e.g. WH-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Product Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors outline-none text-sm text-slate-800" placeholder="e.g. Widget High" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors outline-none text-sm text-slate-800" placeholder="e.g. Hardware" />
                </div>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Unit Price ($)</label>
                    <input required type="number" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors outline-none text-sm text-slate-800" placeholder="0.00" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reorder Lvl</label>
                    <input required type="number" value={formData.reorder_level} onChange={(e) => setFormData({...formData, reorder_level: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors outline-none text-sm text-slate-800" placeholder="10" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex items-center justify-end space-x-2 border-t border-slate-100 mt-6 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createProduct.isPending} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:bg-blue-400">
                  {createProduct.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
