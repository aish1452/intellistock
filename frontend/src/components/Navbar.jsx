import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/products': return 'Products';
      case '/inventory': return 'Inventory';
      case '/sales': return 'Sales';
      case '/forecast': return 'Demand Forecast';
      case '/users': return 'User Management';
      default: return 'IntelliStock';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10 shrink-0 sticky top-0">
      <div className="text-xl font-semibold text-slate-800">
        {getPageTitle()}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 px-3 py-1.5 rounded border border-slate-200">
          <UserIcon size={16} className="text-slate-500" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800">{user?.name}</span>
            <span className="text-[10px] text-slate-500 uppercase">{user?.role}</span>
          </div>
        </div>
        
        <div className="h-6 w-px bg-slate-200"></div>

        <button 
          onClick={handleLogout}
          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors duration-200"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
