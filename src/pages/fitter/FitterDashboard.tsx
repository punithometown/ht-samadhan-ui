import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  User,
  Phone,
  ArrowRight,
  Package,
  FileText,
  AlertTriangle,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../../config/api';

interface Ticket {
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
  customerMobile: string;
  customerEmail: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  productDetails?: any;
  serviceAddress?: any;
  fitterId?: string;
  fitterName?: string;
  scheduledDate?: string;
}

export const FitterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fitterName, setFitterName] = useState<string>('');

  useEffect(() => {
    const fetchFitterTickets = async () => {
      try {
        setLoading(true);
        const userDataRaw = localStorage.getItem('hometown_user');
        if (!userDataRaw) throw new Error('User session not found. Please log in.');

        const userData = JSON.parse(userDataRaw);
        const fitterId = userData.id; // or userData._id, depending on your user schema
        if (!fitterId) throw new Error('Fitter ID missing.');

        setFitterName(userData.name || 'Fitter');

        // Fetch tickets assigned to this fitter
        const apiUrl = `${API_BASE_URL}/tickets?assignedFitter=${encodeURIComponent(fitterId)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data);
        } else {
          setError(result.message || 'Invalid response from server.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load fitter dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFitterTickets();
  }, []);

  // Status definitions
  const pendingStatuses = ['ASSIGNED_TO_FITTER', 'VISIT_SCHEDULED', 'FITTING_IN_PROGRESS'];
  const completedStatuses = ['FITTING_DONE', 'RESOLVED', 'CLOSED'];
  
  const pendingTickets = tickets.filter(t => pendingStatuses.includes(t.status));
  const completedTickets = tickets.filter(t => completedStatuses.includes(t.status));
  const todayTickets = tickets.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.createdAt).toDateString() === today;
  });

  // Recent tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'ASSIGNED_TO_FITTER': 'bg-blue-100 text-blue-700',
      'VISIT_SCHEDULED': 'bg-purple-100 text-purple-700',
      'FITTING_IN_PROGRESS': 'bg-orange-100 text-orange-700',
      'FITTING_DONE': 'bg-emerald-100 text-emerald-700',
      'RESOLVED': 'bg-green-100 text-green-700',
      'CLOSED': 'bg-slate-100 text-slate-600',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-3 text-slate-500">Loading fitter dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Fitter Workspace</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome, {fitterName}
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <Wrench size={14} /> Your assigned installation & fitting tasks
          </p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Jobs</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{pendingTickets.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{completedTickets.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Today's Tasks</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{todayTickets.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-orange-50">
              <Star className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Assignments</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{tickets.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50">
              <Package className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Wrench size={16} className="text-orange-500" /> Your Recent Jobs
          </h2>
          <button
            onClick={() => navigate('/fitter/jobs')}
            className="text-[9px] font-bold text-orange-500 uppercase tracking-wider hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-5 py-3">Ticket #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  onClick={() => navigate(`/fitter/jobs/${ticket._id}`)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3 font-mono text-xs font-bold text-slate-900">
                    #{ticket.ticketNumber}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-700">{ticket.customerName || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400">{ticket.customerMobile}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 max-w-[140px] truncate">
                    {ticket.serviceAddress?.line1 || ticket.serviceAddress || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      ticket.type === 'CRF' ? 'bg-purple-100 text-purple-700' :
                      ticket.type === 'Complaint' ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${getStatusBadge(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
              {recentTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-sm">
                    No assigned jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending vs Completed Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> Pending Jobs Progress
          </h3>
          <div className="space-y-4">
            {pendingTickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket._id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="text-xs font-medium text-slate-700">{ticket.ticketNumber}</p>
                  <p className="text-[10px] text-slate-400">{ticket.customerName || ticket.customerMobile}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${getStatusBadge(ticket.status)}`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
            {pendingTickets.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No pending jobs 🎉</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Recently Completed
          </h3>
          <div className="space-y-4">
            {completedTickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket._id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="text-xs font-medium text-slate-700">{ticket.ticketNumber}</p>
                  <p className="text-[10px] text-slate-400">{ticket.customerName || ticket.customerMobile}</p>
                </div>
                <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  DONE
                </span>
              </div>
            ))}
            {completedTickets.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No completed jobs yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};