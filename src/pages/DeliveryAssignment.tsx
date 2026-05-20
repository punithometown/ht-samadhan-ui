import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Calendar, Clock, User, MapPin, Package, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { API_BASE_URL } from '../config/api';


interface User {
  _id: string;
  name: string;
  phone: string;
  role: string;
  siteId?: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  customerName?: string;
  customerMobile: string;
  address: string;
  orderId: string;
  site: string;
  description: string;
  productDetails?: any;
  siteCode?: string;
}

export const DeliveryAssignment: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch ticket details
        const ticketRes = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
        const ticketData = await ticketRes.json();
        if (!ticketData.success) throw new Error('Ticket not found');

        const t = ticketData.data;
        // Format address
        let address = t.site || 'Address not provided';
        if (t.serviceAddress) {
          const { line1, city, state, pincode } = t.serviceAddress;
          address = [line1, city, state, pincode].filter(Boolean).join(', ');
        }
        let siteId = t.siteCode

        setTicket({
          _id: t._id,
          ticketNumber: t.ticketNumber,
          customerName: t.customerName || t.customerMobile,
          customerMobile: t.customerMobile,
          address,
          orderId: t.productDetails?.orderId || 'N/A',
          site: t.site,
          description: t.description,
          productDetails: t.productDetails,
        });

        // Fetch delivery agents
        const usersRes = await fetch(`${API_BASE_URL}/users`);
        const usersData = await usersRes.json();
        if (usersData.success && Array.isArray(usersData.data)) {
          const deliveryAgents = usersData.data.filter((u: User) => u.role === 'DELIVERY' && u.siteId === siteId);
          setAgents(deliveryAgents);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ticketId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) {
      alert('Please select a delivery agent');
      return;
    }
    if (!scheduledDate) {
      alert('Please select a scheduled date');
      return;
    }
    if (!timeSlot) {
      alert('Please select a time slot');
      return;
    }

    setSubmitting(true);
    try {
      const agent = agents.find(a => a._id === selectedAgent);
      const payload = {
        status: 'DELIVERY_AGENT_ASSIGNED', // or keep 'ASSIGNED_TO_DELIVERY' but add delivery info
        assignedToDeliveryName: agent?.name,
        assignedToDeliveryId: agent?._id,
        isDelivery: true,
        delivery: {
          scheduledDate,
          scheduledTimeSlot: timeSlot,
          assignedTo: agent?.name,
          assignedToId: agent?._id,
        },
      };

      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        navigate('/delivery-management');
      } else {
        alert(`Assignment failed: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700">{error || 'Ticket not found'}</p>
        <button onClick={() => navigate('/delivery-management')} className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-xs font-bold">
          Back to Dispatch
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/delivery-management')}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule Dispatch</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ticket {ticket.ticketNumber}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ticket Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
            <Package size={16} className="text-orange-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Order Summary</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</p>
              <p className="text-sm font-bold text-slate-800">{ticket.customerName}</p>
              <p className="text-xs text-slate-500">{ticket.customerMobile}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Address</p>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>{ticket.address}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
              <p className="text-sm font-mono font-bold text-slate-800">{ticket.orderId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"> Description</p>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">{ticket.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Assignment Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
            <Truck size={16} className="text-cyan-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Dispatch Assignment</h3>
          </div>
          <div className="p-6 space-y-5">
            {/* Delivery Agent */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <User size={10} /> Assign Delivery Agent
              </label>
              <select
                required
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">-- Select Agent --</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} - {agent.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={10} /> Scheduled Date
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Time Slot */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} /> Preferred Time Slot
              </label>
              <select
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">-- Select Slot --</option>
                <option value="09:00-11:00">09:00 – 11:00</option>
                <option value="11:00-13:00">11:00 – 13:00</option>
                <option value="13:00-15:00">13:00 – 15:00</option>
                <option value="15:00-17:00">15:00 – 17:00</option>
                <option value="17:00-19:00">17:00 – 19:00</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-700 hover:to-cyan-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {submitting ? 'Assigning...' : 'Confirm Dispatch Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};