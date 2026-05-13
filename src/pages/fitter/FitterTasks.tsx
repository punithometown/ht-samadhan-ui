import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  MapPin, 
  Calendar, 
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Navigation,
  X,
  Package,
  Plus,
  Hammer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SparePartRequest {
  partName: string;
  reason: string;
  urgency: 'Normal' | 'Critical';
}

interface FittingTask {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  address: string;
  items: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';
  timeSlot: string;
  complexity: 'Simple' | 'Complex';
  comments: string[];
  spareParts: SparePartRequest[];
}

export const FitterTasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<FittingTask | null>(null);
  const [updateStatus, setUpdateStatus] = useState<FittingTask['status'] | ''>('');
  const [newComment, setNewComment] = useState('');
  
  // Spare part request state
  const [showSparePartForm, setShowSparePartForm] = useState(false);
  const [sparePart, setSparePart] = useState<SparePartRequest>({ partName: '', reason: '', urgency: 'Normal' });

  const [tasks, setTasks] = useState<FittingTask[]>([
    { 
      id: 'FIT-901', 
      orderId: 'HT-5021', 
      customer: 'Sanjay Dutt', 
      phone: '+91 97XXX XXX11', 
      address: 'Imperial Heights, Lower Parel, Mumbai', 
      items: 'Modular Kitchen (L-Shape), Hob & Chimney', 
      status: 'In Progress', 
      timeSlot: '10:00 - 13:00', 
      complexity: 'Complex',
      comments: ['Plumbing check completed'],
      spareParts: []
    },
    { 
      id: 'FIT-905', 
      orderId: 'HT-5025', 
      customer: 'Riya Sen', 
      phone: '+91 97XXX XXX25', 
      address: 'Sea View Mansion, Colaba, Mumbai', 
      items: '6-Seater Dining Set, Sideboard', 
      status: 'Scheduled', 
      timeSlot: '14:00 - 17:00', 
      complexity: 'Simple',
      comments: [],
      spareParts: []
    }
  ]);

  const filteredTasks = tasks.filter(t => 
    t.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdate = () => {
    if (!selectedTask || !updateStatus) return;
    
    const updatedTasks = tasks.map(t => {
      if (t.id === selectedTask.id) {
        const updatedComments = [...t.comments];
        if (newComment.trim()) {
           updatedComments.push(`${updateStatus}: ${newComment}`);
        }
        return { ...t, status: updateStatus, comments: updatedComments };
      }
      return t;
    });

    setTasks(updatedTasks);
    setSelectedTask(null);
    setUpdateStatus('');
    setNewComment('');
  };

  const handleRequestSparePart = () => {
    if (!selectedTask || !sparePart.partName) return;

    const updatedTasks = tasks.map(t => {
      if (t.id === selectedTask.id) {
        return { 
          ...t, 
          spareParts: [...t.spareParts, sparePart],
          comments: [...t.comments, `Spare Part Requested: ${sparePart.partName} (${sparePart.urgency})`]
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    setShowSparePartForm(false);
    setSparePart({ partName: '', reason: '', urgency: 'Normal' });
  };

  const statusOptions: FittingTask['status'][] = ['Scheduled', 'In Progress', 'Completed', 'Delayed'];

  const getStatusColor = (status: FittingTask['status']) => {
    switch(status) {
      case 'Scheduled': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'In Progress': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Delayed': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">On-Site Technical</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Technical Assignments</h1>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Today, 13 May</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search Customer or Order ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <motion.div 
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer overflow-hidden group"
          >
            <div className="p-5 border-b border-slate-50">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Wrench size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.id}</p>
                        <h4 className="text-sm font-black text-slate-900">Order #{task.orderId}</h4>
                     </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
               </div>
               
               <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                     <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                     <p className="text-xs font-medium text-slate-600 leading-relaxed">{task.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock size={14} className="text-slate-300 shrink-0" />
                     <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{task.timeSlot}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Hammer size={14} className="text-slate-300 shrink-0" />
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${task.complexity === 'Complex' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                        {task.complexity} Job
                     </span>
                  </div>
               </div>

               <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Job Scope</p>
                  <p className="text-xs text-slate-700 font-medium truncate">{task.items}</p>
               </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600">{task.phone}</span>
               </div>
               <button className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                  Update Progress <Navigation size={12} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedTask(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
             >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTask.id}</span>
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getStatusColor(selectedTask.status)}`}>{selectedTask.status}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Technical Brief: {selectedTask.customer}</h3>
                   </div>
                   <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white rounded-lg text-slate-400 shadow-sm border border-transparent hover:border-slate-200">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                   <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Installation Address</p>
                         <p className="text-sm font-bold text-slate-800 flex items-start gap-2">
                           <MapPin size={14} className="mt-0.5 text-orange-500" />
                           {selectedTask.address}
                         </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Technical Support</p>
                         <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                           <Phone size={14} className="text-blue-500" />
                           {selectedTask.phone}
                         </p>
                      </div>
                   </section>

                   <section className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} /> Progress Reporting
                         </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                         {statusOptions.map(status => (
                            <button 
                              key={status}
                              onClick={() => setUpdateStatus(status)}
                              className={`py-2.5 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${updateStatus === status ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                               {status}
                            </button>
                         ))}
                      </div>
                      <textarea 
                        placeholder="Technical comments or roadblocks..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all min-h-[80px]"
                      />
                   </section>

                   <section className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            <Package size={14} /> Material & Parts Support
                         </h4>
                         <button 
                           onClick={() => setShowSparePartForm(!showSparePartForm)}
                           className="flex items-center gap-1.5 text-[9px] font-black text-blue-700 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-blue-200"
                         >
                            {showSparePartForm ? <X size={10} /> : <Plus size={10} />}
                            {showSparePartForm ? 'Cancel' : 'Request Parts'}
                         </button>
                      </div>

                      {showSparePartForm ? (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="space-y-3 pt-2"
                         >
                            <input 
                              type="text"
                              placeholder="Part Name (e.g. Door Hinge - Right)"
                              value={sparePart.partName}
                              onChange={(e) => setSparePart({...sparePart, partName: e.target.value})}
                              className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500"
                            />
                            <div className="flex gap-2">
                               <select 
                                 value={sparePart.urgency}
                                 onChange={(e) => setSparePart({...sparePart, urgency: e.target.value as any})}
                                 className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 text-xs outline-none"
                               >
                                  <option value="Normal">Normal Urgency</option>
                                  <option value="Critical">Critical (Job Stalled)</option>
                               </select>
                               <button 
                                 onClick={handleRequestSparePart}
                                 disabled={!sparePart.partName}
                                 className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 disabled:opacity-50"
                               >
                                  Submit Request
                               </button>
                            </div>
                         </motion.div>
                      ) : (
                         <div className="space-y-2">
                            {selectedTask.spareParts.length === 0 ? (
                               <p className="text-[10px] text-blue-400 italic font-medium">No spare parts requested for this job yet.</p>
                            ) : (
                               selectedTask.spareParts.map((part, i) => (
                                  <div key={i} className="bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${part.urgency === 'Critical' ? 'bg-rose-500' : 'bg-blue-400'}`} />
                                        <span className="text-xs font-bold text-slate-700">{part.partName}</span>
                                     </div>
                                     <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{part.urgency}</span>
                                  </div>
                               ))
                            )}
                         </div>
                      )}
                   </section>

                   <div className="pt-4 border-t border-slate-100">
                      <button 
                        onClick={handleUpdate}
                        disabled={!updateStatus && !newComment}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                      >
                         Update Technical Status
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
