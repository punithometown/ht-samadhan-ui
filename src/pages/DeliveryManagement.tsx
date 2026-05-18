import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  User, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

import { API_BASE_URL } from '../config/api';


interface DeliveryTicket {
  _id: string;
  ticketNumber: string;
  customerName?: string;
  customerMobile: string;
  address: string;
  orderId: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  priority: 'Normal' | 'High';
  site: string;
}

export const DeliveryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<DeliveryTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper: format address from serviceAddress object (if available)
  const formatAddress = (ticket: any): string => {
    if (ticket.serviceAddress) {
      const { line1, city, state, pincode } = ticket.serviceAddress;
      return [line1, city, state, pincode].filter(Boolean).join(', ');
    }
    return ticket.site || 'Address not provided';
  };

  // Fetch tickets with status = ASSIGNED_TO_DELIVERY
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/tickets`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.data)) {
          throw new Error('Failed to fetch tickets');
        }

        // Filter only ASSIGNED_TO_DELIVERY
        const deliveryTickets = data.data
          .filter((t: any) => t.status === 'OPEN' && t.type === 'Installation' && t.isDelivery == false)
          .map((t: any) => ({
            _id: t._id,
            ticketNumber: t.ticketNumber,
            customerName: t.customerName || t.customerMobile,
            customerMobile: t.customerMobile,
            address: formatAddress(t),
            orderId: t.productDetails?.orderId || 'N/A',
            status: t.status,
            assignedTo: t.assignedTo,
            createdAt: t.createdAt,
            priority: t.type === 'Complaint' ? 'High' : 'Normal',
            site: t.site,
          }));

        setTickets(deliveryTickets);
      } catch (err) {
        console.error(err);
        setError('Unable to load data. Please check the server.');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.customerName && ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.customerMobile.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'ASSIGNED_TO_DELIVERY': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
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

  const stats = [
    { label: 'Ready for Dispatch', value: tickets.length, icon: Truck, color: 'text-cyan-600' },
    { label: 'Pending Scheduling', value: tickets.filter(t => !t.assignedTo).length, icon: Clock, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Logistics & Last Mile</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Dispatch</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-slate-900">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by Ticket #, Customer Name or Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6"
          >
            <option value="All">All Deliveries</option>
            <option value="ASSIGNED_TO_DELIVERY">Assigned to Delivery</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Ticket ID</th>
                <th className="px-6 py-5">Customer & Destination</th>
                <th className="px-6 py-5">Order Details</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Assigned Agent</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {ticket.priority === 'High' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      <span className="font-mono text-xs font-bold text-slate-900">{ticket.ticketNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{ticket.customerName}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <MapPin size={10} />
                      {ticket.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-slate-600">Order: <span className="font-bold text-slate-900">{ticket.orderId}</span></p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <Calendar size={10} />
                      {formatDate(ticket.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(ticket.status)}`}>
                      Dispatch Ready
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{ticket.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/delivery-assign/${ticket._id}`)}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1 ml-auto"
                    >
                      <Truck size={12} />
                      Schedule Dispatch
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                    No tickets ready for dispatch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};