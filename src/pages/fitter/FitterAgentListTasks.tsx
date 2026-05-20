import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Search,
  MapPin,
  Calendar,
  Phone,
  Clock,
  AlertCircle,
  Hammer,
  Loader2,
  Navigation
} from 'lucide-react';
import { motion } from 'motion/react';

import { API_BASE_URL } from '../../config/api';

interface FittingTask {
  _id: string;
  ticketNumber: string;
  type: string;
  category: string;
  subCategory: string;
  description: string;
  status: string;
  source: string;
  site: string;
  siteCode: string;
  customerName?: string;
  customerMobile: string;
  customerEmail: string;
  customerInvoice?: string;
  createdAt: string;
  updatedAt: string;
  productDetails?: {
    productName?: string;
    productCode?: string;
    orderId?: string;
    invoiceNumber?: string;
    purchaseDate?: string;
    amount?: number;
    itemDescription?: string;
  };
  serviceAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  // Boolean flags expected from backend
  isDeliveryDone?: boolean;
  isFitting?: boolean;
  isFittingDone?: boolean;
}

export const FitterTasksList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<FittingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const userDataRaw = localStorage.getItem('hometown_user');
        if (!userDataRaw) throw new Error('User session not found. Please log in again.');

        let userData;
        try {
          userData = JSON.parse(userDataRaw);
        } catch {
          throw new Error('Invalid user session data.');
        }

        const role = userData.role;
        const siteId = userData.siteId;

        // Build query parameters for the required filters
        const params = new URLSearchParams();
        params.set('isDeliveryDone', 'true');
        params.set('isFitting', 'true');
        params.set('isFittingDone', 'false');

        // Apply site filtering for non-HO users
        if (role && role.toUpperCase() !== 'HO') {
          if (!siteId) throw new Error('Site ID missing for non-HO user.');
          params.set('siteId', siteId);
        }

        const apiUrl = `${API_BASE_URL}/tickets?${params.toString()}`;

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Additional client-side safety filter in case backend doesn't enforce all flags
          const filtered = result.data.filter(
            (t: FittingTask) =>
              t.isDeliveryDone === true &&
              t.isFitting === true &&
              t.isFittingDone === false
          );
          setTasks(filtered);
        } else {
          setError(result.message || 'Invalid response format from server.');
        }
      } catch (err: any) {
        console.error('Error fetching fitter tasks:', err);
        setError(err.message || 'Failed to load tasks. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ── Helpers (unchanged) ──
  const formatAddress = (task: FittingTask): string => {
    const a = task.serviceAddress;
    if (!a) return task.site || 'No address provided';
    return [a.line1, a.line2, a.city, a.state, a.pincode]
      .filter(Boolean)
      .join(', ');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED_TO_FITTER': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'IN_PROGRESS':        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'RESOLVED':           return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'OPEN':               return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CLOSED':             return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'CANCELLED':          return 'bg-rose-50 text-rose-600 border-rose-100';
      default:                   return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const statusLabel = (status: string) => status.replace(/_/g, ' ');

  const jobScope = (task: FittingTask): string => {
    const parts = [
      task.productDetails?.productName,
      task.category,
      task.subCategory,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : task.description.substring(0, 80);
  };

  const complexityFromType = (task: FittingTask): 'Simple' | 'Complex' =>
    task.type?.toLowerCase().includes('install') ? 'Complex' : 'Simple';

  const filteredTasks = tasks.filter(
    (t) =>
      t.customerMobile.includes(searchQuery) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.productDetails?.orderId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-slate-500 text-sm ml-3">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 text-sm font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase"
        >
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
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">On-Site Technical</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Technical Assignments</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search by Ticket #, Mobile, or Order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Wrench size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">No assignments found.</p>
          <p className="text-xs text-slate-400 mt-1">Tasks requiring fitting (delivery done, fitting not yet started).</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.map((task) => (
            <motion.div
              key={task._id}
              onClick={() => navigate(`/fitter-task/${task._id}`)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer overflow-hidden group"
            >
              <div className="p-5 border-b border-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <Wrench size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.ticketNumber}</p>
                      <h4 className="text-sm font-black text-slate-900">
                        {task.productDetails?.orderId ? `Order #${task.productDetails.orderId}` : task.type}
                      </h4>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(task.status)}`}>
                    {statusLabel(task.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{formatAddress(task)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-300 shrink-0" />
                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                      Created: {formatDate(task.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hammer size={14} className="text-slate-300 shrink-0" />
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${complexityFromType(task) === 'Complex' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                      {complexityFromType(task)} Job
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Job Scope</p>
                  <p className="text-xs text-slate-700 font-medium truncate">{jobScope(task)}</p>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600">{task.customerMobile}</span>
                </div>
                <button className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                  Update Progress <Navigation size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};