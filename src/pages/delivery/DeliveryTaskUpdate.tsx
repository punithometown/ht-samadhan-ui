import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, Calendar, Phone, CheckCircle2, Clock,
  AlertCircle, Navigation, Camera, Trash2, UploadCloud,
  Loader2, Package, IndianRupee, ArrowLeft, User,
  ShieldCheck, RefreshCw, Mail, XCircle, FileText
} from 'lucide-react';

import { API_BASE_URL } from '../../config/api';

/* ─── Types ─────────────────────────────────────────────────── */
interface Comment {
  _id: string;
  comment: string;
  commentedBy: string;
  commentedById:string; // ID of the commenter (agent)
  createdAt: string;
  status: string; // Ticket status at the time of comment
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
  comments?: Comment[];
  attachments?: any[];
}

type TaskStatus = 'Pending' | 'Out for Delivery' | 'Delivered' | 'Failed';

/* ─── Mappers ────────────────────────────────────────────────── */
const mapTicketStatusToTaskStatus = (s: string): TaskStatus => {
  switch (s) {
    case 'DELIVERY_PENDING':   return 'Pending';
    case 'IN_TRANSIT': return 'Out for Delivery';
    case 'RESOLVED':               return 'Delivered';
    case 'CANCELLED':            return 'Failed';
    default:                     return 'Pending';
  }
};

const mapTaskStatusToTicketStatus = (s: TaskStatus): string => {
  switch (s) {
    case 'Pending':          return 'DELIVERY_PENDING';
    case 'Out for Delivery': return 'IN_TRANSIT';
    case 'Delivered':        return 'RESOLVED';
    case 'Failed':           return 'CANCELLED';
    default:                 return 'DELIVERY_SCHEDULED';
  }
};

/* ─── Helpers ────────────────────────────────────────────────── */
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const maskEmail = (email: string) => {
  const [user, domain] = email.split('@');
  return user.slice(0, 2) + '***@' + domain;
};

const failureReasons = [
  'Customer not available',
  'Wrong address',
  'Access denied / gated community',
  'Payment not ready',
  'Item damaged in transit',
  'Refused delivery',
];

/* ─── Status config ──────────────────────────────────────────── */
const STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  icon: React.ReactNode;
  pill: string;
  btnActive: string;
  dot: string;
}> = {
  Pending: {
    label: 'Pending',
    icon: <Clock size={14} />,
    pill: 'bg-amber-50 text-amber-700 border border-amber-200',
    btnActive: 'bg-amber-500 text-white border-amber-600 shadow-amber-100 shadow-md',
    dot: 'bg-amber-400',
  },
  'Out for Delivery': {
    label: 'Out for Delivery',
    icon: <Truck size={14} />,
    pill: 'bg-blue-50 text-blue-700 border border-blue-200',
    btnActive: 'bg-blue-600 text-white border-blue-700 shadow-blue-100 shadow-md',
    dot: 'bg-blue-500',
  },
  Delivered: {
    label: 'Delivered',
    icon: <CheckCircle2 size={14} />,
    pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    btnActive: 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-100 shadow-md',
    dot: 'bg-emerald-500',
  },
  Failed: {
    label: 'Failed',
    icon: <XCircle size={14} />,
    pill: 'bg-rose-50 text-rose-700 border border-rose-200',
    btnActive: 'bg-rose-600 text-white border-rose-700 shadow-rose-100 shadow-md',
    dot: 'bg-rose-500',
  },
};

/* ─── OTP Panel ──────────────────────────────────────────────── */
interface OtpPanelProps {
  email: string;
  verified: boolean;
  onVerified: () => void;
}

