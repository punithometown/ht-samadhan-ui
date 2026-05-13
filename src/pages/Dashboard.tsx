import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Filter,
  Package,
  Wrench,
  Truck,
  ChevronDown,
  Box,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const stores = ['All Stores', 'Mumbai Worli', 'Bangalore Whitefield', 'Delhi Saket', 'Pune Hadapsar', 'Hyderabad Banjara'];

  const getStats = () => {
    switch(user?.role) {
      case Role.HO:
        return [
          { label: 'Open Tickets', value: '1,284', change: '+12%', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Closed Tickets', value: '11,198', change: '+3%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Deliveries Today', value: '432', change: '85% SLA', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Installations', value: '156', change: 'Live', icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Issue Tickets', value: '42', change: '-8%', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case Role.STORE_CSD:
        return [
          { label: 'Open Tickets', value: '124', change: '+12%', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Closed Today', value: '42', change: 'Live', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Fitting Jobs', value: '18', change: '8 Assigned', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Deliveries', value: '25', change: '12 Out', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Issue Tickets', value: '7', change: 'Critical', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case Role.WAREHOUSE:
        return [
          { label: 'Pending Picks', value: '142', change: '+12', icon: Box, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Store Requests', value: '28', change: '5 Stores', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ready Dispatch', value: '64', change: 'Live', icon: Truck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Shortage Alerts', value: '3', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case Role.DELIVERY:
        return [
          { label: 'Pending Deliveries', value: '8', change: 'Assign Soon', icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Closed Today', value: '12', change: 'Great Job!', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Scheduled Tasks', value: '25', change: 'Weekly View', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Fuel Allowance', value: '₹450', change: 'Verified', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ];
      case Role.FITTER:
        return [
          { label: 'Pending Fittings', value: '5', change: 'Today', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Jobs Closed', value: '12', change: 'Weekly', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Spare Requests', value: '2', change: 'Critical', icon: Package, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Avg TAT', value: '4.2h', change: 'Good', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
        ];
      default:
        return [];
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Executive Samadhan Metrics</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operations Overview</h1>
        </div>
        
        {user?.role === Role.HO && (
          <div className="relative group">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm hover:border-orange-200 transition-colors cursor-pointer">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6 min-w-[140px]"
              >
                {stores.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="text-slate-400 absolute right-4 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => {
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
              <div className="flex items-end justify-between relative z-10">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{stat.value}</span>
                {/* <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.change.includes('+') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'}`}>
                  {stat.change}
                </span> */}
              </div>
              <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
                <stat.icon size={80} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-slate-800">
              {user?.role === Role.DELIVERY ? 'My Delivery Jobs (Today)' : 
               user?.role === Role.FITTER ? 'My Installation Schedule' : 'Priority Tickets ( Escalations )'}
            </h2>
            <div className="flex gap-2">
              {user?.role === Role.DELIVERY || user?.role === Role.FITTER ? (
                <button 
                  onClick={() => navigate(user?.role === Role.DELIVERY ? '/delivery/tasks' : '/fitter/tasks')}
                  className="px-3 py-1.5 text-[10px] font-bold bg-orange-500 text-white rounded-lg uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Manage All Tasks
                </button>
              ) : (
                <>
                  <button className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 rounded-lg uppercase tracking-wider hover:bg-slate-100 transition-colors">
                    Regional View
                  </button>
                  <button className="px-3 py-1.5 text-[10px] font-bold bg-orange-500 text-white rounded-lg uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-sm">
                    Generate Report
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50/50 sticky top-0">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">{user?.role === Role.DELIVERY ? 'Task ID' : 'Ticket ID'}</th>
                  <th className="px-6 py-4 text-center">{user?.role === Role.DELIVERY ? 'Time Slot' : 'Type'}</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {user?.role === Role.DELIVERY || user?.role === Role.FITTER ? (
                  (user?.role === Role.DELIVERY ? [
                    { id: 'DEL-801', slot: '09:00 - 12:00', customer: 'Amitabh S.', status: 'Out for Delivery' },
                    { id: 'DEL-805', slot: '12:00 - 15:00', customer: 'Priya R.', status: 'Pending' },
                    { id: 'DEL-810', slot: '15:00 - 18:00', customer: 'Vikram M.', status: 'Pending' },
                  ] : [
                    { id: 'FIT-901', slot: '10:00 - 13:00', customer: 'Sanjay D.', status: 'In Progress' },
                    { id: 'FIT-905', slot: '14:00 - 17:00', customer: 'Riya S.', status: 'Scheduled' },
                  ]).map((task) => (
                    <tr key={task.id} 
                      onClick={() => navigate(user?.role === Role.DELIVERY ? '/delivery/tasks' : '/fitter/tasks')}
                      className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">#{task.id}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider">{task.slot}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{task.customer}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${task.status === 'In Progress' || task.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">#SAM-7{i}22</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider">Fitting</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">Ravi S. Malhotra</p>
                        <p className="text-[10px] text-slate-400">Order #HT-102{i}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${i % 2 === 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                          {i % 2 === 0 ? 'Assigned' : 'Escalated'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#0F172A] rounded-xl shadow-lg p-8 text-white relative overflow-hidden group">
            <h2 className="text-lg font-bold mb-1 relative z-10">Global Performance</h2>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-8 relative z-10">System Efficiency</p>
            
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wide">
                  <span className="text-slate-500">Service SLA</span>
                  <span className="text-orange-400">92%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-orange-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wide">
                  <span className="text-slate-500">Resolution Rate</span>
                  <span className="text-emerald-400">84%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '84%' }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Live Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                  <div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold">Store #102</span> raised an escalation for <span className="font-bold text-orange-600">Fitting Delay</span>.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
