import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  ShieldCheck,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { API_BASE_URL } from '../config/api';


// ----------------------------------------------------------------------
// STATIC STORE LIST (as provided)
// ----------------------------------------------------------------------
const stores = [
  { siteId: "6346", name: "HT - SILIGURI" },
  { siteId: "6036", name: "HT - Bhubaneshwar Janpath" },
  { siteId: "6139", name: "HT - PATNA-BHAVYA ICONIC TOWER" },
  { siteId: "6150", name: "HT - PUNE-SEASONS MALL-HADAPSAR" },
  { siteId: "6095", name: "HT - Vizag CMR Central Mall" },
  { siteId: "6063", name: "HT - Nashik City Center Mall" },
  { siteId: "6098", name: "HT - GUWAHATI Lachit Nagar" },
  { siteId: "6343", name: "HT - NAGPUR" },
  { siteId: "6357", name: "HT - KOLKATA-DCN MALL" },
  { siteId: "6140", name: "HT - LUCKNOW-GOMTI NAGAR" },
  { siteId: "6144", name: "HT - RAIPUR-LALGANGA" },
  { siteId: "6068", name: "HT - Aurangabad-Prozone Mall" },
  { siteId: "6352", name: "HT - KOL-BHAVANIPUR Homeland" },
  { siteId: "9550", name: "HT - HO MUMBAI" }

];

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  siteId: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewUserForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  siteId: string;
}

// Helper to format role for display
const formatRole = (role: string) => {
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Get badge style based on role
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'ADMIN':
    case 'HO':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'SERVICE_MANAGER':
      return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'WAREHOUSE':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'DELIVERY':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'FITTER':
      return 'bg-rose-50 text-rose-600 border-rose-100';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewUserForm>({
    name: '',
    email: '',
    phone: '',
    role: '',
    siteId: stores[0]?.siteId || ''   // default to first store
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load users. Please check the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create new user via API
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        await fetchUsers(); // refresh list
        setShowModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: '',
          siteId: stores[0]?.siteId || ''
        });
      } else {
        alert(`Creation failed: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users based on role tab and search query
  const filteredUsers = users.filter(user => {
    // Role filter
    if (activeTab !== 'all') {
      if (activeTab === 'Admin' && !['ADMIN', 'HO'].includes(user.role)) return false;
      if (activeTab === 'Store' && user.role !== 'SERVICE_MANAGER') return false;
      if (activeTab === 'Logistics' && !['DELIVERY', 'WAREHOUSE'].includes(user.role)) return false;
      if (activeTab === 'Field' && user.role !== 'FITTER') return false;
    }
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    return user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.siteId.toLowerCase().includes(searchLower);
  });

  // Helper to get status display
  const getStatusDisplay = (isActive: boolean) => {
    return isActive ? { text: 'Active', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' }
      : { text: 'Inactive', icon: XCircle, color: 'bg-slate-100 text-slate-500' };
  };

  // Format last activity (using updatedAt)
  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
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
        <p className="text-red-700">{error}</p>
        <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-red-100 rounded-lg text-xs font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Administration Hub</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 shrink-0 uppercase tracking-wider text-xs"
        >
          <UserPlus size={18} />
          Provision User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters and Tabs */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar">
            {['all', 'Admin', 'Store', 'Logistics', 'Field'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name, email or site ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5">Identified Employee</th>
                <th className="px-6 py-5">Role & Node</th>
                <th className="px-6 py-5">Verification</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Last Activity</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user, idx) => {
                const statusInfo = getStatusDisplay(user.isActive);
                const StatusIcon = statusInfo.icon;
                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                            <Mail size={10} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest mb-1 ${getRoleBadge(user.role)}`}>
                        {formatRole(user.role)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                          <span className="text-[8px] bg-slate-100 px-1 rounded text-slate-400">Site ID</span>
                          {user.siteId}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <MapPin size={10} />
                          {user.siteId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Verified Node</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                        <StatusIcon size={10} />
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">
                      {formatLastActivity(user.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Page 1 of 1</p>
            <div className="h-4 w-[1px] bg-slate-200" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total {filteredUsers.length} Users Found</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-not-allowed">Previous</button>
            <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">Next Page</button>
          </div>
        </div>
      </div>

      {/* Provision User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Provision User</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New System Node Access</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white rounded-lg text-slate-400 transition-colors border border-transparent hover:border-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.doe@hometown.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* SITE ID DROPDOWN - replaced free text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site ID</label>
                    <select
                      required
                      value={formData.siteId}
                      onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium"
                    >
                      {stores.map((store) => (
                        <option key={store.siteId} value={store.siteId}>
                          {store.name} ({store.siteId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => {
                        const selectedRole = e.target.value;

                        console.log(selectedRole); // selected option value

                        setFormData({
                          ...formData,
                          role: selectedRole,
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="STORE_USER">STORE_USER</option>
                      <option value="WAREHOUSE">WAREHOUSE</option>
                      <option value="DELIVERY">DELIVERY</option>
                      <option value="FITTER">FITTER</option>
                    </select>

                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase tracking-[0.1em] text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    {isSubmitting ? 'Provisioning...' : 'Confirm Access Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};