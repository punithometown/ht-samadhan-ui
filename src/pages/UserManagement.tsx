import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role } from '../types';

export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Users state
  const [users, setUsers] = useState<any[]>([]);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: Role.STORE_CSD,
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      // Transform API users to match component structure if needed
      // Assuming API returns array of user objects with name, email, role, etc.
      setUsers(data.map((u: any) => ({
        id: u.id || u._id,
        name: u.name,
        email: u.email,
        role: mapRoleToEnum(u.role),
        location: u.location || 'Not specified',
        status: u.status || 'Active',
        lastLogin: u.lastLogin || 'Never',
      })));
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  // Map API role string to Role enum
  const mapRoleToEnum = (roleStr: string): Role => {
    switch (roleStr?.toUpperCase()) {
      case 'HO': return Role.HO;
      case 'STORE_CSD': return Role.STORE_CSD;
      case 'WAREHOUSE': return Role.WAREHOUSE;
      case 'DELIVERY': return Role.DELIVERY;
      case 'FITTER': return Role.FITTER;
      default: return Role.STORE_CSD;
    }
  };

  // Map Role enum to API role string
  const mapEnumToRole = (role: Role): string => {
    return role; // Role enum values already match API expectation (e.g., "HO", "STORE_CSD")
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role: Role) => {
    switch(role) {
      case Role.HO: return 'bg-blue-50 text-blue-600 border-blue-100';
      case Role.STORE_CSD: return 'bg-orange-50 text-orange-600 border-orange-100';
      case Role.WAREHOUSE: return 'bg-purple-50 text-purple-600 border-purple-100';
      case Role.DELIVERY: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case Role.FITTER: return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  // Filter users based on tab, search
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    if (activeTab === 'HO') {
      filtered = filtered.filter(user => user.role === Role.HO);
    } else if (activeTab === 'Field') {
      filtered = filtered.filter(user => user.role !== Role.HO);
    } else if (activeTab === 'Inactive') {
      filtered = filtered.filter(user => user.status === 'Inactive');
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [users, activeTab, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleAddUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        role: mapEnumToRole(newUser.role),
      };
      const response = await fetch('http://localhost:5001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create user');
      }
      const createdUser = await response.json();
      // Add new user to local state with transformed structure
      setUsers(prev => [{
        id: createdUser.id || createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: mapRoleToEnum(createdUser.role),
        location: createdUser.location || 'Not specified',
        status: createdUser.status || 'Active',
        lastLogin: 'Never',
      }, ...prev]);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: Role.STORE_CSD });
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Administration Hub</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 shrink-0 uppercase tracking-wider text-xs"
        >
          <UserPlus size={18} />
          Provision User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters and Tabs */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 bg-slate-50/30">
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-full lg:w-auto">
            {['all', 'HO', 'Field', 'Inactive'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`flex-1 lg:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab 
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
                  placeholder="Search name or email..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
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
          {fetching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">Error: {error}</div>
          ) : (
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
                {paginatedUsers.map((user, idx) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
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
                         {user.role.replace('_', ' ')}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                         <MapPin size={10} />
                         {user.location}
                      </div>
                     </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Verified Node</span>
                       </div>
                     </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                         user.status === 'Inactive' ? 'bg-slate-100 text-slate-500' : 
                         'bg-orange-100 text-orange-700'
                       }`}>
                          {user.status === 'Active' ? <CheckCircle2 size={10} /> : 
                           user.status === 'Inactive' ? <XCircle size={10} /> : 
                           <Clock size={10} />}
                          {user.status}
                       </span>
                     </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">
                      {user.lastLogin}
                     </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                         <MoreVertical size={16} />
                      </button>
                     </td>
                  </motion.tr>
                ))}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No users found matching your criteria.
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/10 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 Page {currentPage} of {totalPages || 1}
               </p>
               <div className="h-4 w-[1px] bg-slate-200" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 Total {filteredUsers.length} User{filteredUsers.length !== 1 ? 's' : ''} Found
               </p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} className="inline mr-1" />
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={14} className="inline ml-1" />
              </button>
           </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Provision New User</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="e.g., Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="user@company.in"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="********"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    {Object.values(Role).map(role => (
                      <option key={role} value={role}>{role.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-slate-100 bg-slate-50/30">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={loading || !newUser.name || !newUser.email || !newUser.phone || !newUser.password}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};