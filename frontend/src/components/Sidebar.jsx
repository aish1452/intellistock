import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LayoutDashboard, Package, Archive, DollarSign, Activity, Users } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'analyst', 'viewer'] },
    { name: 'Products', path: '/products', icon: Package, roles: ['admin', 'manager'] },
    { name: 'Inventory', path: '/inventory', icon: Archive, roles: ['admin', 'manager', 'analyst', 'viewer'] },
    { name: 'Sales', path: '/sales', icon: DollarSign, roles: ['admin', 'manager', 'analyst', 'viewer'] },
    { name: 'Forecast', path: '/forecast', icon: Activity, roles: ['admin', 'manager', 'analyst'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
  ];

  const allowedItems = navItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-full flex flex-col shrink-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <Activity className="text-blue-500" size={24} />
          <span className="text-white font-semibold text-lg tracking-wide uppercase">IntelliStock</span>
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-6">Menu</p>
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2 mx-3 rounded transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-500 text-xs text-center font-medium">IntelliStock v1.0.0<br/>Enterprise Edition</p>
      </div>
    </aside>
  );
};

export default Sidebar;
