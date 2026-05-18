import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Truck,
  MapPin, 
  Calendar, 
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Navigation,
  X,
  Camera,
  Trash2,
  UploadCloud,
  Loader2,
  Package,
  IndianRupee,
  Mail,
  ArrowLeft,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

type TaskStatus = 'Pending' | 'Out for Delivery' | 'Delivered' | 'Failed';

const mapTicketStatusToTaskStatus = (ticketStatus: string): TaskStatus => {
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

const mapTaskStatusToTicketStatus = (taskStatus: TaskStatus): string => {
  switch (taskStatus) {
    case 'Pending':
      return 'DELIVERY_SCHEDULED';
    case 'Out for Delivery':
      return 'ASSIGNED_TO_DELIVERY';
    case 'Delivered':
      return 'RESOLVED';
    case 'Failed':
      return 'CANCELLED';
    default:
      return 'DELIVERY_SCHEDULED';
  }
};

export const DeliveryTaskUpdate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<TaskStatus | ''>('');
  const [newComment, setNewComment] = useState('');
  const [evidenceImages, setEvidenceImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getLoggedInUser = () => {
    try {
      const raw = localStorage.getItem('hometown_user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`);
      const result = await response.json();
      if (result.success && result.data) {
        setTask(result.data);
      } else {
        setError(result.message || 'Task not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTask();
  }, [id]);

  const uploadImages = async (ticketId: string, files: File[]): Promise<boolean> => {
    if (!files.length) return true;
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('attachments', file));
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.warn('Image upload failed:', err);
      return false;
    }
  };

  const handleUpdate = async () => {
    if (!task || !updateStatus) return;
    setUpdating(true);
    try {
      const newTicketStatus = mapTaskStatusToTicketStatus(updateStatus);
      const user = getLoggedInUser();
      const agentName = user?.name || 'DELIVERY_AGENT';

      let uploadSuccess = true;
      if (evidenceImages.length > 0) {
        uploadSuccess = await uploadImages(task._id, evidenceImages);
      }

      let commentMessage = `Status updated to ${updateStatus} by ${agentName}`;
      if (newComment.trim()) commentMessage += `. Note: ${newComment}`;
      if (evidenceImages.length > 0) {
        commentMessage += ` (Evidence uploaded: ${evidenceImages.length} image(s))`;
        if (!uploadSuccess) commentMessage += ` [Upload failed]`;
      }

      const statusResponse = await fetch(`${API_BASE_URL}/tickets/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newTicketStatus })
      });
      const statusResult = await statusResponse.json();
      if (!statusResult.success) {
        alert(`Failed to update status: ${statusResult.message}`);
        setUpdating(false);
        return;
      }

      await fetch(`${API_BASE_URL}/tickets/${task._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commentMessage, commentedBy: agentName })
      });

      await fetchTask(); // refresh data
      setUpdateStatus('');
      setNewComment('');
      setEvidenceImages([]);
      setImagePreviews([]);
      navigate('/delivery-tasks'); // back to list after successful update
    } catch (err) {
      console.error(err);
      alert('Network error while updating.');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const total = evidenceImages.length + newFiles.length;
    if (total > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setEvidenceImages(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(files));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const formatAddress = (t: Ticket): string => {
    const a = t.serviceAddress;
    if (!a) return t.site || 'No address provided';
    return [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getStatusColor = (status: TaskStatus) => {
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
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 text-sm font-medium">{error || 'Task not found'}</p>
        <button onClick={() => navigate('/delivery-tasks')} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-bold uppercase">
          Back to List
        </button>
      </div>
    );
  }

  const currentStatus = mapTicketStatusToTaskStatus(task.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/delivery-tasks')}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.ticketNumber}</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getStatusColor(currentStatus)}`}>
              {currentStatus}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Delivery Update: {task.customerName || task.customerMobile}
          </h1>
        </div>
      </div>

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
            <MapPin size={12} /> Delivery Address
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
            <Package size={12} /> Order Summary
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
              <IndianRupee size={11} /> {task.productDetails?.amount?.toFixed(2) || '—'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-slate-400">Product / Items</p>
            <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
              {task.productDetails?.itemDescription || task.productDetails?.productName || task.category || '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Update Panel */}
      <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-5">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Clock size={14} /> Update Delivery Status
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {(['Pending', 'Out for Delivery', 'Delivered', 'Failed'] as TaskStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setUpdateStatus(status)}
              className={`py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                updateStatus === status
                  ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-orange-300'
              }`}
              disabled={updating}
            >
              {status}
            </button>
          ))}
        </div>

        <textarea
          placeholder="Add delivery notes / reason for failure / location update..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all min-h-[100px]"
        />

        {/* Evidence Upload */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Camera size={12} /> Upload Evidence (POD / Photos)
            </h5>
            <span className="text-[9px] font-bold text-orange-500 uppercase">Optional</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {imagePreviews.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-100 group shadow-sm">
                <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            {imagePreviews.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 hover:border-orange-300 hover:bg-orange-50/30 transition-all text-slate-400 hover:text-orange-500"
              >
                <UploadCloud size={20} />
                <span className="text-[8px] font-black uppercase">Add</span>
              </button>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
          <p className="text-[9px] text-slate-400 italic">Upload up to 5 images (delivery proof, damage, signature, etc.)</p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={!updateStatus || updating}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {updating && <Loader2 size={14} className="animate-spin" />}
          {updateStatus === 'Delivered' ? 'Mark Delivered & Submit' : 'Confirm Status Update'}
        </button>
      </section>

      {/* Activity Timeline */}
      {task.comments && task.comments.length > 0 && (
        <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Activity Timeline</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {task.comments.slice().reverse().map((comment) => (
              <div key={comment._id} className="flex gap-3 text-xs">
                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5" />
                <div className="flex-1">
                  <p className="text-slate-600 font-medium">{comment.message}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{comment.commentedBy} · {new Date(comment.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};