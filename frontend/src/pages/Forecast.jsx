import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, ComposedChart } from 'recharts';
import { Activity, TrendingUp, Calendar, AlertCircle, Info, BrainCircuit } from 'lucide-react';

const Forecast = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [horizon, setHorizon] = useState(30);

  // Loader state
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('Fetching historical data...');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products?limit=100').then((res) => res.data.data),
  });

  const generateForecast = useMutation({
    mutationFn: (data) => api.post(`/forecast/${data.productId}`, { horizon_days: data.horizon }).then(res => res.data.data)
  });

  const handleGenerate = () => {
    if (selectedProduct) {
      setIsSimulating(true);
      setShowResults(false);
      setProgress(0);
      generateForecast.mutate({ productId: selectedProduct, horizon });
    }
  };

  useEffect(() => {
    let interval;
    if (isSimulating) {
      setLoadingStep('Fetching historical sales data...');
      interval = setInterval(() => {
        setProgress(prev => {
          let next = prev + Math.floor(Math.random() * 8) + 4;
          if (next >= 100) next = 100;
          
          if (next >= 70) setLoadingStep('Generating demand forecasts...');
          else if (next >= 30) setLoadingStep('Training LSTM Neural Network...');
          
          return next;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    // Reveal results only when the backend finishes AND the visual loader completes
    if (generateForecast.isSuccess && progress >= 100) {
      setLoadingStep('Complete!');
      const timer = setTimeout(() => {
        setIsSimulating(false);
        setShowResults(true);
      }, 500); // Leave at 100% for half a second
      return () => clearTimeout(timer);
    }
  }, [generateForecast.isSuccess, progress]);

  const forecastData = generateForecast.data?.forecast || [];
  const chartData = forecastData.map(f => ({
    date: f.date,
    'Predicted Trend': f.predicted_quantity,
    'Expected Range': [f.lower_ci, f.upper_ci]
  }));

  // Derived statistics
  const totalDemand = forecastData.reduce((sum, day) => sum + day.predicted_quantity, 0);
  const avgDemand = totalDemand > 0 ? (totalDemand / forecastData.length).toFixed(1) : 0;
  const peakDay = forecastData.reduce((peak, day) => (!peak || day.predicted_quantity > peak.predicted_quantity) ? day : peak, null);
  const confidenceScore = generateForecast.data ? Math.max(0, 100 - generateForecast.data.model_info.mape).toFixed(1) : 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Demand Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Easily predict future sales stock for your products.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select a Product to Predict</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-sm text-slate-800"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">-- Choose Product --</option>
              {products?.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">How far into the future?</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-sm text-slate-800"
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
            >
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedProduct || isSimulating || generateForecast.isPending}
            className={`px-6 py-2 rounded text-white text-sm font-semibold transition-colors border ${
              !selectedProduct || isSimulating || generateForecast.isPending 
                ? 'bg-slate-300 border-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 active:bg-blue-800'
            }`}
          >
            {isSimulating || generateForecast.isPending ? 'Processing...' : 'Generate Prediction'}
          </button>
        </div>
      </div>

      {/* Loading State Spinner & Progress Bar */}
      {isSimulating && (
        <div className="bg-white p-12 rounded border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-slate-800 text-sm">{progress}%</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Processing AI Model</h3>
            <p className="text-blue-600 text-sm font-medium animate-pulse">{loadingStep}</p>
          </div>
          <div className="w-full max-w-md bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results State */}
      {showResults && (
        <div className="space-y-6">
          {/* Actionable Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center border border-blue-100">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Est. Need</p>
                <p className="text-xl font-bold text-slate-900">{totalDemand} <span className="text-xs font-medium text-slate-500">units</span></p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center border border-emerald-100">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Daily Average</p>
                <p className="text-xl font-bold text-slate-900">{avgDemand} <span className="text-xs font-medium text-slate-500">units/day</span></p>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded flex items-center justify-center border border-red-100">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Peak Demand</p>
                <p className="text-xl font-bold text-slate-900">{peakDay?.predicted_quantity} <span className="text-xs font-medium text-slate-500">units</span></p>
                <p className="text-[10px] text-slate-400 font-medium">on {peakDay?.date}</p>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded border border-slate-800 shadow-sm flex flex-col justify-center text-white relative overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Info size={12} className="mr-1" />
                Confidence Score
              </p>
              <p className="text-2xl font-bold mt-1 text-white">{confidenceScore}%</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3 text-slate-800">
                <div>
                  <h2 className="text-lg font-bold">Predicted Future Sales Trend</h2>
                  <p className="text-xs text-slate-500 mt-0.5">The shaded area represents the expected margin of error.</p>
                </div>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'Inter' }} tickCount={10} minTickGap={30} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', fontSize: '13px' }} />
                  <Area type="monotone" dataKey="Expected Range" fill="#e2e8f0" stroke="none" label="Confidence Interval" fillOpacity={0.5} />
                  <Line type="monotone" dataKey="Predicted Trend" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Data Table */}
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
              <Calendar className="text-slate-500" size={16} />
              <h3 className="text-sm font-bold text-slate-800">Daily Forecast Details</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white sticky top-0 border-b border-slate-100 z-10 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Predicted Demand</th>
                    <th className="px-6 py-3 hidden md:table-cell">Safe Buffer (Upper)</th>
                    <th className="px-6 py-3 hidden md:table-cell">Risk Buffer (Lower)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {forecastData.map((day, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-slate-800 font-mono text-[11px]">{day.date}</td>
                      <td className="px-6 py-3">
                        <span className="font-bold text-blue-600">{day.predicted_quantity}</span> <span className="text-slate-500 text-xs">units</span>
                      </td>
                      <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{day.upper_ci} units</td>
                      <td className="px-6 py-3 text-slate-600 hidden md:table-cell">{Math.max(0, day.lower_ci)} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecast;
