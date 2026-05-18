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
  Loader2
} from 'lucide-react';
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
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  productDetails?: any;
  serviceAddress?: any;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State for user role and site (from localStorage)
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSiteId, setUserSiteId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read user data from localStorage on mount
  useEffect(() => {
    try {
      const userDataRaw = localStorage.getItem('hometown_user');
      if (userDataRaw) {
        const userData = JSON.parse(userDataRaw);
        setUserRole(userData.role || null);
        setUserSiteId(userData.siteId || null);
      } else {
        setError('User session not found. Please log in again.');
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      setError('Invalid user session data.');
    }
  }, []);

  // Fetch tickets based on role (HO sees all; non‑HO sees only their site)
  useEffect(() => {
    const fetchTickets = async () => {
      if (!userRole) return; // wait for user data

      try {
        setLoading(true);
        setError(null);
        
        let apiUrl = `${API_BASE_URL}/tickets`;
        const isHO = userRole.toUpperCase() === 'ADMIN';
        
        if (!isHO) {
          if (!userSiteId) {
            throw new Error('Site ID missing for non‑HO user.');
          }
          apiUrl += `?siteCode=${encodeURIComponent(userSiteId)}`;
        }
        
        const response = await fetch(apiUrl);
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setTickets(result.data);
        } else {
          setError(result.message || 'Invalid data format from server.');
        }
      } catch (err: any) {
        console.error('Error fetching tickets:', err);
        setError(err.message || 'Failed to load dashboard data. Please check the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userRole, userSiteId]);

  // Helper: get unique stores from tickets (for HO filter)
  const stores = ['All Stores', ...new Set(tickets.map(t => t.site).filter(Boolean))];
  const isHO = userRole?.toUpperCase() === 'ADMIN';

  // Filter tickets by selected store (only for HO; non‑HO already have site‑filtered data)
  const filteredTickets = isHO && selectedStore !== 'All Stores'
    ? tickets.filter(t => t.site === selectedStore)
    : tickets;

  // Compute statistics based on filtered tickets and role
  const computeStats = () => {
    const openStatuses = ['OPEN', 'ASSIGNED_TO_STORE_MANAGER', 'ASSIGNED_TO_FITTER', 'ASSIGNED_TO_DELIVERY', 'VISIT_SCHEDULED', 'IN_PROGRESS', 'CUSTOMER_NOT_AVAILABLE', 'WAITING_FOR_PARTS'];
    const resolvedStatuses = ['RESOLVED'];
    
    const openTickets = filteredTickets.filter(t => openStatuses.includes(t.status)).length;
    const closedTickets = filteredTickets.filter(t => resolvedStatuses.includes(t.status)).length;
    const today = new Date().toISOString().split('T')[0];
    const ticketsCreatedToday = filteredTickets.filter(t => t.createdAt.startsWith(today)).length;
    const ticketsWithType = (type: string) => filteredTickets.filter(t => t.type === type).length;

    switch(userRole?.toUpperCase()) {
      case 'ADMIN':
        return [
          { label: 'Open Tickets', value: openTickets, change: '+12%', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Closed Tickets', value: closedTickets, change: '+3%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Deliveries Today', value: ticketsCreatedToday, change: '85% SLA', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Installations', value: ticketsWithType('CRF'), change: 'Live', icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Issue Tickets', value: ticketsWithType('Complaint'), change: '-8%', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case 'STORE_MANAGER':
        return [
          { label: 'Open Tickets', value: openTickets, change: '+12%', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Closed Today', value: ticketsCreatedToday, change: 'Live', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Fitting Jobs', value: ticketsWithType('CRF'), change: '8 Assigned', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Deliveries', value: ticketsWithType('Request'), change: '12 Out', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Issue Tickets', value: ticketsWithType('Complaint'), change: 'Critical', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case 'WAREHOUSE':
        return [
          { label: 'Pending Picks', value: openTickets, change: '+12', icon: Box, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Store Requests', value: ticketsWithType('Request'), change: '5 Stores', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ready Dispatch', value: closedTickets, change: 'Live', icon: Truck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Shortage Alerts', value: ticketsWithType('Query'), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ];
      case 'DELIVERY':
        return [
          { label: 'Pending Deliveries', value: ticketsWithType('Request'), change: 'Assign Soon', icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Closed Today', value: ticketsCreatedToday, change: 'Great Job!', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Scheduled Tasks', value: openTickets, change: 'Weekly View', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Fuel Allowance', value: '₹450', change: 'Verified', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ];
      case 'FITTER':
        return [
          { label: 'Pending Fittings', value: ticketsWithType('CRF'), change: 'Today', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Jobs Closed', value: closedTickets, change: 'Weekly', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Spare Requests', value: ticketsWithType('Complaint'), change: 'Critical', icon: Package, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Avg TAT', value: '4.2h', change: 'Good', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
        ];
      default:
        return [];
    }
  };

  const stats = computeStats();

  // Recent tickets (last 5 by creation date)
  const recentTickets = [...filteredTickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (loading || userRole === null) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 text-sm font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-bold uppercase"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Executive Samadhan Metrics</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operations Overview</h1>
        </div>
        
        {isHO && (
          <div className="relative group">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm hover:border-orange-200 transition-colors cursor-pointer">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none pr-6 min-w-[140px]"
              >
                {stores.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="text-slate-400 absolute right-4 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">{stat.value}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
              <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-slate-800">
              {userRole?.toUpperCase() === 'DELIVERY' ? 'My Delivery Jobs (Today)' : 
               userRole?.toUpperCase() === 'FITTER' ? 'My Installation Schedule' : 'Priority Tickets (Escalations)'}
            </h2>
            <div className="flex gap-2">
              {userRole?.toUpperCase() === 'DELIVERY' || userRole?.toUpperCase() === 'FITTER' ? (
                <button 
                  onClick={() => navigate(userRole?.toUpperCase() === 'DELIVERY' ? '/delivery/tasks' : '/fitter/tasks')}
                  className="px-3 py-1.5 text-[10px] font-bold bg-orange-500 text-white rounded-lg uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Manage All Tasks
                </button>
              ) : (
                <>
                  <button className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 rounded-lg uppercase tracking-wider hover:bg-slate-100 transition-colors">
                    Regional View
                  </button>
                  <button className="px-3 py-1.5 text-[10px] font-bold bg-orange-500 text-white rounded-lg uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-sm">
                    Generate Report
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-50/50 sticky top-0">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">{userRole?.toUpperCase() === 'DELIVERY' ? 'Task ID' : 'Ticket ID'}</th>
                  <th className="px-6 py-4 text-center">{userRole?.toUpperCase() === 'DELIVERY' ? 'Time Slot' : 'Type'}</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {userRole?.toUpperCase() === 'DELIVERY' || userRole?.toUpperCase() === 'FITTER' ? (
                  recentTickets.map((ticket) => (
                    <tr 
                      key={ticket._id} 
                      onClick={() => navigate(`/tickets/${ticket.ticketNumber}`)}
                      className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">#{ticket.ticketNumber}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider">
                          {userRole?.toUpperCase() === 'DELIVERY' ? 'Delivery' : 'Fitting'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{ticket.customerMobile}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          ticket.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  recentTickets.map((ticket) => (
                    <tr 
                      key={ticket._id} 
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                      className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">#{ticket.ticketNumber}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider">
                          {ticket.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{ticket.customerMobile}</p>
                        <p className="text-[10px] text-slate-400">Order ID: {ticket.productDetails?.orderId || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          ticket.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {ticket.status === 'OPEN' ? 'Open' : 'Escalated'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500 text-sm">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#0F172A] rounded-xl shadow-lg p-8 text-white relative overflow-hidden group">
            <h2 className="text-lg font-bold mb-1 relative z-10">Global Performance</h2>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-8 relative z-10">System Efficiency</p>
            
            <div className="space-y-6 relative z-10">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wide">
                  <span className="text-slate-500">Service SLA</span>
                  <span className="text-orange-400">92%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-orange-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wide">
                  <span className="text-slate-500">Resolution Rate</span>
                  <span className="text-emerald-400">84%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '84%' }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Live Activity</h3>
            <div className="space-y-4">
              {recentTickets.slice(0, 3).map((ticket, idx) => (
                <div key={ticket._id} className="flex gap-3">
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                  <div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold">{ticket.site}</span> raised a <span className="font-bold text-orange-600">{ticket.type}</span> ticket: {ticket.description.substring(0, 60)}...
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(ticket.createdAt).toLocaleTimeString()} ago</p>
                  </div>
                </div>
              ))}
              {recentTickets.length === 0 && (
                <p className="text-slate-500 text-sm text-center">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};