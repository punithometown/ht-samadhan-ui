

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  History,
  Phone,
  Paperclip,
  Loader2,
  Truck,
  Wrench,
  Store,
  Calendar,
  UserCheck,
  RefreshCw,
  User,
  MapPin,
  Package,
  UserPlus,
} from 'lucide-react';
import { motion } from 'motion/react';

import { API_BASE_URL } from '../config/api';
import { use } from 'motion/react-client';

// ----------------------------------------------------------------------
// INTERFACES
// ----------------------------------------------------------------------
interface Comment {
  _id: string;
  message: string;
  comment: string;
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

interface LocationInfo {
  city?: string;
  state?: string;
  pincode?: string;
}

interface DeliveryInfo {
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  assignedTo?: string;
  assignedToId?: string;
  location?: LocationInfo;
}

interface FittingInfo {
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  assignedTo?: string;
  assignedToId?: string;
  location?: LocationInfo;
}

interface AssignedUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  siteId?: string;
  role?: string;
}

interface AssignedStore {
  _id?: string;
  name?: string;
  code?: string;
  city?: string;
  state?: string;
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
  createdBy?: string;
  createdById?: string;
  createdByStore?: string;
  assignedStoreManager?: AssignedUser;
  assignedFitter?: AssignedUser;
  assignedDelivery?: AssignedUser;
  assignedStore?: AssignedStore;
  scheduledVisitDate?: string;
  isDelivery?: boolean;
  delivery?: DeliveryInfo;
  isFitting?: boolean;
  fitting?: FittingInfo;
  productDetails?: ProductDetails;
  serviceAddress?: ServiceAddress;
  comments: Comment[];
  attachments?: any[];
}

// ----------------------------------------------------------------------
// STATUS CONFIGURATION
// ----------------------------------------------------------------------
const STATUS_OPTIONS = [
  'OPEN',
  'ASSIGNED_TO_STORE_MANAGER',
  'ASSIGNED_TO_DELIVERY',
  'ASSIGNED_TO_FITTER',
  'VISIT_SCHEDULED',
  'IN_PROGRESS',
  'CUSTOMER_NOT_AVAILABLE',
  'WAITING_FOR_PARTS',
  'RESOLVED',
  'CANCELLED'
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  OPEN: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Open' },
  ASSIGNED_TO_STORE_MANAGER: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', label: 'Assigned – Store Manager' },
  ASSIGNED_TO_FITTER: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', label: 'Assigned – Fitter' },
  ASSIGNED_TO_DELIVERY: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500', label: 'Assigned – Delivery' },
  VISIT_SCHEDULED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500', label: 'Visit Scheduled' },
  IN_PROGRESS: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500', label: 'In Progress' },
  CUSTOMER_NOT_AVAILABLE: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500', label: 'Customer Not Available' },
  WAITING_FOR_PARTS: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Waiting for Parts' },
  RESOLVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', label: 'Resolved' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Cancelled' },
};

