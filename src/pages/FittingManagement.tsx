import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Hammer,
  Loader2
} from 'lucide-react';

import { API_BASE_URL } from '../config/api';


interface FittingTicket {
  _id: string;
  ticketNumber: string;
  customerName?: string;
  customerMobile: string;
  location: string;
  items: string;
  status: string;
  fitter: string | null;
  date: string;
  complexity: 'Simple' | 'Complex';
  type: string;
  category: string;
}

export const FittingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<FittingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Format address from serviceAddress object
  const formatAddress = (ticket: any): string => {
    if (ticket.serviceAddress) {
      const { line1, city, state, pincode } = ticket.serviceAddress;
      return [line1, city, state, pincode].filter(Boolean).join(', ');
    }
    return ticket.site || 'Address not provided';
  };

  // Determine complexity based on ticket type/category
  const getComplexity = (ticket: any): 'Simple' | 'Complex' => {
    if (ticket.type === 'CRF') return 'Complex';
    if (ticket.category?.toLowerCase().includes('installation')) return 'Complex';
    return 'Simple';
  };

  // Get display-friendly item description
  const getItemDescription = (ticket: any): string => {
    if (ticket.productDetails?.itemDescription) return ticket.productDetails.itemDescription;
    if (ticket.productDetails?.productName) return ticket.productDetails.productName;
    if (ticket.category) return ticket.category;
    return 'Fitting/Installation job';
  };

  // Fetch tickets with status = ASSIGNED_TO_FITTER
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/tickets`);
        const data = await response.json();

        if (!data.success || !Array.isArray(data.data)) {
          throw new Error('Failed to fetch tickets');
        }

        const fittingTickets = data.data
          .filter((t: any) =>  t.type == 'Installation' && t.isDelivery == true && t.isFitting == false && t.isDeliveryDone == true)
          .map((t: any) => ({
            _id: t._id,
            ticketNumber: t.ticketNumber,
            customerName: t.customerName || t.customerMobile,
            customerMobile: t.customerMobile,
            location: formatAddress(t),
            items: getItemDescription(t),
            status: t.status,
            fitter: t.assignedTo || null,
            date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
            complexity: getComplexity(t),
            type: t.type,
            category: t.category,
          }));

        setTickets(fittingTickets);
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
    return 'bg-cyan-50 text-cyan-600 border-cyan-100';
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
    { label: 'Ready for Scheduling', value: tickets.length, icon: Wrench, color: 'text-cyan-600' },
    { label: 'Pending Visit', value: tickets.filter(t => !t.fitter).length, icon: Clock, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Technical Services</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fitting & Installation</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule fitting/installation visits</p>
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
            <option value="All">All Jobs</option>
            <option value="ASSIGNED_TO_FITTER">Ready to Schedule</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Ticket ID</th>
                <th className="px-6 py-5">Customer & Items</th>
                <th className="px-6 py-5">Complexity</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Assigned Fitter</th>
                <th className="px-6 py-5 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-900">{ticket.ticketNumber}</span>
                    <div className="text-[9px] text-slate-400 mt-0.5">{ticket.type} / {ticket.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{ticket.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">{ticket.items}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <MapPin size={10} />
                      {ticket.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      ticket.complexity === 'Complex' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.complexity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(ticket.status)}`}>
                      Ready for Scheduling
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.fitter ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{ticket.fitter}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/fitting-assign/${ticket._id}`)}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1 ml-auto"
                    >
                      <Calendar size={12} />
                      Schedule Visit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                    No fitting tickets ready for scheduling.
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