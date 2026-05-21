
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  customerInvoice?: string;
  createdAt: string;
  updatedAt: string;
  productDetails?: {
    productName?: string;
    productCode?: string;
    orderId?: string;
    invoiceNumber?: string;
    purchaseDate?: string;
  };
  serviceAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}

export const WarehouseCrfList: React.FC = () => {
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    store: 'All Stores',
    type: 'All Types',
    date: ''
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets from API with role‑based filtering
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get user data from localStorage
        const userDataRaw = localStorage.getItem('hometown_user');
        if (!userDataRaw) {
          throw new Error('User session not found. Please log in again.');
        }

        let userData;
        try {
          userData = JSON.parse(userDataRaw);
        } catch {
          throw new Error('Invalid user session data.');
        }

        const role = userData.role;
        const siteId = userData.siteId;

        // 2. Build API URL – if role is not HO, filter by siteId
        let apiUrl = `${API_BASE_URL}/tickets`;
        if (role && role.toUpperCase() !== 'ADMIN') {
          if (!siteId) {
            throw new Error('Site ID missing for non‑HO user.');
          }
          apiUrl += `?type=${encodeURIComponent('CRF')}`;
        }

        // 3. Fetch tickets
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data);
        } else {
          setError(result.message || 'Invalid response format from server.');
        }
      } catch (err: any) {
        console.error('Error fetching tickets:', err);
        setError(err.message || 'Failed to load tickets. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []); // Empty dependency array – runs once on mount

  // Extract unique stores (sites) and types from the fetched tickets
  const stores = ['All Stores', ...new Set(tickets.map(t => t.site).filter(Boolean))];
  const types = ['All Types', ...new Set(tickets.map(t => t.type).filter(Boolean))];

  // Filter tickets based on search query and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customerMobile.includes(searchQuery) ||
      (ticket.customerEmail && ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStore = filters.store === 'All Stores' || ticket.site === filters.store;
    const matchesType = filters.type === 'All Types' || ticket.type === filters.type;
    const matchesDate = !filters.date || ticket.createdAt.startsWith(filters.date);

    return matchesSearch && matchesStore && matchesType && matchesDate;
  });

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Status badge styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-600';
      case 'ASSIGNED_TO_STORE_MANAGER': return 'bg-purple-100 text-purple-600';
      case 'ASSIGNED_TO_FITTER': return 'bg-orange-100 text-orange-600';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-600';
      case 'RESOLVED': return 'bg-green-100 text-green-600';
      case 'CLOSED': return 'bg-gray-100 text-gray-500';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Derive display name from customerMobile or email
  const getCustomerDisplay = (ticket: Ticket) => {
    return ticket.customerMobile || ticket.customerEmail || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grievance Management</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Support Tickets</h1>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 shrink-0 uppercase tracking-wider text-xs"
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Ticket #, Mobile, Email, or Description..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={14} /> Filter
              </button>
              {/* <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-800 transition-colors">
                Report CSV
              </button> */}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200/50">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Store / Site</label>
                    <select
                      value={filters.store}
                      onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      {stores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ticket Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Created Date</label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr className="text-[10px] font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-5">Ticket ID</th>
                <th className="px-6 py-5">Customer Contact</th>
                <th className="px-6 py-5">Description / Type</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Created</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-slate-50">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  onClick={() => navigate(`/tickets/${ticket._id}`)}
                  className="bg-slate-100 hover:bg-slate-200 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-900">{ticket.ticketNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-bold text-slate-800">{getCustomerDisplay(ticket)}</div>
                    <div className="text-[10px] text-slate-500">{ticket.site || 'No store'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-700 truncate max-w-[200px] group-hover:text-orange-600 transition-colors">
                      {ticket.type} / {ticket.category}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">{ticket.description.length > 60 ? ticket.description.substring(0, 60) + '...' : ticket.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-orange-500 transition-all shadow-sm">
                      <MoreVertical size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm bg-slate-100">
                    No tickets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Showing {filteredTickets.length} of {tickets.length} records
          </p>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 flex items-center justify-center" disabled>
              <ChevronLeft size={14} />
            </button>
            <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};