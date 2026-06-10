import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Package,
  Wrench,
  Truck,
  ChevronDown,
  Box,
  ShoppingBag,
  Loader2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';

import { API_BASE_URL } from '../config/api';

interface Ticket {
  _id: string;
  ticketNumber: string;
  type: string;               // "CRF", "Complaint", "Request"
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
  // Boolean flags (must be provided by backend)
  isDelivery?: boolean;
  isDeliveryDone?: boolean;
  isFitting?: boolean;
  isFittingDone?: boolean;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSiteId, setUserSiteId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hometown_user');
      if (raw) {
        const data = JSON.parse(raw);
        setUserRole(data.role || null);
        setUserSiteId(data.siteId || null);
      } else {
        setError('User session not found.');
      }
    } catch {
      setError('Invalid user session data.');
    }
  }, []);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!userRole) return;
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/tickets`;
        const isHO = userRole.toUpperCase() === 'ADMIN';
        if (!isHO && userSiteId) {
          url += `?siteCode=${encodeURIComponent(userSiteId)}`;
        }
        const res = await fetch(url);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data);
        } else {
          setError(result.message || 'Invalid data.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [userRole, userSiteId]);

  const isHO = userRole?.toUpperCase() === 'ADMIN';
  const stores = ['All Stores', ...new Set(tickets.map(t => t.site).filter(Boolean))];
  const filteredTickets = isHO && selectedStore !== 'All Stores'
    ? tickets.filter(t => t.site === selectedStore)
    : tickets;

  // ---------- Stat definitions ----------
  const openStatuses = [
    'OPEN', 'ASSIGNED_TO_STORE_MANAGER', 'ASSIGNED_TO_FITTER', 'ASSIGNED_TO_DELIVERY',
    'VISIT_SCHEDULED', 'IN_PROGRESS', 'CUSTOMER_NOT_AVAILABLE', 'WAITING_FOR_PARTS',
    'FITTING_IN_PROGRESS'
  ];
  const resolvedStatuses = ['RESOLVED', 'CLOSED', 'FITTING_DONE'];
  const inProgress = ['IN_PROGRESS'];

  const openCount = filteredTickets.filter(t => openStatuses.includes(t.status)).length;
  const inprogressCount = filteredTickets.filter(t => inProgress.includes(t.status)).length;

  const resolvedCount = filteredTickets.filter(t => resolvedStatuses.includes(t.status)).length;

  // Delivery
  const deliveryInProgress = filteredTickets.filter(t => t.isDelivery === true && t.isDeliveryDone !== true).length;
  const deliveryDone = filteredTickets.filter(t => t.isDeliveryDone === true).length;

  // Fitting
  const fittingInProgress = filteredTickets.filter(t => t.isFitting === true && t.isFittingDone !== true).length;
  const fittingDone = filteredTickets.filter(t => t.isFittingDone === true).length;

  // Non‑fitting (isFitting !== true)
  const nonFitting = filteredTickets.filter(t => t.isFitting !== true).length;

  // CRF (installation)
  const crfTickets = filteredTickets.filter(t => t.type === 'CRF').length;

  // ----- TAT calculations (average hours) -----
  const computeAverageTAT = (ticketsToCheck: Ticket[], startField: keyof Ticket, endField: keyof Ticket) => {
    const valid = ticketsToCheck.filter(t => t[startField] && t[endField]);
    if (valid.length === 0) return 0;
    const totalHours = valid.reduce((sum, t) => {
      const start = new Date(t[startField] as string);
      const end = new Date(t[endField] as string);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    return Math.round(totalHours / valid.length);
  };

  // For delivery TAT: tickets where isDeliveryDone === true, using createdAt -> updatedAt
  const deliveryTAT = computeAverageTAT(
    filteredTickets.filter(t => t.isDeliveryDone === true),
    'createdAt', 'updatedAt'
  );
  // For fitting TAT: tickets where isFittingDone === true
  const fittingTAT = computeAverageTAT(
    filteredTickets.filter(t => t.isFittingDone === true),
    'createdAt', 'updatedAt'
  );
  // For issue tickets (type === 'Complaint')
  const issueTAT = computeAverageTAT(
    filteredTickets.filter(t => t.type === 'Complaint' && resolvedStatuses.includes(t.status)),
    'createdAt', 'updatedAt'
  );

  // Recent tickets (last 5)
  const recentTickets = [...filteredTickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  // --- Admin stats cards (full list) ---
  const adminStats = [
    { label: 'Open Tickets', value: openCount, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Require action' },
    { label: 'In-Progress Tickets', value: inprogressCount, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Require action' },
    { label: 'Resolved Tickets', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Closed' },
    //   { label: 'Delivery In Progress', value: deliveryInProgress, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'On road' },
    //   { label: 'Delivery Done', value: deliveryDone, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', desc: 'Completed' },
    //   { label: 'Fitting In Progress', value: fittingInProgress, icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Assigned' },
    //   { label: 'Fitting Done', value: fittingDone, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'Completed' },
    //   { label: 'Non‑Fitting Tickets', value: nonFitting, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Other types' },
    //   { label: 'CRF (Installations)', value: crfTickets, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Orders' },
  ];

  // TAT cards
  const tatCards = [
    // { label: 'Delivery TAT', value: `${deliveryTAT}h`, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', target: 'Target ≤ 48h' },
    // { label: 'Fitting TAT', value: `${fittingTAT}h`, icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50', target: 'Target ≤ 72h' },
     { label: 'Issue Tickets TAT', value: `${issueTAT}h`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', target: 'Target ≤ 24h' },
  ];

  // For non‑admin roles, we reuse the original role‑based stats (optional)
  const computeRoleStats = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const ticketsToday = filteredTickets.filter(t => t.createdAt.startsWith(todayStr)).length;
    const ticketsByType = (type: string) => filteredTickets.filter(t => t.type === type).length;

    switch (userRole?.toUpperCase()) {
      case 'STORE_MANAGER':
        return [
          { label: 'Open Tickets', value: openCount, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Closed Today', value: ticketsToday, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Fitting Jobs', value: ticketsByType('CRF'), icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Deliveries', value: ticketsByType('Request'), icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Issue Tickets', value: ticketsByType('Complaint'), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case 'WAREHOUSE':
        return [
          { label: 'Pending Picks', value: openCount, icon: Box, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Store Requests', value: ticketsByType('Request'), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ready Dispatch', value: resolvedCount, icon: Truck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Shortage Alerts', value: ticketsByType('Query'), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case 'DELIVERY':
        return [
          { label: 'Pending Deliveries', value: deliveryInProgress, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Not yet done' },
          { label: 'Delivered Today', value: ticketsToday, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Scheduled', value: openCount, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Fuel Allowance', value: '₹450', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ];
      case 'FITTER':
        return [
          { label: 'Pending Fittings', value: fittingInProgress, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Fitting Done', value: fittingDone, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Spare Requests', value: ticketsByType('Complaint'), icon: Package, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Avg TAT', value: `${fittingTAT}h`, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
        ];
      default:
        return [];
    }
  };

  const displayStats = isHO ? adminStats : computeRoleStats();
  const showTatCards = isHO; // only admin sees TAT cards

  if (loading || userRole === null) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-3 text-slate-500">Loading dashboard...</p>
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
      {/* Header & Store Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
            {isHO ? 'Head Office Analytics' : 'Store Performance'}
          </h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isHO ? 'Operations Dashboard' : `${userRole?.replace('_', ' ')} Dashboard`}
          </h1>
        </div>
        {isHO && (
          <div className="relative">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6 min-w-[140px]"
              >
                {stores.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="text-slate-400 pointer-events-none -ml-4" />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayStats.map((stat, idx) => (
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
                {stat.desc && <p className="text-[9px] text-slate-500 mt-1">{stat.desc}</p>}
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TAT Cards (Admin only) */}
      {showTatCards && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tatCards.map((card, idx) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <h3 className="text-xs font-bold text-slate-700">{card.label}</h3>
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <p className="text-[9px] text-slate-500 mt-1">{card.target}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Recent Tickets</h2>
          <button onClick={() => navigate('/tickets')} className="text-[9px] font-bold text-orange-500 uppercase tracking-wider hover:underline">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-5 py-3">Ticket #</th>
                <th className="px-5 py-3">Store</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTickets.map(ticket => (
                <tr
                  key={ticket._id}
                  onClick={() => navigate(`/tickets/${ticket._id}`)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono text-xs font-bold text-slate-900">#{ticket.ticketNumber}</td>
                  <td className="px-5 py-3 text-xs font-medium text-slate-700">{ticket.site}</td>
                  <td className="px-5 py-3 text-xs text-slate-600">{ticket.type}</td>
                  <td className="px-5 py-3 text-xs text-slate-700">{ticket.customerMobile}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{formatDate(ticket.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-slate-100 text-slate-600">
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTickets.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};