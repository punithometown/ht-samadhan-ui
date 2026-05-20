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
  AlertCircle,
  Eye
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
  isDelivery?: boolean;
  isDeliveryDone?: boolean;
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

interface TaskRow {
  id: string;
  ticketNumber: string;
  orderId: string;
  customer: string;
  phone: string;
  address: string;
  items: string;
  status: string;
  timeSlot: string;
  amount?: number;
  originalTicket: Ticket;
}

// Map ticket status to display status
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

export const DeliveryAgentCompletedTasksList: React.FC = () => {
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

  // Filter: only completed deliveries (isDelivery true, isDeliveryDone true)
  const tasks: TaskRow[] = tickets
    .filter(t => t.isDelivery === true && t.isDeliveryDone === true)
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
        address: fullAddress || ticket.site || 'Address not provided',
        items: items || 'No items specified',
        status: mapTicketStatusToTaskStatus(ticket.status),
        timeSlot: new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: ticket.productDetails?.amount,
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
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Completed Deliveries</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Delivery History</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
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

      {/* Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Ticket #</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time Slot</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task) => (
                <tr 
                  key={task.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                    #{task.ticketNumber}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600">
                    {task.orderId}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-800">
                    {task.customer}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {task.phone}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">
                    {task.address}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-[150px] truncate">
                    {task.items}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {task.timeSlot}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/delivery-task/${task.id}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm">No completed deliveries found.</p>
                  </td>
                </tr>
              )}
            </tbody>
           </table>
        </div>
      </div>

      {/* Optional summary footer */}
      {filteredTasks.length > 0 && (
        <div className="flex justify-end">
          <div className="bg-slate-50 rounded-lg px-4 py-2 text-xs font-medium text-slate-600">
            Total deliveries: {filteredTasks.length}
          </div>
        </div>
      )}
    </div>
  );
};