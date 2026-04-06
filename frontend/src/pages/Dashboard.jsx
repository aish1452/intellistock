import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, DollarSign, Archive, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ['salesSummary'],
    queryFn: () => api.get('/sales/summary').then(res => res.data.data)
  });

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['inventoryLow'],
    queryFn: () => api.get('/inventory/low-stock').then(res => res.data.data)
  });

  const { data: products, isLoading: prodLoading } = useQuery({
    queryKey: ['productsList'],
    queryFn: () => api.get('/products?limit=100').then(res => res.data)
  });

  if (salesLoading || invLoading || prodLoading) {
    return <div className="flex h-full items-center justify-center text-slate-500 font-medium">Loading dashboard...</div>;
  }

  const lowStockCount = inventory?.length || 0;
  const totalProducts = products?.meta?.total || 0;
  
  const stockChartData = products?.data?.map(p => ({
    name: p.name.substring(0, 10) + '...',
    stock: p.Inventories?.[0]?.quantity || 0
  })).sort((a, b) => b.stock - a.stock).slice(0, 8);

  const kpis = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Units Sold (30d)', value: sales?.unitsSold || 0, icon: Archive, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Revenue (30d)', value: `$${sales?.totalRevenue || 0}`, icon: DollarSign, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200' },
    { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Enterprise Inventory Metrics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`w-12 h-12 rounded flex items-center justify-center ${kpi.bg} ${kpi.border} border`}>
              <kpi.icon className={kpi.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Top Inventory Stock</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'Inter' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'Inter' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', fontFamily: 'Inter', fontSize: '13px' }} />
                <Bar dataKey="stock" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm lg:col-span-1 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Top Products Sold</h2>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {sales?.topProducts?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <Archive className="text-slate-300 mb-2" size={32} />
                <p className="text-sm font-semibold text-slate-500">No sales data available</p>
              </div>
            ) : (
              sales?.topProducts?.map((tp, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                      #{i + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 text-sm truncate w-32" title={tp.name}>{tp.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">ID: {tp.id}</span>
                    </div>
                  </div>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                    {tp.quantitySold} units
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
