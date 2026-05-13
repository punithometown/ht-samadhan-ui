import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Clock,
  ChevronRight,
  MoreVertical,
  Wrench,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Fitter {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  experience: string;
  location: string;
  skills: string[];
  status: 'Active' | 'On Leave' | 'Inactive';
  jobsCompleted: number;
}

export const FitterManagement: React.FC = () => {
  const [showAddFitter, setShowAddFitter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fitters: Fitter[] = [
    { id: 'FT-001', name: 'Vinod Tiwari', phone: '+91 98765 43210', email: 'vinod.t@hometown.in', rating: 4.8, experience: '5 Years', location: 'Mumbai Worli', skills: ['Modular Kitchen', 'Wardrobe', 'Bed'], status: 'Active', jobsCompleted: 450 },
    { id: 'FT-002', name: 'Kishore Gada', phone: '+91 98765 43211', email: 'kishore.g@hometown.in', rating: 4.9, experience: '8 Years', location: 'Mumbai Andheri', skills: ['Office Furniture', 'Seating', 'Modular Office'], status: 'Active', jobsCompleted: 820 },
    { id: 'FT-003', name: 'Sunil Rathore', phone: '+91 98765 43212', email: 'sunil.r@hometown.in', rating: 4.5, experience: '3 Years', location: 'Mumbai Bandra', skills: ['Bed', 'Dining', 'Sofa'], status: 'Active', jobsCompleted: 210 },
    { id: 'FT-004', name: 'Pradeep Jadav', phone: '+91 98765 43213', email: 'pradeep.j@hometown.in', rating: 4.2, experience: '2 Years', location: 'Mumbai Juhu', skills: ['Curtains', 'Blinds', 'Wall Panels'], status: 'On Leave', jobsCompleted: 145 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Human Capital / Technical</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fitter Workforce</h1>
        </div>
        <button 
          onClick={() => setShowAddFitter(true)}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 shrink-0 uppercase tracking-wider text-xs"
        >
          <Plus size={18} />
          Register Fitter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or skills..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/10 focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-6">
           <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Active</p>
              <h4 className="text-lg font-black text-slate-900">24</h4>
           </div>
           <div className="w-px h-8 bg-slate-100" />
           <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On Job</p>
              <h4 className="text-lg font-black text-orange-500">18</h4>
           </div>
           <div className="w-px h-8 bg-slate-100" />
           <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Rating</p>
              <h4 className="text-lg font-black text-emerald-500 flex items-center gap-1">4.7 <Star size={12} fill="currentColor" /></h4>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {fitters.map((fitter) => (
          <motion.div 
            key={fitter.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-orange-500/5 transition-all group"
          >
            <div className="p-6 border-b border-slate-100">
               <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Users size={24} />
                     </div>
                     <div>
                        <h4 className="text-base font-black text-slate-900">{fitter.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fitter.id}</p>
                     </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${fitter.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {fitter.status}
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="flex items-center gap-2 text-slate-500">
                     <MapPin size={14} className="text-slate-300" />
                     <span className="text-[11px] font-medium">{fitter.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                     <Clock size={14} className="text-slate-300" />
                     <span className="text-[11px] font-medium">{fitter.experience} Exp.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                     <Phone size={14} className="text-slate-300" />
                     <span className="text-[11px] font-medium">Contact Details</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                     <CheckCircle2 size={14} className="text-emerald-400" />
                     <span className="text-[11px] font-bold text-slate-700">{fitter.jobsCompleted} Jobs</span>
                  </div>
               </div>

               <div className="flex flex-wrap gap-1.5">
                  {fitter.skills.map(skill => (
                    <span key={skill} className="bg-slate-50 text-slate-500 text-[9px] font-black uppercase px-2 py-1 rounded shadow-sm border border-slate-100">
                       {skill}
                    </span>
                  ))}
               </div>
            </div>
            
            <div className="bg-slate-50/50 p-4 flex items-center justify-between">
               <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 transition-colors">
                  View Schedule
               </button>
               <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-slate-900">{fitter.rating}</span>
                  <Star size={10} className="text-orange-400" fill="currentColor" />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddFitter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddFitter(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
             >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                   <div>
                      <h3 className="text-xl font-black text-slate-900">Register Technician</h3>
                      <p className="text-xs text-slate-400">Add a new technical lead to the store workforce</p>
                   </div>
                   <button onClick={() => setShowAddFitter(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                      <X size={20} />
                   </button>
                </div>
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all" placeholder="e.g. Rahul Verma" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all" placeholder="+91 90000 00000" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Skill</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none">
                         <option>Modular Kitchen</option>
                         <option>Wardrobes</option>
                         <option>Office Furniture</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Node Location</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all" value="Mumbai Worli" disabled />
                   </div>
                   <div className="sm:col-span-2 pt-4">
                      <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs">
                         Onboard Technician
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
