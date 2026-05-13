import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  User, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeliveryTicket {
  id: string;
  customer: string;
  address: string;
  orderId: string;
  status: 'Pending' | 'Assigned' | 'Out for Delivery' | 'Delivered';
  agent: string | null;
  date: string;
  priority: 'Normal' | 'High';
}

export const DeliveryManagement: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

  const deliveries: DeliveryTicket[] = [
    { id: 'DEL-1021', customer: 'Anjali Verma', address: 'Bandra West, Mumbai', orderId: 'HT-5021', status: 'Pending', agent: null, date: '2026-05-13', priority: 'High' },
    { id: 'DEL-1022', customer: 'Rajesh Kumar', address: 'Worli Sea Face, Mumbai', orderId: 'HT-5022', status: 'Assigned', agent: 'Suresh L.', date: '2026-05-13', priority: 'Normal' },
    { id: 'DEL-1023', customer: 'Meera Shah', address: 'Juhu Tara Road, Mumbai', orderId: 'HT-5023', status: 'Out for Delivery', agent: 'Ramesh K.', date: '2026-05-13', priority: 'High' },
    { id: 'DEL-1024', customer: 'Karan Mehra', address: 'Andheri East, Mumbai', orderId: 'HT-5024', status: 'Pending', agent: null, date: '2026-05-14', priority: 'Normal' },
  ];

  const agents = ['Suresh L.', 'Ramesh K.', 'Vijay P.', 'Manoj S.'];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Logistics & Last Mile</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Dispatch</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6"
            >
              <option value="All">All Deliveries</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Out for Delivery">In Transit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Unassigned', value: '12', icon: AlertCircle, color: 'text-orange-600' },
          { label: 'In Transit', value: '8', icon: Truck, color: 'text-blue-600' },
          { label: 'Completed', value: '45', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Pending POD', value: '3', icon: Clock, color: 'text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
               <stat.icon size={20} />
             </div>
             <div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
               <h4 className="text-xl font-black text-slate-900">{stat.value}</h4>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Delivery ID</th>
                <th className="px-6 py-5">Customer & Destination</th>
                <th className="px-6 py-5">Order Details</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Assigned Agent</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {deliveries.map((del) => (
                <tr key={del.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {del.priority === 'High' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                       <span className="font-mono text-xs font-bold text-slate-900">{del.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{del.customer}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <MapPin size={10} />
                      {del.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-slate-600">Order: <span className="font-bold text-slate-900">{del.orderId}</span></p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Calendar size={10} />
                      {del.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(del.status)}`}>
                      {del.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {del.agent ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{del.agent}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setShowAssignModal(del.id)}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      {del.agent ? 'Reassign' : 'Assign Agent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal (Simple Simulation) */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssignModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">Dispatch Assignment</h3>
                <p className="text-xs text-slate-400 font-medium">Selecting available delivery agent for {showAssignModal}</p>
              </div>
              <div className="p-6 space-y-3">
                {agents.map((agent) => (
                  <button 
                    key={agent}
                    onClick={() => setShowAssignModal(null)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400 group-hover:text-orange-500 transition-colors">
                         <User size={18} />
                       </div>
                       <div className="text-left">
                         <p className="text-sm font-bold text-slate-800">{agent}</p>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest">Available • 4 Active Tasks</p>
                       </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
