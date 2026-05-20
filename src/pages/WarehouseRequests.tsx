import React, { useState, useEffect } from 'react';
import {
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
  ClipboardList,
  Loader2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { API_BASE_URL } from '../config/api';

// Updated interface matching the actual API response (flattened ticket data)
interface SparePartRequest {
  _id: string;
  sparePart: string;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED';
  urgency: 'Normal' | 'Critical' | 'Emergency';
  requestByName: string;
  requestById: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
  // Flat ticket fields (no nested ticketId object)
  ticketId: string;            // still present as ID reference
  ticketNumber: string;
  ticketStore: string;
  ticketStoreCode: string;
  ticketServiceAddress: string;
  ticketType: string;
  ticketCustomerMobile: string;
  ticketDescription: string;
}

// Frontend display status mapping
const mapStatusToDisplay = (status: SparePartRequest['status']): string => {
  switch (status) {
    case 'PENDING':   return 'Pending';
    case 'APPROVED':  return 'Picking';
    case 'DELIVERED': return 'Dispatched';
    case 'REJECTED':  return 'Out of Stock';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

const getStatusStyle = (status: SparePartRequest['status']) => {
  const display = mapStatusToDisplay(status);
  switch (display) {
    case 'Pending':      return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'Picking':      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Dispatched':   return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'Out of Stock': return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'Cancelled':    return 'bg-slate-100 text-slate-500 border-slate-200';
    default:             return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const WarehouseRequests: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SparePartRequest | null>(null);
  const [requests, setRequests] = useState<SparePartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/spare-part-requests`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setRequests(result.data);
      } else {
        setError(result.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Extract unique stores from the flat `ticketStore` field
  const stores = [
    'All Stores',
    ...new Set(requests.map(req => req.ticketStore).filter(Boolean))
  ];

  const filteredRequests = requests.filter(req => {
    const matchesStore = selectedStore === 'All Stores' || req.ticketStore === selectedStore;
    const matchesSearch =
      req.sparePart.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.reason && req.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
      req.requestByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStore && matchesSearch;
  });

  const updateStatus = async (id: string, newStatus: SparePartRequest['status']) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/spare-part-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
        setSelectedRequest(null);
      } else {
        alert(result.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-3 text-slate-500">Loading spare part requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
        <button onClick={fetchRequests} className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Inventory Operations</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Spare Part Requisitions</h1>
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

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search by Part, Ticket #, Requester, or Reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Request Info</th>
                <th className="px-6 py-5">Part & Details</th>
                <th className="px-6 py-5">Store</th>
                <th className="px-6 py-5">Qty</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => {
                const displayStatus = mapStatusToDisplay(req.status);
                return (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">#{req._id.slice(-6)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-white rounded font-bold">
                          {req.ticketNumber}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">
                        {req.ticketType}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Requested by: {req.requestByName}</p>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar size={8} /> {formatDate(req.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-800">{req.sparePart}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Urgency: <span className={`font-bold ${req.urgency === 'Critical' ? 'text-rose-600' : req.urgency === 'Emergency' ? 'text-orange-600' : 'text-blue-600'}`}>{req.urgency}</span>
                      </p>
                      {req.reason && (
                        <p className="text-[9px] text-slate-500 mt-1 italic line-clamp-2">Reason: {req.reason}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                        <Tag size={12} className="text-orange-500" />
                        {req.ticketStore} ({req.ticketStoreCode})
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={8} /> {req.ticketServiceAddress?.substring(0, 40)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">{req.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(req.status)}`}>
                        {displayStatus}
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
                );
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No spare part requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal for Status Update */}
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fulfillment Action</p>
                  <h3 className="text-xl font-black text-slate-900">Update Request Status</h3>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Part Name</p>
                    <p className="text-sm font-black text-slate-800">{selectedRequest.sparePart}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                    <p className="text-sm font-black text-orange-600">{selectedRequest.quantity}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Request Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {(['APPROVED', 'DELIVERED', 'REJECTED', 'PENDING'] as SparePartRequest['status'][]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedRequest._id, status)}
                        disabled={updating}
                        className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border flex flex-col items-center gap-2 transition-all ${
                          selectedRequest.status === status
                            ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                        } disabled:opacity-50`}
                      >
                        {status === 'APPROVED' && <ClipboardList size={16} />}
                        {status === 'DELIVERED' && <Truck size={16} />}
                        {status === 'REJECTED' && <AlertCircle size={16} />}
                        {status === 'PENDING' && <Clock size={16} />}
                        {mapStatusToDisplay(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {selectedRequest.ticketStore} – {selectedRequest.ticketServiceAddress?.substring(0, 30)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-xs font-black text-slate-400 uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};