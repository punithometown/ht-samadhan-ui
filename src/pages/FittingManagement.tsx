import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  User, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hammer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FittingJob {
  id: string;
  customer: string;
  location: string;
  items: string;
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed';
  fitter: string | null;
  date: string;
  complexity: 'Simple' | 'Complex';
}

export const FittingManagement: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);

  const jobs: FittingJob[] = [
    { id: 'FIT-9011', customer: 'Sanjay Dutt', location: 'Lower Parel, Mumbai', items: 'Wardrobe 3D + Bed', status: 'Pending', fitter: null, date: '2026-05-13', complexity: 'Complex' },
    { id: 'FIT-9012', customer: 'Riya Sen', location: 'Colaba, Mumbai', items: 'Dining Set', status: 'Scheduled', fitter: 'Vinod T.', date: '2026-05-13', complexity: 'Simple' },
    { id: 'FIT-9013', customer: 'Amitabh B.', location: 'Juhu, Mumbai', items: 'Office Setup', status: 'In Progress', fitter: 'Kishore G.', date: '2026-05-13', complexity: 'Complex' },
    { id: 'FIT-9014', customer: 'Deepika P.', location: 'Prabhadevi, Mumbai', items: 'Sofa Unit', status: 'Pending', fitter: null, date: '2026-05-14', complexity: 'Simple' },
  ];

  const fitters = ['Vinod T.', 'Kishore G.', 'Sunil R.', 'Pradeep J.'];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Scheduled': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'In Progress': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Technical Services</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fitting & Installation</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6"
            >
              <option value="All">All Projects</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">Live</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Assign', value: '18', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Work in Progress', value: '7', icon: Hammer, color: 'text-orange-600' },
          { label: 'Completed Today', value: '12', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Avg Tech TAT', value: '4.2h', icon: Clock, color: 'text-blue-600' },
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
                <th className="px-6 py-5">Job ID</th>
                <th className="px-6 py-5">Customer & Items</th>
                <th className="px-6 py-5">Complexity</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Technical Lead</th>
                <th className="px-6 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-900">{job.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{job.customer}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">{job.items}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <MapPin size={10} />
                      {job.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${job.complexity === 'Complex' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                      {job.complexity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {job.fitter ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{job.fitter}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic font-medium">Auto-selection pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setShowAssignModal(job.id)}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      {job.fitter ? 'Reschedule' : 'Deploy Fitter'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                <h3 className="text-xl font-black text-slate-900">Technical Deployment</h3>
                <p className="text-xs text-slate-400 font-medium">Assigning technician for {showAssignModal}</p>
              </div>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                <div className="px-2 py-3">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technicians near Mumbai Node</p>
                </div>
                {fitters.map((fitter) => (
                  <button 
                    key={fitter}
                    onClick={() => setShowAssignModal(null)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-orange-500/10 border border-slate-100 hover:border-orange-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                         <User size={18} />
                       </div>
                       <div className="text-left">
                         <p className="text-sm font-bold text-slate-800">{fitter}</p>
                         <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Active Today</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Current Capacity</p>
                       <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4].map(slot => (
                            <div key={slot} className={`w-2 h-1 rounded-full ${slot <= 2 ? 'bg-orange-400' : 'bg-slate-200'}`} />
                          ))}
                       </div>
                    </div>
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
