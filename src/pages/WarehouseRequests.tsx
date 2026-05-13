import React, { useState } from 'react';
import { 
  Box, 
  Search, 
  Filter, 
  MapPin, 
  Tag, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  X,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WarehouseRequest {
  id: string;
  ticketId: string;
  store: string;
  item: string;
  sku: string;
  quantity: number;
  status: 'Pending' | 'Picking' | 'Dispatched' | 'Out of Stock';
  date: string;
  binLocation: string;
}

export const WarehouseRequests: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequest | null>(null);

  const stores = ['All Stores', 'Mumbai Worli', 'Bangalore Whitefield', 'Delhi Saket', 'Pune Hadapsar'];

  const [requests, setRequests] = useState<WarehouseRequest[]>([
    { id: 'REQ-501', ticketId: 'SAM-1022', store: 'Mumbai Worli', item: 'Wardrobe Door Hinge (Soft Close)', sku: 'HW-HN-002', quantity: 4, status: 'Pending', date: '2026-05-13', binLocation: 'A-12-04' },
    { id: 'REQ-502', ticketId: 'SAM-1025', store: 'Bangalore Whitefield', item: 'Bed Slats (King Size)', sku: 'FW-BD-S01', quantity: 12, status: 'Picking', date: '2026-05-13', binLocation: 'C-05-11' },
    { id: 'REQ-503', ticketId: 'SAM-1028', store: 'Delhi Saket', item: 'Dining Table Leg Bolt Pk', sku: 'HW-BT-099', quantity: 1, status: 'Dispatched', date: '2026-05-12', binLocation: 'B-01-02' },
    { id: 'REQ-504', ticketId: 'SAM-1030', store: 'Mumbai Worli', item: 'Side Table Handle (Brass)', sku: 'HW-HD-442', quantity: 2, status: 'Pending', date: '2026-05-13', binLocation: 'A-08-15' },
  ]);

  const filteredRequests = requests.filter(r => {
    const matchesStore = selectedStore === 'All Stores' || r.store === selectedStore;
    const matchesSearch = r.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStore && matchesSearch;
  });

  const updateStatus = (id: string, newStatus: WarehouseRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    setSelectedRequest(null);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Picking': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Dispatched': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Out of Stock': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Inventory Operations</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pick Requisitions</h1>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6"
              >
                {stores.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by SKU, Item or Ticket ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Request Info</th>
                <th className="px-6 py-5">Item & SKU</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Qty</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-[10px] font-bold text-slate-400">#{req.id}</span>
                       <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-white rounded font-bold">{req.ticketId}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">{req.store}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{req.item}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.sku}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                       <Tag size={12} className="text-orange-500" />
                       {req.binLocation}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">{req.quantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedRequest(req)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedRequest(null)}
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pick Fulfillment</p>
                      <h3 className="text-xl font-black text-slate-900">Request Details</h3>
                   </div>
                   <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                      <X size={20} />
                   </button>
                </div>
                
                <div className="p-6 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock ID / SKU</p>
                         <p className="text-sm font-black text-slate-800">{selectedRequest.sku}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bin Location</p>
                         <p className="text-sm font-black text-orange-600">{selectedRequest.binLocation}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Request Status</h4>
                      <div className="grid grid-cols-2 gap-3">
                         {(['Picking', 'Dispatched', 'Out of Stock', 'Pending'] as WarehouseRequest['status'][]).map(status => (
                            <button 
                              key={status}
                              onClick={() => updateStatus(selectedRequest.id, status)}
                              className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex flex-col items-center gap-2 transition-all ${selectedRequest.status === status ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}
                            >
                               {status === 'Picking' && <ClipboardList size={16} />}
                               {status === 'Dispatched' && <Truck size={16} />}
                               {status === 'Out of Stock' && <AlertCircle size={16} />}
                               {status}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
                
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{selectedRequest.store}</span>
                   </div>
                   <button 
                     onClick={() => setSelectedRequest(null)}
                     className="text-xs font-black text-slate-400 uppercase tracking-widest"
                   >
                      Cancel Fulfillment
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
