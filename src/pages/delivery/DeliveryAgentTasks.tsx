import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Navigation,
  X,
  Camera,
  Image as ImageIcon,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  address: string;
  items: string;
  status: 'Pending' | 'Out for Delivery' | 'Delivered' | 'Failed';
  timeSlot: string;
  priority: 'Normal' | 'High';
  comments: string[];
  podImages?: string[];
}

export const DeliveryAgentTasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updateStatus, setUpdateStatus] = useState<Task['status'] | ''>('');
  const [newComment, setNewComment] = useState('');
  const [podImages, setPodImages] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 'DEL-801', 
      orderId: 'HT-5021', 
      customer: 'Amitabh Sharma', 
      phone: '+91 98XXX XXX01', 
      address: 'Sea Face Apts, Worli, Mumbai', 
      items: 'King Size Bed Frame, Mattress', 
      status: 'Out for Delivery', 
      timeSlot: '09:00 - 12:00', 
      priority: 'High',
      comments: ['Loading done at 8:30 AM'],
      podImages: []
    },
    { 
      id: 'DEL-805', 
      orderId: 'HT-5025', 
      customer: 'Priya Reddy', 
      phone: '+91 98XXX XXX05', 
      address: 'Green Meadows, Bandra West, Mumbai', 
      items: 'Dining Table, 4 Chairs', 
      status: 'Pending', 
      timeSlot: '12:00 - 15:00', 
      priority: 'Normal',
      comments: [],
      podImages: []
    },
    { 
      id: 'DEL-810', 
      orderId: 'HT-5032', 
      customer: 'Vikram Malhotra', 
      phone: '+91 98XXX XXX10', 
      address: 'Lodha Park, Prabhadevi, Mumbai', 
      items: 'Modular Wardrobe (3 Units)', 
      status: 'Pending', 
      timeSlot: '15:00 - 18:00', 
      priority: 'Normal',
      comments: [],
      podImages: []
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
        return { 
          ...t, 
          status: updateStatus, 
          comments: updatedComments,
          podImages: updateStatus === 'Delivered' ? [...(t.podImages || []), ...podImages] : t.podImages 
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    setSelectedTask(null);
    setUpdateStatus('');
    setNewComment('');
    setPodImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate file upload with data holders
      const fileList = Array.from(files) as File[];
      const newImages = fileList.map(file => URL.createObjectURL(file));
      setPodImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setPodImages(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: Task['status']) => {
    switch(status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Out for Delivery': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Field Operations</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Delivery Assignments</h1>
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
          placeholder="Search by Customer or Order ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <motion.div 
            key={task.id}
            layoutId={task.id}
            onClick={() => setSelectedTask(task)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer overflow-hidden group"
          >
            <div className="p-5 border-b border-slate-50">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Truck size={20} />
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
                     <Calendar size={14} className="text-slate-300 shrink-0" />
                     <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{task.timeSlot}</p>
                  </div>
               </div>

               <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deliverable Items</p>
                  <p className="text-xs text-slate-700 font-medium">{task.items}</p>
               </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                     <Phone size={12} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{task.phone}</span>
               </div>
               <button className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                  Update Status <Navigation size={12} />
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
               className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedTask.id}</span>
                         <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getStatusColor(selectedTask.status)}`}>{selectedTask.status}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Task Details: {selectedTask.customer}</h3>
                   </div>
                   <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white rounded-lg text-slate-400 shadow-sm border border-transparent hover:border-slate-200">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                   <section className="space-y-4">
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                            <MapPin size={24} />
                         </div>
                         <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shipping Address</p>
                            <p className="text-base font-bold text-slate-800 leading-snug">{selectedTask.address}</p>
                            <button className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                               Open in Maps <Navigation size={12} />
                            </button>
                         </div>
                      </div>
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                            <Phone size={24} />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Information</p>
                            <p className="text-base font-bold text-slate-800">{selectedTask.phone}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Call Customer for location assistance</p>
                         </div>
                      </div>
                   </section>

                   <section className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <MessageSquare size={14} /> Update Delivery Status
                      </h4>
                      <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-3">
                            {(['Out for Delivery', 'Delivered', 'Failed', 'Pending'] as Task['status'][]).map(status => (
                               <button 
                                 key={status}
                                 onClick={() => setUpdateStatus(status)}
                                 className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${updateStatus === status ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}
                               >
                                  {status}
                               </button>
                            ))}
                         </div>
                         <textarea 
                           placeholder="Add a location update or reason for failure..."
                           value={newComment}
                           onChange={(e) => setNewComment(e.target.value)}
                           className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all min-h-[100px]"
                         />

                         {updateStatus === 'Delivered' && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white border border-dashed border-slate-300 rounded-xl p-4 space-y-4"
                            >
                               <div className="flex items-center justify-between">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                     <Camera size={12} /> Digital Evidence (POD)
                                  </h5>
                                  <span className="text-[9px] font-bold text-orange-500 uppercase">Required for Close</span>
                               </div>
                               
                               <div className="grid grid-cols-3 gap-2">
                                  {podImages.map((img, idx) => (
                                     <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 group shadow-sm">
                                        <img src={img} alt="POD" className="w-full h-full object-cover" />
                                        <button 
                                          onClick={() => removeImage(idx)}
                                          className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                           <Trash2 size={10} />
                                        </button>
                                     </div>
                                  ))}
                                  {podImages.length < 3 && (
                                     <button 
                                       onClick={() => fileInputRef.current?.click()}
                                       className="aspect-square rounded-lg border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all text-slate-300 hover:text-orange-400"
                                     >
                                        <UploadCloud size={20} />
                                        <span className="text-[8px] font-black uppercase">Snap</span>
                                     </button>
                                  )}
                               </div>
                               <input 
                                 type="file" 
                                 ref={fileInputRef} 
                                 onChange={handleImageUpload} 
                                 className="hidden" 
                                 accept="image/*" 
                                 multiple 
                               />
                               <p className="text-[9px] text-slate-400 italic">Upload up to 3 images (Package, Customer, Signature)</p>
                            </motion.div>
                         )}

                         <button 
                           onClick={handleUpdate}
                           disabled={!updateStatus || (updateStatus === 'Delivered' && podImages.length === 0)}
                           className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                         >
                            {updateStatus === 'Delivered' ? 'Submit POD & Close' : 'Confirm Update'}
                         </button>
                      </div>
                   </section>

                   {selectedTask.comments.length > 0 && (
                      <section className="space-y-3">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Timeline</h4>
                         <div className="space-y-4">
                            {selectedTask.comments.map((comment, idx) => (
                               <div key={idx} className="flex gap-3 text-xs">
                                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>
                                  <p className="text-slate-600 font-medium">{comment}</p>
                               </div>
                            ))}
                         </div>
                         {selectedTask.podImages && selectedTask.podImages.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <ImageIcon size={10} /> Attached Evidence
                               </p>
                               <div className="flex gap-2">
                                  {selectedTask.podImages.map((img, i) => (
                                     <img key={i} src={img} alt="Evidence" className="w-12 h-12 rounded border border-slate-200 object-cover shadow-sm" />
                                  ))}
                               </div>
                            </div>
                         )}
                      </section>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
