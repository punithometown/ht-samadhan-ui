import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Wrench,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Navigation,
  X,
  Package,
  Plus,
  Hammer,
  Loader2,
  IndianRupee,
  User,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { API_BASE_URL } from '../../config/api';


// Interface matching the SparePartRequest schema (backend)
interface SparePartRequestDoc {
  _id?: string;
  ticketId: string;
  sparePart: string;
  urgency: 'Normal' | 'Critical' | 'Emergency';
  requestById: string;
  requestByName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED';
  reason?: string;
  quantity?: number;
  createdAt?: string;
}

interface FittingTask {
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
  customerName?: string;
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
    amount?: number;
    itemDescription?: string;
  };
  serviceAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  comments?: Array<{ message: string; commentedBy: string; createdAt: string }>;
}

export const FitterTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<FittingTask | null>(null);
  const [spareRequests, setSpareRequests] = useState<SparePartRequestDoc[]>([]);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [showSparePartForm, setShowSparePartForm] = useState(false);
  const [sparePartForm, setSparePartForm] = useState({
    sparePart: '',
    quantity: 1,
    reason: '',
    urgency: 'Normal' as 'Normal' | 'Critical' | 'Emergency'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // ── Fetch single ticket and its spare part requests ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch ticket
        const ticketRes = await fetch(`${API_BASE_URL}/tickets/${id}`);
        const ticketResult = await ticketRes.json();
        if (!ticketResult.success || !ticketResult.data) {
          throw new Error(ticketResult.message || 'Ticket not found');
        }
        setTask(ticketResult.data);

        // Fetch spare part requests for this ticket (assuming GET /api/spare-part-requests?ticketId=...)
        const spareRes = await fetch(`${API_BASE_URL}/spare-part-requests?ticketId=${id}`);
        const spareResult = await spareRes.json();
        if (spareResult.success && Array.isArray(spareResult.data)) {
          setSpareRequests(spareResult.data);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatAddress = (t: FittingTask): string => {
    const a = t.serviceAddress;
    if (!a) return t.site || 'No address provided';
    return [a.line1, a.line2, a.city, a.state, a.pincode]
      .filter(Boolean)
      .join(', ');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatDateTime = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleString() : '';

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED_TO_FITTER': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'IN_PROGRESS':        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'RESOLVED':           return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'OPEN':               return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CANCELLED':          return 'bg-rose-50 text-rose-600 border-rose-100';
      default:                   return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getRequestStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
      DELIVERED: 'bg-blue-100 text-blue-700 border-blue-200',
      CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  const statusLabel = (status: string) => status.replace(/_/g, ' ');
  const statusOptions = ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'];

  // ── Update ticket status & comment ───────────────────────────────────────
  const handleUpdate = async () => {
    if (!task || (!updateStatus && !newComment.trim())) return;

    try {
      setUpdating(true);
      const payload: Record<string, any> = {};
      if (updateStatus) payload.status = updateStatus;
      if (newComment.trim()) payload.comment = `${updateStatus || task.status}: ${newComment}`;

      const response = await fetch(`http://localhost:5001/api/tickets/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        // Refresh ticket (to get updated status and comments)
        const updatedRes = await fetch(`http://localhost:5001/api/tickets/${id}`);
        const updatedResult = await updatedRes.json();
        if (updatedResult.success && updatedResult.data) {
          setTask(updatedResult.data);
        }
        setUpdateStatus('');
        setNewComment('');
      } else {
        alert(result.message || 'Failed to update ticket.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error while updating.');
    } finally {
      setUpdating(false);
    }
  };

  // ── Submit spare part request to backend ─────────────────────────────────
  const handleSubmitSparePartRequest = async () => {
    if (!task || !sparePartForm.sparePart.trim()) {
      alert('Please enter a spare part name.');
      return;
    }

    // Get logged-in fitter data
    const userRaw = localStorage.getItem('hometown_user');
    if (!userRaw) {
      alert('User session not found. Please log in again.');
      return;
    }
    let user;
    try {
      user = JSON.parse(userRaw);
    } catch {
      alert('Invalid user data.');
      return;
    }

    setSubmittingRequest(true);
    try {
      const payload = {
        ticketId: task._id,
        sparePart: sparePartForm.sparePart.trim(),
        urgency: sparePartForm.urgency,
        requestById: user.id,
        requestByName: user.name,
        reason: sparePartForm.reason.trim() || undefined,
        quantity: sparePartForm.quantity,
      };

      const response = await fetch('http://localhost:5001/api/spare-part-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success && result.data) {
        // Add the new request to local state
        setSpareRequests(prev => [result.data, ...prev]);
        // Optionally add a comment on the ticket (could be automated by backend)
        // Reset form
        setSparePartForm({ sparePart: '', quantity: 1, reason: '', urgency: 'Normal' });
        setShowSparePartForm(false);
      } else {
        alert(result.message || 'Failed to submit spare part request.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Network error while submitting request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 text-sm font-medium">{error || 'Task not found'}</p>
        <button onClick={() => navigate('/fitter-tasks')} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-bold">
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/fitter-tasks')}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.ticketNumber}</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getStatusColor(task.status)}`}>
              {statusLabel(task.status)}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {task.customerName || task.customerMobile}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Customer & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <User size={12} /> Customer
            </p>
            {task.customerName && <p className="text-sm font-bold text-slate-800">{task.customerName}</p>}
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2 mt-1">
              <Phone size={12} className="text-blue-500" />
              {task.customerMobile}
            </p>
            {task.customerEmail && <p className="text-[10px] text-slate-500 mt-1">{task.customerEmail}</p>}
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MapPin size={12} /> Service Address
            </p>
            <p className="text-sm font-bold text-slate-800 leading-relaxed">{formatAddress(task)}</p>
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(formatAddress(task))}`, '_blank')}
              className="mt-2 flex items-center gap-1 text-[9px] font-black text-blue-600 uppercase tracking-widest"
            >
              <Navigation size={10} /> Open in Maps
            </button>
          </div>
        </div>

        {/* Order Details */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Package size={12} /> Order Details
            </h4>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[9px] text-slate-400">Order ID</p>
              <p className="font-bold text-slate-800">{task.productDetails?.orderId || '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Invoice</p>
              <p className="font-mono text-slate-700">{task.productDetails?.invoiceNumber || '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Purchase Date</p>
              <p className="font-medium text-slate-700">
                {task.productDetails?.purchaseDate ? formatDate(task.productDetails.purchaseDate) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400">Amount</p>
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <IndianRupee size={11} /> {formatCurrency(task.productDetails?.amount)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] text-slate-400">Product</p>
              <p className="font-medium text-slate-700">
                {task.productDetails?.productName || task.productDetails?.productCode || '—'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] text-slate-400">Items / Description</p>
              <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                {task.productDetails?.itemDescription || task.description.substring(0, 120) || '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Issue Description */}
        <section className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue / Scope of Work</p>
          <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
        </section>

        {/* Progress Reporting */}
        <section className="space-y-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} /> Progress Reporting
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setUpdateStatus(status)}
                className={`py-2.5 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  updateStatus === status
                    ? 'bg-orange-500 text-white border-orange-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-orange-50'
                }`}
              >
                {statusLabel(status)}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Technical comments, parts used, or issues encountered..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all min-h-[80px]"
          />
          <button
            onClick={handleUpdate}
            disabled={(!updateStatus && !newComment.trim()) || updating}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating && <Loader2 size={14} className="animate-spin" />}
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </section>

        {/* Spare Parts Requests Section */}
        <section className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Material & Parts Requests
            </h4>
            <button
              onClick={() => setShowSparePartForm(!showSparePartForm)}
              className="flex items-center gap-1.5 text-[9px] font-black text-blue-700 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-blue-200"
            >
              {showSparePartForm ? <X size={10} /> : <Plus size={10} />}
              {showSparePartForm ? 'Cancel' : 'Request Parts'}
            </button>
          </div>

          {/* Request Form */}
          {showSparePartForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-2 mb-5"
            >
              <input
                type="text"
                placeholder="Part Name (required) *"
                value={sparePartForm.sparePart}
                onChange={(e) => setSparePartForm({ ...sparePartForm, sparePart: e.target.value })}
                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={sparePartForm.quantity}
                  onChange={(e) => setSparePartForm({ ...sparePartForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-24 bg-white border border-blue-200 rounded-xl px-4 py-3 text-xs outline-none"
                />
                <select
                  value={sparePartForm.urgency}
                  onChange={(e) => setSparePartForm({ ...sparePartForm, urgency: e.target.value as any })}
                  className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3 text-xs outline-none"
                >
                  <option value="Normal">Normal Urgency</option>
                  <option value="Critical">Critical (Job Stalled)</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <textarea
                placeholder="Reason for request (optional)"
                value={sparePartForm.reason}
                onChange={(e) => setSparePartForm({ ...sparePartForm, reason: e.target.value })}
                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-xs outline-none min-h-[60px]"
              />
              <button
                onClick={handleSubmitSparePartRequest}
                disabled={!sparePartForm.sparePart.trim() || submittingRequest}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingRequest && <Loader2 size={14} className="animate-spin" />}
                Submit Request
              </button>
            </motion.div>
          )}

          {/* Existing Requests List */}
          <div className="space-y-2 mt-2">
            {spareRequests.length === 0 ? (
              <p className="text-[10px] text-blue-400 italic font-medium">No spare part requests for this job yet.</p>
            ) : (
              spareRequests.map((req) => (
                <div key={req._id} className="bg-white p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${req.urgency === 'Critical' || req.urgency === 'Emergency' ? 'bg-rose-500' : 'bg-blue-400'}`} />
                      <span className="text-xs font-bold text-slate-700">{req.sparePart}</span>
                      {req.quantity && req.quantity > 1 && (
                        <span className="text-[9px] text-slate-500">x{req.quantity}</span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getRequestStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.reason && (
                    <p className="text-[9px] text-slate-500 mt-1">Reason: {req.reason}</p>
                  )}
                  <p className="text-[8px] text-slate-400 mt-1 flex items-center gap-1">
                    <FileText size={8} /> Requested by: {req.requestByName} · {formatDateTime(req.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};