const OtpPanel: React.FC<OtpPanelProps> = ({ email, verified, onVerified }) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!sent) handleSend();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      // Replace with your real OTP send endpoint:
      // await fetch(`${API_BASE_URL}/otp/send`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
      await new Promise(r => setTimeout(r, 800)); // Simulated
      setSent(true);
      setResendTimer(30);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDigit = (val: string, idx: number) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = d;
    setDigits(next);
    setError('');
    if (d && idx < 3) inputRefs.current[idx + 1]?.focus();
    if (next.every(x => x !== '') && next.join('').length === 4) {
      verifyOtp(next.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      // Replace with your real OTP verify endpoint:
      // const res = await fetch(`${API_BASE_URL}/otp/verify`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, otp: code }) });
      // const data = await res.json();
      // if (!data.success) throw new Error(data.message);
      await new Promise(r => setTimeout(r, 400)); // Simulated — accepts any 4 digits
      onVerified();
    } catch {
      setError('Incorrect OTP. Please try again.');
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-medium">
        <CheckCircle2 size={16} className="shrink-0" />
        Customer identity verified via OTP
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">OTP verification required</p>
          <p className="text-xs text-blue-600 mt-0.5">
            {sent ? <>OTP sent to <span className="font-medium">{maskEmail(email)}</span></> : 'Sending OTP to customer email…'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigit(e.target.value, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            className="w-11 h-11 text-center text-lg font-bold border-2 rounded-lg bg-white focus:outline-none focus:border-blue-500 transition-colors"
            style={{ borderColor: error ? '#f43f5e' : d ? '#3b82f6' : '#bfdbfe' }}
          />
        ))}
        <button
          onClick={handleSend}
          disabled={sending || resendTimer > 0}
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-lg px-3 py-2 disabled:opacity-50 hover:bg-blue-50 transition-colors"
        >
          {sending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <p className="text-[10px] text-blue-500 italic">Enter the 4-digit OTP sent to the customer's registered email</p>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
export const DeliveryTaskUpdate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [comment, setComment] = useState('');
  const [failReason, setFailReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Get logged in user details ── */
  const getLoggedInUser = () => {
    try { return JSON.parse(localStorage.getItem('hometown_user') || 'null'); } catch { return null; }
  };

  const getLoggedInUserId = () => {
    const user = getLoggedInUser();
    return user?._id || user?.id || null;
  };

  /* ── Fetch ── */
  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tickets/${id}`);
      const data = await res.json();
      if (data.success && data.data) setTask(data.data);
      else setError(data.message || 'Task not found');
    } catch {
      setError('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchTask(); }, [id]);

  /* ── Status select ── */
  const handleSelectStatus = (s: TaskStatus) => {
    setSelectedStatus(s);
    setOtpVerified(false);
    setSuccessMsg('');
    if (s !== 'Delivered') {
      setEvidenceFiles([]);
      setPreviews([]);
    }
    if (s !== 'Failed') {
      setFailReason('');
      setCustomReason('');
    }
  };

  /* ── Images ── */
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const available = 5 - evidenceFiles.length;
    const toAdd = files.slice(0, available);
    setEvidenceFiles(p => [...p, ...toAdd]);
    setPreviews(p => [...p, ...toAdd.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setEvidenceFiles(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
    // If all images removed, reset OTP verification
    if (evidenceFiles.length === 1) {
      setOtpVerified(false);
    }
  };

  /* ── Submit ── */
  const canSubmit = (): boolean => {
    if (!selectedStatus) return false;
    if (selectedStatus === 'Delivered' && !otpVerified) return false;
    if (selectedStatus === 'Delivered' && evidenceFiles.length === 0) return false;
    if (selectedStatus === 'Failed' && !failReason && !customReason) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!task || !selectedStatus || !canSubmit()) return;
    setUpdating(true);
    try {
      const user = getLoggedInUser();
      const userId = getLoggedInUserId();
      const agentName = user?.name || 'Delivery Agent';
      const newTicketStatus = mapTaskStatusToTicketStatus(selectedStatus);

      // Build failure reason text if applicable
      const reasonText = failReason || customReason;
      
      // User's typed comment (optional)
      const userCommentText = comment.trim();
      
      // Message field as per required format
      const messageText = `Status changed to ${selectedStatus}`;
      
      // Build comment field with additional details (failure reason, image count, OTP)
      let additionalDetails = [];
      if (selectedStatus === 'Failed' && reasonText) additionalDetails.push(`Reason: ${reasonText}`);
      if (selectedStatus === 'Delivered' && otpVerified) additionalDetails.push('OTP verified');
      if (evidenceFiles.length > 0) additionalDetails.push(`${evidenceFiles.length} proof image(s) attached`);
      
      const finalComment = userCommentText 
        ? `${userCommentText}. ${additionalDetails.join('. ')}`
        : additionalDetails.join('. ') || `Ticket updated with status ${selectedStatus}`;

      const formData = new FormData();
      // Required fields for the comment structure
      formData.append('status', newTicketStatus);
      formData.append('commentedBy', agentName);
      if (userId) formData.append('commentedById', userId);
      formData.append('message', messageText);
      formData.append('comment', finalComment);
      
      // Additional fields for backend processing
      if (selectedStatus === 'Delivered') formData.append('isDeliveryDone', 'true');
      if (selectedStatus === 'Failed' && reasonText) formData.append('failureReason', reasonText);
      
      // Attach images
      evidenceFiles.forEach(f => formData.append('attachments', f));

      const res = await fetch(`${API_BASE_URL}/tickets/${task._id}`, {
        method: 'PUT',
        body: formData,
      });
      const result = await res.json();
      if (!result.success) {
        alert(`Update failed: ${result.message}`);
        setUpdating(false);
        return;
      }

      setSuccessMsg(`Delivery status updated to "${selectedStatus}" successfully.`);
      setTimeout(() => navigate('/delivery-tasks'), 1500);
    } catch {
      alert('Network error while updating. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatAddress = (t: Ticket): string => {
    const a = t.serviceAddress;
    if (!a) return t.site || 'No address provided';
    return [a.line1, a.line2, a.landmark, a.city, a.state, a.pincode].filter(Boolean).join(', ');
  };

  /* ─── Loading / Error states ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm">Loading delivery task…</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-semibold">{error || 'Task not found'}</p>
        <button
          onClick={() => navigate('/delivery-tasks')}
          className="mt-5 px-5 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-sm font-semibold transition-colors"
        >
          Back to tasks
        </button>
      </div>
    );
  }

  const currentStatus = mapTicketStatusToTaskStatus(task.status);
  const cfg = STATUS_CONFIG[currentStatus];

  /* ─── Render ─── */
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">

      {/* ── Header ── */}
      <div className="flex items-start gap-3 pt-2">
        <button
          onClick={() => navigate('/delivery-tasks')}
          className="mt-1 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              {task.ticketNumber}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}>
              {cfg.icon} {currentStatus}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 truncate">
            {task.customerName || task.customerMobile}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{task.category} · {task.subCategory}</p>
        </div>
      </div>

      {/* ── Customer card ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
            <User size={10} /> Customer
          </p>
          {task.customerName && (
            <p className="text-sm font-bold text-slate-800">{task.customerName}</p>
          )}
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-1">
            <Phone size={12} className="text-blue-400 shrink-0" />
            {task.customerMobile}
          </p>
          {task.customerEmail && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <Mail size={10} className="shrink-0" />
              {task.customerEmail}
            </p>
          )}
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
            <Calendar size={10} className="shrink-0" />
            Scheduled: {fmtDate(task.createdAt)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
            <MapPin size={10} /> Delivery address
          </p>
          <p className="text-xs font-medium text-slate-700 leading-relaxed">
            {formatAddress(task)}
          </p>
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(formatAddress(task))}`, '_blank')}
            className="mt-3 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Navigation size={10} /> Open in Maps
          </button>
        </div>
      </div>

      {/* ── Order summary ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Package size={11} /> Order summary
          </p>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[9px] text-slate-400 mb-0.5">Order ID</p>
            <p className="font-bold text-slate-800">{task.productDetails?.orderId || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 mb-0.5">Invoice</p>
            <p className="font-mono text-xs text-slate-700">{task.productDetails?.invoiceNumber || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 mb-0.5">Purchase date</p>
            <p className="font-medium text-slate-700 text-xs">
              {task.productDetails?.purchaseDate ? fmtDate(task.productDetails.purchaseDate) : '—'}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 mb-0.5">Amount</p>
            <p className="font-bold text-slate-800 flex items-center gap-0.5">
              <IndianRupee size={11} />
              {task.productDetails?.amount != null ? task.productDetails.amount.toFixed(2) : '—'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-slate-400 mb-1">Product / items</p>
            <p className="text-xs text-slate-700 bg-slate-50 rounded-xl p-2.5 leading-relaxed border border-slate-100">
              {task.productDetails?.itemDescription || task.productDetails?.productName || task.category || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Update panel ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <RefreshCw size={11} /> Update delivery status
        </p>

        {/* Status buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => {
            const c = STATUS_CONFIG[s];
            const active = selectedStatus === s;
            return (
              <button
                key={s}
                onClick={() => handleSelectStatus(s)}
                disabled={updating}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wide border-2 transition-all duration-150 ${
                  active
                    ? c.btnActive
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {c.icon} {c.label}
              </button>
            );
          })}
        </div>

        {/* ── Delivered section: POD images first, then OTP ── */}
        {selectedStatus === 'Delivered' && (
          <>
            {/* Proof of delivery - Required first */}
            <div className="space-y-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Camera size={11} /> Proof of delivery
                <span className="ml-auto text-rose-500 normal-case font-semibold text-[10px]">Required</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={src} alt="Proof" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {previews.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    <UploadCloud size={18} />
                    <span className="text-[9px] font-bold uppercase">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageAdd}
              />
              <p className="text-[9px] text-slate-400">
                Upload up to 5 images — signed receipt, delivered parcel, customer photo, etc.
              </p>
            </div>

            {/* OTP panel - Only shown after at least one POD image is uploaded */}
            {evidenceFiles.length > 0 ? (
              task.customerEmail && (
                <OtpPanel
                  email={task.customerEmail}
                  verified={otpVerified}
                  onVerified={() => setOtpVerified(true)}
                />
              )
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm font-medium">
                <AlertCircle size={16} className="shrink-0" />
                Please upload at least one proof of delivery image to enable OTP verification
              </div>
            )}
          </>
        )}

        {/* Failure reason — only for Failed */}
        {selectedStatus === 'Failed' && (
          <div className="space-y-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <AlertCircle size={11} /> Reason for failure
              <span className="ml-auto text-rose-500 normal-case font-semibold text-[10px]">Required</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {failureReasons.map(r => (
                <button
                  key={r}
                  onClick={() => { setFailReason(r === failReason ? '' : r); setCustomReason(''); }}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                    failReason === r
                      ? 'bg-rose-500 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type a custom reason…"
              value={customReason}
              onChange={e => { setCustomReason(e.target.value); setFailReason(''); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all"
            />
          </div>
        )}

        {/* Comment */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <FileText size={11} /> Comment / delivery note
          </p>
          <textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add delivery notes, location details, customer instructions, or any other relevant information…"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
          />
        </div>

        {/* Validation hint */}
        {selectedStatus && !canSubmit() && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-amber-700 text-xs font-medium">
            <AlertCircle size={13} className="shrink-0" />
            {selectedStatus === 'Delivered' && evidenceFiles.length === 0 && 'Upload at least one proof of delivery photo.'}
            {selectedStatus === 'Delivered' && evidenceFiles.length > 0 && !otpVerified && 'Verify OTP before marking delivered.'}
            {selectedStatus === 'Failed' && !failReason && !customReason && 'Select or enter a reason for delivery failure.'}
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={15} className="shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit() || updating}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            selectedStatus === 'Failed'
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200'
              : selectedStatus === 'Delivered'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200'
          }`}
        >
          {updating && <Loader2 size={15} className="animate-spin" />}
          {!selectedStatus
            ? 'Select a status to continue'
            : selectedStatus === 'Delivered'
            ? 'Mark as Delivered'
            : selectedStatus === 'Failed'
            ? 'Mark as Failed'
            : `Confirm — ${selectedStatus}`}
        </button>
      </div>

      {/* ── Activity timeline ── */}
      {task.comments && task.comments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">
            Activity timeline
          </p>
          <div className="relative space-y-0">
            {task.comments.slice().reverse().map((c, i, arr) => (
              <div key={c._id} className="flex gap-3 pb-4 relative">
                {i < arr.length - 1 && (
                  <div className="absolute left-[5px] top-3 bottom-0 w-px bg-slate-100" />
                )}
                <div className="shrink-0 mt-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-white relative z-10" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed">{c.commentedBy} · {fmtDateTime(c.createdAt)}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {c.comment} {c.status&& <span className="ml-2 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-xs">{c.status}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};