const getStatusCfg = (s: string) =>
  STATUS_CONFIG[s] ?? { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400', label: s.replace(/_/g, ' ') };

// ----------------------------------------------------------------------
// HELPER: get logged-in user
// ----------------------------------------------------------------------
const getUserFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("hometown_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse hometown_user from localStorage", err);
    return null;
  }
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalMessage, setInternalMessage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  // Fitter assignment
  const [fitters, setFitters] = useState<AssignedUser[]>([]);
  const [selectedFitterId, setSelectedFitterId] = useState<string>('');
  const [assigningFitter, setAssigningFitter] = useState(false);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`);
      const result = await response.json();
      if (result.success && result.data) {
        setTicket(result.data);
        setSelectedStatus(result.data.status);
        // set default selectedFitterId if already assigned
        if (result.data.assignedFitter?._id) {
          setSelectedFitterId(result.data.assignedFitter._id);
        } else {
          setSelectedFitterId('');
        }
      } else {
        setError(result.message || 'Ticket not found');
      }
    } catch (err) {
      setError('Failed to load ticket details. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch fitters (role FITTER)
  const fetchFitters = async () => {
    try {
      const userData = getUserFromLocalStorage();
      const response = await fetch(`${API_BASE_URL}/users?role=FITTER`);
      const data = await response.json();
      if (data.success && data.data) {
        const fittersOnly = data.data.filter((u: any) => u.role === 'FITTER' && u.siteId == userData?.siteId);
        setFitters(fittersOnly);
        // setFitters(data.data);
        console.log("Fetched fitters:", data.data, userData?.siteId, userData);
        console.log("Filtered fitters for siteId", fittersOnly);
      }
    } catch (err) {
      console.error("Failed to fetch fitters", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketDetail();
      fetchFitters();
    }
  }, [id]);

  // Update ticket status – now includes automatic status change comment
  const updateTicketStatus = async (newStatus: string, note?: string) => {
    // if (!newStatus || newStatus === ticket?.status) return;
    setUpdatingStatus(true);
    try {
      const userData = getUserFromLocalStorage();
      const oldStatus = ticket?.status;
      const statusChangeComment = `Status changed from ${oldStatus} to ${newStatus}`;
      const finalComment = note?.trim()
        ? `${statusChangeComment} — ${note.trim()}`
        : statusChangeComment;

      const body: Record<string, any> = {
        status: newStatus,
        comment: finalComment,
        commentedBy: userData?.name || '',
        commentedById: userData?.id || '',
      };

      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        setStatusUpdateSuccess(true);
        setTimeout(() => setStatusUpdateSuccess(false), 2500);
        setStatusNote('');
        await fetchTicketDetail();
      } else {
        alert(`Failed to update status: ${result.message}`);
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApplyStatusUpdate = () => {
    updateTicketStatus(selectedStatus, statusNote);
  };

  // Post a manual comment
  const handlePostUpdate = async () => {
    if (!internalMessage.trim()) return;
    try {
      const userData = getUserFromLocalStorage();
      const body = {
        comment: internalMessage,
        commentedBy: userData?.name || 'ADMIN',
        commentedById: userData?.id || '',
      };

      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        await fetchTicketDetail();
        setInternalMessage('');
      } else {
        alert('Failed to post update');
      }
    } catch {
      alert('Error posting update');
    }
  };

  const handleResolveTicket = async () => {
    if (!window.confirm('Mark this ticket as RESOLVED?')) return;
    await updateTicketStatus('RESOLVED');
  };

  // Assign fitter to ticket
  const handleAssignFitter = async () => {
    if (!selectedFitterId) return;
    setAssigningFitter(true);
    try {
      const userData = getUserFromLocalStorage();
      const selectedFitter = fitters.find(f => f._id === selectedFitterId);
      const body = {
        assignedFitterId: selectedFitterId,
        assignedFitterName: selectedFitter?.name,
        commentedBy: userData?.name || '',
        commentedById: userData?.id || '',
        comment: `Fitter assigned: ${selectedFitter?.name}`,
        status: 'ASSIGNED_TO_FITTER',
      };
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.success) {
        await fetchTicketDetail();
      } else {
        alert('Failed to assign fitter');
      }
    } catch {
      alert('Network error');
    } finally {
      setAssigningFitter(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
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
        <button onClick={() => navigate('/tickets')} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-bold uppercase">
          Back to Tickets
        </button>
      </div>
    );
  }

  const subjectLine = `${ticket.type} - ${ticket.category}${ticket.subCategory ? `: ${ticket.subCategory}` : ''}`;
  const cfg = getStatusCfg(ticket.status);
  const isTerminal = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' || ticket.status === 'CANCELLED';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* ── Header ── */}
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
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 border-l border-slate-200">{ticket.type}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{subjectLine}</h1>
            {ticket.createdBy && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                Created by <span className="font-bold text-slate-700">{ticket.createdBy}</span>
                {ticket.createdByStore && <> · <span className="text-slate-600">{ticket.createdByStore}</span></>}
                <span className="ml-1 text-slate-400">· {formatDate(ticket.createdAt)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleResolveTicket}
            disabled={isTerminal || updatingStatus}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={14} /> Resolve Ticket
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors hidden md:block">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* ── CURRENT STATUS BANNER ── */}
      <section className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${cfg.dot} shadow-md ring-4 ring-white shrink-0`} />
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Current Status</p>
            <p className={`text-lg font-black ${cfg.text} tracking-tight`}>{cfg.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Clock size={12} />
          <span>Last updated {formatDate(ticket.updatedAt)}</span>
        </div>
      </section>

      {/* ── STATUS UPDATE PANEL ── */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/40 flex items-center gap-2">
          <RefreshCw size={14} className="text-orange-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Update Status</h3>
          {updatingStatus && <Loader2 size={14} className="animate-spin text-orange-500 ml-auto" />}
          {statusUpdateSuccess && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="ml-auto flex items-center gap-1 text-[10px] font-bold text-green-600"
            >
              <CheckCircle2 size={12} /> Status updated
            </motion.span>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Select New Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => {
                const c = getStatusCfg(s);
                const isCurrent = s === ticket.status;
                const isSelected = s === selectedStatus;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    disabled={isTerminal && !isCurrent}
                    className={`
                      px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                      ${isSelected
                        ? `${c.bg} ${c.text} ${c.border} shadow-sm ring-2 ring-offset-1 ${c.border.replace('border-', 'ring-')}`
                        : isCurrent
                          ? `${c.bg} ${c.text} ${c.border}`
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }
                      disabled:opacity-30 disabled:cursor-not-allowed
                    `}
                  >
                    {isCurrent && <span className="mr-1">●</span>}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start">
            {/* <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Optional note for this status change..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all"
            /> */}
            <button
              onClick={handleApplyStatusUpdate}
              disabled={selectedStatus === ticket.status || updatingStatus || !selectedStatus}
              className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updatingStatus ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Apply Update
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Grievance Overview */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <AlertCircle size={14} className="text-orange-600" /> Grievance Overview
              </h3>
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
                      {ticket.customerMobile.slice(-3)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ticket.customer}</p>
                      <p className="text-[10px] text-slate-600">{ticket.customerEmail}</p>
                      {ticket.customerInvoice && <p className="text-[10px] text-slate-500">Invoice: {ticket.customerInvoice}</p>}
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
                      <p className="text-[10px] text-slate-400">Source: {ticket.source}</p>
                    </div>
                  </div>
                </div>
              </div>

              {ticket.productDetails && Object.values(ticket.productDetails).some(v => v) && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package size={12} /> Product Info
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {ticket.productDetails.productName && <div><span className="text-slate-500">Name:</span> <span className="text-slate-800 font-medium">{ticket.productDetails.productName}</span></div>}
                    {ticket.productDetails.productCode && <div><span className="text-slate-500">Code:</span> <span className="text-slate-800 font-medium">{ticket.productDetails.productCode}</span></div>}
                    {ticket.productDetails.orderId && <div><span className="text-slate-500">Order ID:</span> <span className="text-slate-800 font-medium">{ticket.productDetails.orderId}</span></div>}
                    {ticket.productDetails.invoiceNumber && <div><span className="text-slate-500">Invoice:</span> <span className="text-slate-800 font-medium">{ticket.productDetails.invoiceNumber}</span></div>}
                    {ticket.productDetails.amount !== undefined && <div><span className="text-slate-500">Amount:</span> <span className="text-slate-800 font-medium">₹{ticket.productDetails.amount?.toFixed(2)}</span></div>}
                    {
                      ticket.productDetails.itemDescription && (
                        <div className="col-span-2">
                          <span className="text-slate-500">Items:</span>

                          <div className="mt-2 space-y-3">
                            {
                              ticket.productDetails.itemDescription && (
                                <div className="col-span-2">
                                  <div className="mt-1 space-y-2">
                                    {ticket.productDetails.itemDescription
                                      .split('---')
                                      .map((item: string, index: number) => (
                                        <div
                                          key={index}
                                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] leading-4"
                                        >
                                          {item
                                            .trim()
                                            .split(/(?=Article:|Description:|Qty:|MC:|LOB:|Order:|Invoice:|Hierarchy:|Billing Date:)/g)
                                            .map((line: string, idx: number) => (
                                              <div key={idx} className="mb-0.5">
                                                <span className="text-slate-700 whitespace-pre-wrap">
                                                  {line.trim()}
                                                </span>
                                              </div>
                                            ))}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      )
                    }
                    {ticket.productDetails.purchaseDate && <div><span className="text-slate-500">Purchase Date:</span> <span className="text-slate-800 font-medium">{formatShortDate(ticket.productDetails.purchaseDate)}</span></div>}
                  </div>
                </div>
              )}

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

          {/* Delivery Card */}
          {ticket.isDelivery && ticket.delivery && (
            <section className="bg-white rounded-xl border border-cyan-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-cyan-100 bg-cyan-50/40 flex items-center gap-2">
                <Truck size={14} className="text-cyan-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Delivery Details</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Scheduled Date</p>
                  <p className="text-xs font-bold text-slate-800">{formatShortDate(ticket.delivery.scheduledDate)}</p>
                  {ticket.delivery.scheduledTimeSlot && (
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {ticket.delivery.scheduledTimeSlot}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assigned Agent</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
                      <User size={12} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">{ticket.delivery.assignedTo || '—'}</p>
                  </div>
                </div>
                {ticket.delivery.location && Object.values(ticket.delivery.location).some(v => v) && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Delivery Location</p>
                    <p className="text-xs text-slate-700">
                      {[ticket.delivery.location.city, ticket.delivery.location.state, ticket.delivery.location.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Fitting Card */}
          {ticket.isFitting && ticket.fitting && (
            <section className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-orange-100 bg-orange-50/40 flex items-center gap-2">
                <Wrench size={14} className="text-orange-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Fitting Details</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Scheduled Date</p>
                  <p className="text-xs font-bold text-slate-800">{formatShortDate(ticket.fitting.scheduledDate)}</p>
                  {ticket.fitting.scheduledTimeSlot && (
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {ticket.fitting.scheduledTimeSlot}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assigned Fitter</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
                      <User size={12} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">{ticket.fitting.assignedTo || '—'}</p>
                  </div>
                </div>
                {ticket.fitting.location && Object.values(ticket.fitting.location).some(v => v) && (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fitting Location</p>
                    <p className="text-xs text-slate-700">
                      {[ticket.fitting.location.city, ticket.fitting.location.state, ticket.fitting.location.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Comments / Timeline */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                            {new Date(comment.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{comment.comment}</p>
                      </div>
                      {idx < (ticket.comments?.length || 0) - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-slate-100" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">No comments yet. Be the first to post an update.</div>
              )}

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
                      {/* <Paperclip size={16} /> */}
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

          {/* Assignments Card */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Assignments</h3>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Store size={10} /> Assigned Store
                </p>
                {ticket.assignedStore ? (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <Store size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ticket.assignedStore.name || ticket.site || '—'}</p>
                      {ticket.assignedStore.code && (
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Code: {ticket.assignedStore.code}</p>
                      )}
                      {(ticket.assignedStore.city || ticket.assignedStore.state) && (
                        <p className="text-[10px] text-slate-400">
                          {[ticket.assignedStore.city, ticket.assignedStore.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ) : ticket.site ? (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <Store size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ticket.site}</p>
                      {ticket.siteCode && (
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Code: {ticket.siteCode}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Not assigned</p>
                )}
              </div>

              {/* Fitter Assignment Dropdown */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Wrench size={10} /> Assigned Fitter
                </p>
                {fitters.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={selectedFitterId}
                      onChange={(e) => setSelectedFitterId(e.target.value)}
                      disabled={isTerminal || assigningFitter}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                    >
                      <option value="">-- Select Fitter --</option>
                      {fitters.map((fitter) => (
                        <option key={fitter._id} value={fitter._id}>
                          {fitter.name} {fitter.phone ? `(${fitter.phone})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignFitter}
                      disabled={!selectedFitterId || assigningFitter || isTerminal}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {assigningFitter ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                      {assigningFitter ? 'Assigning...' : 'Assign Fitter'}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Loading fitters...</p>
                )}
                {ticket.assignedFitter && (
                  <div className="mt-2 flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs uppercase">
                      {ticket.assignedFitter.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{ticket.assignedFitter.name}</p>
                      {ticket.assignedFitter.phone && <p className="text-[10px] text-slate-500">{ticket.assignedFitter.phone}</p>}
                    </div>
                  </div>
                )}
              </div>

              {ticket.scheduledVisitDate && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Calendar size={10} /> Scheduled Visit
                  </p>
                  <p className="text-xs font-bold text-slate-800">{formatDate(ticket.scheduledVisitDate)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Logistics Context */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4 mb-6">Logistics Context</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Order / Invoice</p>
                  <p className="text-xs font-bold text-slate-800">{ticket.customerInvoice || ticket.productDetails?.invoiceNumber || 'N/A'}</p>
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

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${ticket.isDelivery ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-400'}`}>
                  <Truck size={10} /> Delivery {ticket.isDelivery ? 'Yes' : 'No'}
                </span>
                <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${ticket.isFitting ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                  <Wrench size={10} /> Fitting {ticket.isFitting ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </section>

          {/* Ticket Age */}
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
                {ticket.status === 'OPEN' ? 'Awaiting assignment' : cfg.label}
              </p>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};