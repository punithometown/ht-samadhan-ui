import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
  Wrench,
  Truck,
  Box,
  Loader2,
  Calendar,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

import { API_BASE_URL } from '../config/api';

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
  isDelivery?: boolean;
  isDeliveryDone?: boolean;
  isFitting?: boolean;
  isFittingDone?: boolean;
}

export const StoreDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');

  useEffect(() => {
    const fetchStoreTickets = async () => {
      try {
        setLoading(true);
        const userDataRaw = localStorage.getItem('hometown_user');
        if (!userDataRaw) throw new Error('User session not found. Please log in.');

        const userData = JSON.parse(userDataRaw);
        const siteId = userData.siteId;

        if (!siteId) throw new Error('Store ID missing.');

        setStoreName(userData.site || siteId);

        const apiUrl = `${API_BASE_URL}/tickets?siteCode=${encodeURIComponent(siteId)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data);
        } else {
          setError(result.message || 'Invalid response from server.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreTickets();
  }, []);

  // Status lists
  const openStatuses = [
    'OPEN', 'ASSIGNED_TO_STORE_MANAGER', 'ASSIGNED_TO_FITTER', 'ASSIGNED_TO_DELIVERY',
    'VISIT_SCHEDULED', 'IN_PROGRESS', 'CUSTOMER_NOT_AVAILABLE', 'WAITING_FOR_PARTS',
    'FITTING_IN_PROGRESS'
  ];
  const resolvedStatuses = ['RESOLVED', 'CLOSED', 'FITTING_DONE'];

  const openTickets = tickets.filter(t => openStatuses.includes(t.status)).length;
  const resolvedTickets = tickets.filter(t => resolvedStatuses.includes(t.status)).length;
  const issueTickets = tickets.filter(t => t.type === 'Complaint').length;
  const installationTickets = tickets.filter(t => t.type === 'CRF').length;
  const deliveryProcess = tickets.filter(t => t.isDelivery === true && t.isDeliveryDone !== true).length;
  const deliveryDone = tickets.filter(t => t.isDeliveryDone === true).length;
  const fittingProcess = tickets.filter(t => t.isFitting === true && t.isFittingDone !== true).length;
  const fittingDone = tickets.filter(t => t.isFittingDone === true).length;

  // TAT: percentage of resolved tickets resolved within 24 hours
  const computeTAT = () => {
    const resolvedWithin24h = tickets.filter(ticket => {
      if (!resolvedStatuses.includes(ticket.status)) return false;
      const created = new Date(ticket.createdAt);
      const resolved = new Date(ticket.updatedAt);
      const diffHours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }).length;
    const totalResolved = tickets.filter(t => resolvedStatuses.includes(t.status)).length;
    if (totalResolved === 0) return 0;
    return Math.round((resolvedWithin24h / totalResolved) * 100);
  };

  const tatPercentage = computeTAT();

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const stats = [
    { label: 'Open Tickets', value: openTickets, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', change: 'Pending action' },
    { label: 'Resolved Tickets', value: resolvedTickets, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', change: 'This month' },
    { label: 'Issue Tickets', value: issueTickets, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', change: 'Complaints' },
    { label: 'Installations (CRF)', value: installationTickets, icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-50', change: 'Orders' },
    { label: 'Delivery In Progress', value: deliveryProcess, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', change: 'Out for delivery' },
    { label: 'Delivery Completed', value: deliveryDone, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', change: 'Done' },
    { label: 'Fitting In Progress', value: fittingProcess, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', change: 'Assigned' },
    { label: 'Fitting Completed', value: fittingDone, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50', change: 'Done' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-3 text-slate-500">Loading store dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
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
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Store Performance</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{storeName} Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin size={14} /> All tickets assigned to your store
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stat.value}</p>
                <p className="text-[9px] text-slate-500 mt-1">{stat.change}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TAT & Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">TAT (Turnaround Time)</h2>
            <Clock size={20} className="text-orange-400" />
          </div>
          <p className="text-4xl font-black">{tatPercentage}%</p>
          <p className="text-xs text-slate-300 mt-2">of tickets resolved within 24 hours</p>
          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tatPercentage}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-orange-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <CheckCircle2 size={10} /> Target: 95% within 24h
          </p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Recent Tickets</h2>
            <button
              onClick={() => navigate('/tickets')}
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
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-bold text-slate-900">#{ticket.ticketNumber}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        ticket.type === 'CRF' ? 'bg-purple-100 text-purple-700' :
                        ticket.type === 'Complaint' ? 'bg-rose-100 text-rose-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-slate-700">{ticket.customerMobile}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(ticket.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-slate-100 text-slate-600">
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 text-sm">No tickets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delivery & Fitting Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Truck size={20} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800">Delivery Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">In Progress</span>
              <span className="text-sm font-bold text-blue-600">{deliveryProcess}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(deliveryProcess / (deliveryProcess + deliveryDone || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-600">Completed</span>
              <span className="text-sm font-bold text-emerald-600">{deliveryDone}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Wrench size={20} className="text-purple-500" />
            <h3 className="text-sm font-bold text-slate-800">Fitting Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600">In Progress</span>
              <span className="text-sm font-bold text-purple-600">{fittingProcess}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(fittingProcess / (fittingProcess + fittingDone || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-600">Completed</span>
              <span className="text-sm font-bold text-emerald-600">{fittingDone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};