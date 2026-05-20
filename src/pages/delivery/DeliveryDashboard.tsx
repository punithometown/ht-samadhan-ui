import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Truck,
  Loader2,
  Calendar,
  MapPin,
  Navigation
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
  isDelivery?: boolean;
  isDeliveryDone?: boolean;
}

export const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>('');

  useEffect(() => {
    const fetchDeliveryTickets = async () => {
      try {
        setLoading(true);
        const userDataRaw = localStorage.getItem('hometown_user');
        if (!userDataRaw) throw new Error('User session not found. Please log in.');

        const userData = JSON.parse(userDataRaw);
        const siteId = userData.siteId;
        if (!siteId) throw new Error('Store / site ID missing.');

        setAgentName(userData.name || userData.site || 'Delivery Agent');

        // Fetch tickets for the agent's site, optionally filter by isDelivery=true
        const apiUrl = `${API_BASE_URL}/tickets?siteCode=${encodeURIComponent(siteId)}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          // Keep only delivery‑related tickets (isDelivery === true or relevant statuses)
          const deliveryTickets = result.data.filter((t: Ticket) =>
            t.isDelivery === true ||
            t.type === 'Delivery' ||
            t.status === 'ASSIGNED_TO_DELIVERY' ||
            t.status === 'OUT_FOR_DELIVERY'
          );
          setTickets(deliveryTickets);
        } else {
          setError(result.message || 'Invalid response from server.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load delivery dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryTickets();
  }, []);

  // ─── Statistics ─────────────────────────────────────────────
  // Open tickets: statuses that require attention (not delivered, not failed)
  const openStatuses = [
    'OPEN', 'ASSIGNED_TO_DELIVERY', 'VISIT_SCHEDULED',
    'IN_PROGRESS', 'CUSTOMER_NOT_AVAILABLE', 'DELIVERY_SCHEDULED'
  ];
  const openTickets = tickets.filter(t => openStatuses.includes(t.status)).length;

  // In‑progress delivery: isDelivery === true but not yet done
  const inProgressDelivery = tickets.filter(t => t.isDelivery === true && t.isDeliveryDone !== true).length;

  // Delivery done: isDeliveryDone === true
  const deliveryDone = tickets.filter(t => t.isDeliveryDone === true).length;

  // Total delivery tickets (assigned to agent)
  const totalAssigned = tickets.length;

  // TAT: percentage of delivered tickets completed within 48 hours
  const computeTAT48 = () => {
    const deliveredTickets = tickets.filter(t => t.isDeliveryDone === true);
    if (deliveredTickets.length === 0) return 0;

    const within48h = deliveredTickets.filter(ticket => {
      const created = new Date(ticket.createdAt);
      const completed = new Date(ticket.updatedAt); // assuming updatedAt marks completion
      const diffHours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
      return diffHours <= 48;
    }).length;

    return Math.round((within48h / deliveredTickets.length) * 100);
  };

  const tatPercentage = computeTAT48();

  // Recent delivery tickets (last 5)
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const formatAddress = (ticket: Ticket): string => {
    const a = ticket.serviceAddress;
    if (!a) return ticket.site || 'No address';
    return [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ');
  };

  const stats = [
    { label: 'Open Tickets', value: openTickets, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Need action' },
    { label: 'In Progress Delivery', value: inProgressDelivery, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Out for delivery' },
    { label: 'Delivery Completed', value: deliveryDone, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Successfully delivered' },
    { label: 'Total Assigned', value: totalAssigned, icon: Navigation, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Your tasks' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-3 text-slate-500">Loading delivery dashboard...</p>
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
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Delivery Performance</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hello, {agentName}</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin size={14} /> Your delivery tasks
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
                <p className="text-[9px] text-slate-500 mt-1">{stat.desc}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TAT Card & Recent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TAT (48 hours) Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">Delivery TAT</h2>
            <Clock size={20} className="text-orange-400" />
          </div>
          <p className="text-4xl font-black">{tatPercentage}%</p>
          <p className="text-xs text-slate-300 mt-2">of deliveries completed within 48 hours</p>
          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tatPercentage}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-orange-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <CheckCircle2 size={10} /> Target: 90% within 48h
          </p>
        </div>

        {/* Recent Delivery Tickets Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Recent Delivery Tasks</h2>
            <button
              onClick={() => navigate('/delivery-tasks')}
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
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    onClick={() => navigate(`/delivery-tasks/${ticket._id}`)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-bold text-slate-900">#{ticket.ticketNumber}</td>
                    <td className="px-5 py-3 text-xs font-medium text-slate-700">
                      {ticket.customerName || ticket.customerMobile}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 truncate max-w-[180px]">
                      {formatAddress(ticket)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">{formatDate(ticket.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                        ticket.isDeliveryDone ? 'bg-emerald-100 text-emerald-700' :
                        ticket.isDelivery ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {ticket.isDeliveryDone ? 'Delivered' : ticket.isDelivery ? 'In Progress' : ticket.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500 text-sm">
                      No delivery tasks assigned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Action: Mark as Delivered (optional) – can be extended */}
      <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-center gap-3">
          <Truck size={24} className="text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">On the road?</h3>
            <p className="text-xs text-slate-600">Update delivery status directly from your dashboard.</p>
          </div>
          <button
            onClick={() => navigate('/delivery-tasks')}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm"
          >
            View My Tasks
          </button>
        </div>
      </div>
    </div>
  );
};