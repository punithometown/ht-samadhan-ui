import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Search, 
  MapPin, 
  Calendar, 
  Phone,
  Navigation,
  Loader2,
  AlertCircle
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
  productDetails?: {
    orderId?: string;
    invoiceNumber?: string;
    purchaseDate?: string;
    amount?: number;
    itemDescription?: string;
    productName?: string;
  };
  serviceAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  comments?: Array<{
    _id: string;
    message: string;
    commentedBy: string;
    createdAt: string;
  }>;
  attachments?: any[];
}

interface Task {
  id: string;
  orderId: string;
  ticketNumber: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  items: string;
  status: string;
  timeSlot: string;
  priority: 'Normal' | 'High';
  comments: string[];
  amount?: number;
  invoiceNumber?: string;
  purchaseDate?: string;
  originalTicket: Ticket;
}

// Map ticket status to task status (display)
const mapTicketStatusToTaskStatus = (ticketStatus: string): string => {
  switch (ticketStatus) {
    case 'DELIVERY_SCHEDULED':
      return 'Pending';
    case 'ASSIGNED_TO_DELIVERY':
      return 'Out for Delivery';
    case 'RESOLVED':
    case 'CLOSED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Failed';
    default:
      return 'Pending';
  }
};

export const DeliveryAgentTasksList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tickets`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setTickets(result.data);
      } else {
        setError('Invalid data format');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Only show tickets with status = 'DELIVERY_SCHEDULED'
  const tasks: Task[] = tickets
    .filter(t => t.status === 'DELIVERY_AGENT_ASSIGNED' && t.isDelivery == true)
    .map(ticket => {
      const fullAddress = [
        ticket.serviceAddress?.line1,
        ticket.serviceAddress?.line2,
        ticket.serviceAddress?.city,
        ticket.serviceAddress?.state,
        ticket.serviceAddress?.pincode
      ].filter(Boolean).join(', ');
      
      const items = ticket.productDetails?.itemDescription || 
                    ticket.productDetails?.productName || 
                    ticket.category;
      
      return {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        orderId: ticket.productDetails?.orderId || 'N/A',
        customer: ticket.customerName || ticket.customerMobile,
        phone: ticket.customerMobile,
        email: ticket.customerEmail || '—',
        address: fullAddress || ticket.site || 'Address not provided',
        items: items || 'No items specified',
        status: mapTicketStatusToTaskStatus(ticket.status),
        timeSlot: new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: ticket.type === 'Complaint' ? 'High' : 'Normal',
        comments: ticket.comments?.map(c => c.message) || [],
        amount: ticket.productDetails?.amount,
        invoiceNumber: ticket.productDetails?.invoiceNumber,
        purchaseDate: ticket.productDetails?.purchaseDate,
        originalTicket: ticket
      };
    });

  const filteredTasks = tasks.filter(t => 
    t.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Out for Delivery': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-slate-600 text-sm ml-3">Loading delivery tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 text-sm font-medium">{error}</p>
        <button onClick={fetchTickets} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-bold uppercase">
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
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Field Operations</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Delivery Assignments</h1>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Today, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
           </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Customer, Order ID or Ticket #..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => (
          <motion.div 
            key={task.id}
            layoutId={task.id}
            onClick={() => navigate(`/delivery-task/${task.id}`)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer overflow-hidden group"
          >
            <div className="p-5 border-b border-slate-50">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Truck size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.ticketNumber}</p>
                        <h4 className="text-sm font-black text-slate-900">Order #{task.orderId}</h4>
                     </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
               </div>
               
               <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                     <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                     <p className="text-xs font-medium text-slate-600 leading-relaxed">{task.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-slate-300 shrink-0" />
                     <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Slot: {task.timeSlot}</p>
                  </div>
               </div>

               <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deliverable Items</p>
                  <p className="text-xs text-slate-700 font-medium">{task.items}</p>
               </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                     <Phone size={12} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{task.phone}</span>
               </div>
               <button className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                  Update Delivery <Navigation size={12} />
               </button>
            </div>
          </motion.div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No active delivery tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
};