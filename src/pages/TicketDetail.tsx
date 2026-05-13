import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  User, 
  MapPin, 
  Package, 
  AlertCircle, 
  CheckCircle2,
  MoreVertical,
  Send,
  History,
  Phone,
  Paperclip,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

interface Comment {
  _id: string;
  message: string;
  commentedBy: string;
  commentedById: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductDetails {
  productName?: string;
  productCode?: string;
  orderId?: string;
  invoiceNumber?: string;
  purchaseDate?: string;
  amount?: number;
  itemDescription?: string;
}

interface ServiceAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

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
  customerInvoice?: string;
  createdAt: string;
  updatedAt: string;
  productDetails?: ProductDetails;
  serviceAddress?: ServiceAddress;
  comments: Comment[];
  attachments?: any[];
}

// All possible status values (from backend schema)
const STATUS_OPTIONS = [
  'OPEN',
  'ASSIGNED_TO_STORE_MANAGER',
  'ASSIGNED_TO_FITTER',
  'ASSIGNED_TO_DELIVERY',
  'VISIT_SCHEDULED',
  'IN_PROGRESS',
  'CUSTOMER_NOT_AVAILABLE',
  'WAITING_FOR_PARTS',
  'RESOLVED',
  'CLOSED',
  'CANCELLED'
];

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalMessage, setInternalMessage] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch ticket details
  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/tickets/${id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setTicket(result.data);
      } else {
        setError(result.message || 'Ticket not found');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Failed to load ticket details. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetail();
    }
  }, [id]);

  // Update ticket status via PATCH API
  const updateTicketStatus = async (newStatus: string) => {
    if (newStatus === ticket?.status) {
      setShowStatusDropdown(false);
      return;
    }
    setUpdatingStatus(true);
    try {
      const response = await fetch(`http://localhost:5001/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        await fetchTicketDetail(); // refresh ticket
      } else {
        alert(`Failed to update status: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error. Please try again.');
    } finally {
      setUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  // Post comment
  const handlePostUpdate = async () => {
    if (!internalMessage.trim()) return;
    try {
      const response = await fetch(`http://localhost:5001/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: internalMessage, commentedBy: 'SUPPORT_AGENT' })
      });
      const result = await response.json();
      if (result.success) {
        await fetchTicketDetail();
        setInternalMessage('');
      } else {
        alert('Failed to post update');
      }
    } catch (err) {
      console.error(err);
      alert('Error posting update');
    }
  };

  // Resolve ticket (shortcut)
  const handleResolveTicket = async () => {
    if (!window.confirm('Mark this ticket as RESOLVED?')) return;
    await updateTicketStatus('RESOLVED');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCommentDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700',
      ASSIGNED_TO_STORE_MANAGER: 'bg-purple-100 text-purple-700',
      ASSIGNED_TO_FITTER: 'bg-orange-100 text-orange-700',
      ASSIGNED_TO_DELIVERY: 'bg-cyan-100 text-cyan-700',
      VISIT_SCHEDULED: 'bg-indigo-100 text-indigo-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      CUSTOMER_NOT_AVAILABLE: 'bg-pink-100 text-pink-700',
      WAITING_FOR_PARTS: 'bg-amber-100 text-amber-700',
      RESOLVED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 text-sm font-medium">{error || 'Ticket not found'}</p>
        <button 
          onClick={() => navigate('/tickets')}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-bold uppercase"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  const subjectLine = `${ticket.type} - ${ticket.category}${ticket.subCategory ? `: ${ticket.subCategory}` : ''}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tickets')}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">#{ticket.ticketNumber}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 border-l border-slate-200">
                {ticket.type}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{subjectLine}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 relative">
          {/* Status Update Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Clock size={14} /> Update status <ChevronDown size={12} />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status}
                    onClick={() => updateTicketStatus(status)}
                    disabled={updatingStatus}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${
                      ticket.status === status ? 'bg-orange-50 text-orange-700' : 'text-slate-700'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                    {updatingStatus && status === ticket.status && (
                      <Loader2 size={12} className="inline ml-2 animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={handleResolveTicket}
            disabled={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || updatingStatus}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={14} /> Resolve Ticket
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors hidden md:block">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <AlertCircle size={14} className="text-orange-600" />
                Grievance Overview
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${getStatusBadge(ticket.status)}`}>
                {ticket.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="p-8">
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {ticket.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Customer Contact</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase">
                      {ticket.customerMobile.slice(-2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ticket.customerMobile}</p>
                      <p className="text-[10px] text-slate-600">{ticket.customerEmail}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Associated Site</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ticket.site || 'No site'}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Code: {ticket.siteCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {ticket.productDetails && Object.values(ticket.productDetails).some(v => v) && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package size={12} /> Product Info
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {ticket.productDetails.productName && <div><span className="text-slate-500">Name:</span> <span className="text-slate-800">{ticket.productDetails.productName}</span></div>}
                    {ticket.productDetails.productCode && <div><span className="text-slate-500">Code:</span> <span className="text-slate-800">{ticket.productDetails.productCode}</span></div>}
                    {ticket.productDetails.orderId && <div><span className="text-slate-500">Order ID:</span> <span className="text-slate-800">{ticket.productDetails.orderId}</span></div>}
                    {ticket.productDetails.amount !== undefined && ticket.productDetails.amount !== null && <div><span className="text-slate-500">Amount:</span> <span className="text-slate-800">₹{ticket.productDetails.amount.toFixed(2)}</span></div>}
                    {ticket.productDetails.itemDescription && <div className="col-span-2"><span className="text-slate-500">Item:</span> <span className="text-slate-800">{ticket.productDetails.itemDescription}</span></div>}
                    {ticket.productDetails.invoiceNumber && <div><span className="text-slate-500">Invoice:</span> <span className="text-slate-800">{ticket.productDetails.invoiceNumber}</span></div>}
                    {ticket.productDetails.purchaseDate && <div><span className="text-slate-500">Purchase Date:</span> <span className="text-slate-800">{new Date(ticket.productDetails.purchaseDate).toLocaleDateString()}</span></div>}
                  </div>
                </div>
              )}

              {/* Service Address */}
              {ticket.serviceAddress && Object.values(ticket.serviceAddress).some(v => v) && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12} /> Service Address
                  </h4>
                  <div className="text-xs text-slate-700">
                    {ticket.serviceAddress.line1 && <div>{ticket.serviceAddress.line1}</div>}
                    {ticket.serviceAddress.line2 && <div>{ticket.serviceAddress.line2}</div>}
                    <div>
                      {ticket.serviceAddress.city && <span>{ticket.serviceAddress.city}, </span>}
                      {ticket.serviceAddress.state && <span>{ticket.serviceAddress.state} </span>}
                      {ticket.serviceAddress.pincode && <span>- {ticket.serviceAddress.pincode}</span>}
                    </div>
                    {ticket.serviceAddress.landmark && <div className="text-slate-500">Landmark: {ticket.serviceAddress.landmark}</div>}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Comments / Timeline */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <History size={14} className="text-slate-500" />
                Activity & Comments ({ticket.comments?.length || 0})
              </h3>
            </div>
            <div className="p-8 space-y-6">
              {ticket.comments && ticket.comments.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((comment, idx) => (
                    <div key={comment._id} className="flex gap-4 relative">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <User size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-800">{comment.commentedBy}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-tighter">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.message}</p>
                      </div>
                      {idx < (ticket.comments?.length || 0) - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-slate-100" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No comments yet. Be the first to post an update.
                </div>
              )}

              {/* Post internal update */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="relative group">
                  <textarea 
                    value={internalMessage}
                    onChange={(e) => setInternalMessage(e.target.value)}
                    placeholder="Post internal update..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xs focus:ring-2 focus:ring-orange-500/20 transition-all outline-none resize-none md:pr-32 text-slate-700"
                    rows={3}
                  />
                  <div className="md:absolute md:bottom-4 md:right-4 flex items-center justify-end gap-2 mt-2 md:mt-0">
                    <button className="p-2 rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
                      <Paperclip size={16} />
                    </button>
                    <button 
                      onClick={handlePostUpdate}
                      className="bg-slate-800 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                      Post update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Logistics Context</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Order / Invoice</p>
                  <p className="text-xs font-bold text-slate-800">
                    {ticket.customerInvoice || ticket.productDetails?.invoiceNumber || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Customer Contact</p>
                  <p className="text-xs font-bold text-slate-800">{ticket.customerMobile}</p>
                  <p className="text-[10px] text-slate-600">{ticket.customerEmail}</p>
                </div>
              </div>
            </div>
          </section>

          {/* SLA / Risk Card - Darker text inside */}
          <div className="bg-[#0F172A] rounded-xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-4">Ticket Age</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-black text-orange-400">
                  {Math.floor((new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60))}h
                </div>
                <div className="text-[10px] text-slate-400 leading-tight uppercase font-medium">Since creation</div>
              </div>
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-red-500 rounded-full" />
              </div>
              <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-widest italic text-center">
                {ticket.status === 'OPEN' ? 'Awaiting assignment' : 'In progress'}
              </p>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};