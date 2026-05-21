import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Loader2,
  Calendar,
  Filter,
  Search,
  XCircle,
  BarChart3,
  TrendingUp,
  Wrench,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

const SPARE_PARTS_API_URL = 'http://localhost:5001'; // Warehouse API base

interface SparePartRequest {
  _id: string;
  ticketId: string;
  ticketNumber: string;
  ticketDescription: string;
  ticketType: string;
  ticketStore: string;
  ticketStoreCode: string;
  ticketCustomerMobile: string;
  ticketServiceAddress: string;
  sparePart: string;
  urgency: string;
  requestById: string;
  requestByName: string;
  status: string;
  reason: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export const WarehouseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SparePartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${SPARE_PARTS_API_URL}/api/spare-part-requests`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setRequests(result.data);
        } else {
          setError(result.message || 'Invalid response from server.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load warehouse data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Status mapping
  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
    shipped: requests.filter(r => r.status === 'SHIPPED').length,
    delivered: requests.filter(r => r.status === 'DELIVERED').length,
  };

  const urgencyCounts = {
    critical: requests.filter(r => r.urgency?.toLowerCase() === 'critical').length,
    high: requests.filter(r => r.urgency?.toLowerCase() === 'high').length,
    medium: requests.filter(r => r.urgency?.toLowerCase() === 'medium').length,
    low: requests.filter(r => r.urgency?.toLowerCase() === 'low').length,
  };

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-emerald-100 text-emerald-700',
      REJECTED: 'bg-red-100 text-red-700',
      SHIPPED: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-purple-100 text-purple-700',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles: Record<string, string> = {
      Critical: 'bg-red-100 text-red-700',
      High: 'bg-orange-100 text-orange-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Low: 'bg-slate-100 text-slate-600',
    };
    return styles[urgency] || 'bg-slate-100 text-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-3 text-slate-500">Loading warehouse dashboard...</p>
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

  const stats = [
    { label: 'Total Requests', value: statusCounts.all, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'Pending', value: statusCounts.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Approved', value: statusCounts.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: statusCounts.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Shipped', value: statusCounts.shipped, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Delivered', value: statusCounts.delivered, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Warehouse Operations</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Warehouse Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin size={14} /> Manage spare part requests across all stores
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Urgency & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Urgency Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" /> Urgency Levels
          </h2>
          <div className="space-y-4">
            {Object.entries(urgencyCounts).map(([level, count]) => (
              <div key={level}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-600 capitalize">{level}</span>
                  <span className="text-xs font-bold text-slate-800">{count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${statusCounts.all ? (count / statusCounts.all) * 100 : 0}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${
                      level === 'critical' ? 'bg-red-500' :
                      level === 'high' ? 'bg-orange-500' :
                      level === 'medium' ? 'bg-yellow-400' :
                      'bg-slate-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Recent Spare Part Requests</h2>
            <button
              onClick={() => navigate('/warehouse/requests')}
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
                  <th className="px-5 py-3">Part</th>
                  <th className="px-5 py-3">Store</th>
                  <th className="px-5 py-3">Urgency</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRequests.map((req) => (
                  <tr
                    key={req._id}
                    onClick={() => navigate(`/warehouse/requests/${req._id}`)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-bold text-slate-900">#{req.ticketNumber}</td>
                    <td className="px-5 py-3 text-xs font-medium text-slate-700 max-w-[120px] truncate">{req.sparePart}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{req.ticketStore}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${getUrgencyBadge(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(req.createdAt)}</td>
                  </tr>
                ))}
                {recentRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 text-sm">No requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Progress Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-orange-500" /> Request Status Flow
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED'].map((status, idx, arr) => {
            const count = requests.filter(r => r.status === status).length;
            const total = requests.length || 1;
            const percentage = Math.round((count / total) * 100);
            return (
              <div key={status} className="text-center">
                <div className="text-xs font-bold text-slate-700 mb-1">{status.replace('_', ' ')}</div>
                <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${
                      status === 'PENDING' ? 'bg-yellow-400' :
                      status === 'APPROVED' ? 'bg-emerald-400' :
                      status === 'REJECTED' ? 'bg-red-400' :
                      status === 'SHIPPED' ? 'bg-blue-400' :
                      'bg-purple-400'
                    }`}
                  />
                </div>
                <span className="text-[9px] text-slate-500 font-medium">{count} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate('/warehouse/requests/new')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-orange-600 transition-colors"
        >
          <Package size={14} /> New Spare Part Request
        </button>
        <button
          onClick={() => navigate('/warehouse/requests?status=PENDING')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Clock size={14} /> View Pending
        </button>
        <button
          onClick={() => navigate('/warehouse/requests?status=APPROVED')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <CheckCircle2 size={14} /> Approved for Dispatch
        </button>
      </div> */}
    </div>
  );
};