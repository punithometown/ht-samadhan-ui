import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Store,
  History
} from 'lucide-react';
import { motion } from 'motion/react';

export const TATAnalysis: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const stores = ['All Stores', 'Mumbai Worli', 'Bangalore Whitefield', 'Delhi Saket', 'Pune Hadapsar', 'Hyderabad Banjara'];

  const metrics = [
    { label: 'Avg. Resolution Time', value: '34h 20m', change: '-4.2h', trend: 'down', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'First Response TAT', value: '1h 15m', change: '+12m', trend: 'up', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Installation TAT', value: '48h', change: '-2h', trend: 'down', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'User Efficiency', value: '92%', change: '+5%', trend: 'up', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const storePerformance = [
    { name: 'Mumbai Worli', avgTat: '28h', volume: 450, compliance: '96%' },
    { name: 'Bangalore Whitefield', avgTat: '32h', volume: 380, compliance: '94%' },
    { name: 'Delhi Saket', avgTat: '41h', volume: 520, compliance: '88%' },
    { name: 'Pune Hadapsar', avgTat: '35h', volume: 290, compliance: '91%' },
    { name: 'Hyderabad Banjara', avgTat: '30h', volume: 340, compliance: '95%' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Analytical Intelligence</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TAT Analysis & SLA</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6"
            >
              {stores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all">
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${m.bg}`}>
                <m.icon size={18} className={m.color} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${m.trend === 'down' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m.trend === 'down' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                {m.change}
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
            <h4 className="text-2xl font-black text-slate-900">{m.value}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Store Performance Comparison</h3>
            <BarChart3 size={18} className="text-slate-400" />
          </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Store Location</th>
                  <th className="px-6 py-4 text-center">Avg Resolution</th>
                  <th className="px-6 py-4 text-center">Ticket Volume</th>
                  <th className="px-6 py-4 text-right">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {storePerformance.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Store size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-mono font-bold text-slate-600">{s.avgTat}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                      {s.volume}
                    </td>
                    <td className="px-6 py-4 text-right px-6">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: s.compliance }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 w-8">{s.compliance}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-2xl p-8 text-white relative overflow-hidden group">
            <h3 className="text-lg font-bold mb-4 relative z-10">Resolution Efficiency</h3>
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-slate-500">
                  <span>Same-Day Resolution</span>
                  <span className="text-emerald-400">42%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-emerald-500 w-[42%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-slate-500">
                  <span>Under 48 Hours</span>
                  <span className="text-blue-400">78%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-blue-500 w-[78%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-slate-500">
                  <span>Over 7 Days (Backlog)</span>
                  <span className="text-rose-400">8%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full">
                  <div className="h-full bg-rose-500 w-[8%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Top Delays by Category</h4>
            <div className="space-y-4">
              {[
                { cat: 'Damage Claim', time: '5.2 days', color: 'bg-rose-500' },
                { cat: 'Delivery Delay', time: '3.8 days', color: 'bg-orange-500' },
                { cat: 'Fitting Issue', time: '2.4 days', color: 'bg-blue-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                     <span className="text-xs font-medium text-slate-700">{item.cat}</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
