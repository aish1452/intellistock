import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      
      login(user, accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-white rounded shadow-xl p-8 border border-slate-200">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center mb-4">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">IntelliStock</h2>
          <p className="text-slate-500 text-sm mt-1">Enterprise Inventory Management</p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded mb-6 flex items-start space-x-3 border border-red-200">
            <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-slate-400" /> Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors outline-none text-slate-800 text-sm"
              placeholder="admin@intellistock.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-slate-400" /> Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors outline-none text-slate-800 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded text-white font-semibold transition-colors mt-2
              ${isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p className="font-semibold mb-1 uppercase tracking-wider text-slate-400">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="block font-bold text-[11px]">admin@intellistock.com</span>
              <span className="block mt-1">Admin@1234</span>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <span className="block font-bold text-[11px]">manager@intellistock.com</span>
              <span className="block mt-1">Manager@1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
