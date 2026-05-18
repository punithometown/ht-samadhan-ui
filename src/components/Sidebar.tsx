import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MENU_CONFIG } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const menuItems = MENU_CONFIG[user.role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col transition-transform duration-300 
        lg:translate-x-0 lg:static lg:min-h-screen lg:shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">H</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">HomeTown</h1>
              <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mt-1">Samadhan Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <Icons.X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4 px-3 py-2">
            {console.log(user)}
            {user.role.replace('_', ' ')} Management
          </div>
          
          {menuItems.map((item) => {
            const Icon = (Icons as any)[item.icon];
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`
                }
              >
                {Icon && <Icon size={18} className={`mr-3 ${Icon ? 'opacity-80' : ''}`} />}
                <span className="font-medium text-sm">{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl mb-4">
            <div className="w-10 h-10 rounded bg-slate-600 flex items-center justify-center text-xs font-bold border border-slate-500/20">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center p-2.5 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-all text-xs font-bold gap-2 group"
          >
            <Icons.LogOut size={14} className="group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};