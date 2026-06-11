import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Plus, ChevronLeft, ChevronRight, Loader2, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_BASE_URL } from '../config/api';

interface Comment {
  _id: string;
  comment: string;
  commentedBy: string;
  commentedById: string;
  createdAt: string;
  updatedAt: string;
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
  customerInvoice?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  productDetails?: {
    productName?: string;
    productCode?: string;
    orderId?: string;
    invoiceNumber?: string;
    purchaseDate?: string;
  };
  serviceAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}

interface PaginatedResponse {
  success: boolean;
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

export const Tickets: React.FC = () => {
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    store: 'All Stores',
    type: 'All Types',
    status: 'All Statuses',
    date: ''
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  const [exporting, setExporting] = useState(false);
  const [showExportStoreModal, setShowExportStoreModal] = useState(false);
  const [selectedExportStore, setSelectedExportStore] = useState('');

  const getUserContext = useCallback(() => {
    const userDataRaw = localStorage.getItem('hometown_user');
    if (!userDataRaw) {
      throw new Error('User session not found. Please log in again.');
    }
    const userData = JSON.parse(userDataRaw);
    return {
      role: userData.role,
      siteId: userData.siteId,
    };
  }, []);

  const fetchTickets = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const { role, siteId } = getUserContext();

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (role && role.toUpperCase() !== 'ADMIN') {
        if (!siteId) throw new Error('Site ID missing for non‑HO user.');
        params.append('siteId', siteId);
      } else {
        if (filters.store !== 'All Stores') {
          params.append('store', filters.store);
        }
      }

      if (filters.type !== 'All Types') params.append('type', filters.type);
      if (filters.status !== 'All Statuses') params.append('status', filters.status);
      if (filters.date) params.append('date', filters.date);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`);
      const result: PaginatedResponse = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setTickets(result.data);
        setTotalPages(result.totalPages || 1);
        setTotalRecords(result.total || result.data.length);
        setCurrentPage(result.page || page);
      } else {
        setError(result.message || 'Invalid response format from server.');
        setTickets([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to load tickets. Please check if the server is running.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [getUserContext, filters, searchQuery, limit]);

  useEffect(() => {
    setCurrentPage(1);
    fetchTickets(1);
  }, [filters, searchQuery, fetchTickets]);

  // ✅ Client-side search filter
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase().trim();
    return tickets.filter(ticket => {
      return (
        ticket.ticketNumber?.toLowerCase().includes(q) ||
        ticket.customerMobile?.includes(q) ||
        ticket.customerEmail?.toLowerCase().includes(q) ||
        ticket.description?.toLowerCase().includes(q) ||
        ticket.site?.toLowerCase().includes(q) ||
        ticket.category?.toLowerCase().includes(q) ||
        ticket.subCategory?.toLowerCase().includes(q) ||
        ticket.type?.toLowerCase().includes(q)
      );
    });
  }, [tickets, searchQuery]);

  // ✅ Time elapsed helper (hours / days)
  const getTimeElapsed = (dateString: string): string => {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    return formatDate(dateString); // fallback to exact date for older entries
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchTickets(newPage);
    }
  };

  const stores = useMemo(() => {
    const uniqueStores = new Set(tickets.map(t => t.site).filter(Boolean));
    return ['All Stores', ...Array.from(uniqueStores)];
  }, [tickets]);

  const types = useMemo(() => {
    const uniqueTypes = new Set(tickets.map(t => t.type).filter(Boolean));
    return ['All Types', ...Array.from(uniqueTypes)];
  }, [tickets]);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = new Set(tickets.map(t => t.status).filter(Boolean));
   // const commonStatuses = ['OPEN', 'ASSIGNED_TO_STORE_MANAGER', 'ASSIGNED_TO_FITTER', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];
   const commonStatuses = ['OPEN', 'IN_PROGRESS', 'LEAD_LOST','LEAD_CONVERTED','RESOLVED']; 
   commonStatuses.forEach(status => uniqueStatuses.add(status));
    return ['All Statuses', ...Array.from(commonStatuses).sort()];
  }, [tickets]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-600';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-600';
      case 'RESOLVED': return 'bg-green-100 text-green-600';
      case 'ASSIGNED_TO_STORE_MANAGER': return 'bg-purple-100 text-purple-600';
      case 'ASSIGNED_TO_FITTER': return 'bg-orange-100 text-orange-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerDisplay = (ticket: Ticket) => {
    return ticket.customerMobile || ticket.customerEmail || 'N/A';
  };

  const getLatestCommentDetails = (ticket: Ticket): { text: string; by: string; date: string } | null => {
    if (!ticket.comments || ticket.comments.length === 0) return null;
    const lastComment = ticket.comments[ticket.comments.length - 1];
    return {
      text: lastComment.comment || '—',
      by: lastComment.commentedBy || 'Unknown',
      date: formatDate(lastComment.createdAt)
    };
  };

  const getLatestCommentForCSV = (ticket: Ticket): string => {
    const details = getLatestCommentDetails(ticket);
    if (!details) return '—';
    return `${details.text} (${details.by} on ${details.date})`;
  };

  const downloadCSV = (data: Ticket[], filename: string) => {
    if (!data.length) {
      alert('No data to export.');
      return;
    }

    const headers = [
      'Ticket Number', 'Type', 'Category', 'Sub Category', 'Description', 'Status','Duration',
      'Source', 'Site', 'Customer Mobile', 'Customer Email', 'Customer Invoice',
      'Product Name', 'Product Code', 'Order ID', 'Invoice Number', 'Purchase Date',
      'Service Address Line 1', 'Service Address Line 2', 'City', 'State', 'Pincode',
      'Created At', 'Updated At', 'Latest Comment (with author and date)'
    ];

    const rows = data.map(ticket => [
      ticket.ticketNumber || '',
      ticket.type || '',
      ticket.category || '',
      ticket.subCategory || '',
      ticket.description || '',
      ticket.status || '',
      getTimeElapsed(ticket.createdAt),
      ticket.source || '',
      ticket.site || '',
      ticket.customerMobile || '',
      ticket.customerEmail || '',
      ticket.customerInvoice || '',
      ticket.productDetails?.productName || '',
      ticket.productDetails?.productCode || '',
      ticket.productDetails?.orderId || '',
      ticket.productDetails?.invoiceNumber || '',
      ticket.productDetails?.purchaseDate || '',
      ticket.serviceAddress?.line1 || '',
      ticket.serviceAddress?.line2 || '',
      ticket.serviceAddress?.city || '',
      ticket.serviceAddress?.state || '',
      ticket.serviceAddress?.pincode || '',
      formatDate(ticket.createdAt),
      formatDate(ticket.updatedAt),
      getLatestCommentForCSV(ticket)
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchAllForExport = async (storeFilter?: string, customFilters?: Partial<typeof filters>) => {
    const { role, siteId } = getUserContext();
    const params = new URLSearchParams();
    params.append('limit', '10000');

    if (role && role.toUpperCase() !== 'ADMIN') {
      if (!siteId) throw new Error('Site ID missing for non‑HO user.');
      params.append('siteId', siteId);
    } else {
      if (storeFilter && storeFilter !== 'All Stores') {
        params.append('store', storeFilter);
      } else if (customFilters?.store && customFilters.store !== 'All Stores') {
        params.append('store', customFilters.store);
      }
    }

    const typeFilter = customFilters?.type ?? filters.type;
    const statusFilter = customFilters?.status ?? filters.status;
    const dateFilter = customFilters?.date ?? filters.date;
    const searchFilter = searchQuery;

    if (typeFilter && typeFilter !== 'All Types') params.append('type', typeFilter);
    if (statusFilter && statusFilter !== 'All Statuses') params.append('status', statusFilter);
    if (dateFilter) params.append('date', dateFilter);
    if (searchFilter?.trim()) params.append('search', searchFilter.trim());

    const response = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`);
    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    throw new Error(result.message || 'Failed to fetch data for export');
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const allTickets = await fetchAllForExport(undefined);
      downloadCSV(allTickets, `tickets_export_all_${new Date().toISOString().slice(0, 19)}.csv`);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportStoreWise = () => {
    const allStores = Array.from(new Set(tickets.map(t => t.site).filter(Boolean)));
    if (allStores.length === 0) {
      alert('No stores available for export.');
      return;
    }
    setSelectedExportStore(allStores[0]);
    setShowExportStoreModal(true);
  };

  const confirmExportStore = async () => {
    if (!selectedExportStore) {
      alert('Please select a store.');
      return;
    }
    setExporting(true);
    setShowExportStoreModal(false);
    try {
      const storeTickets = await fetchAllForExport(selectedExportStore);
      downloadCSV(storeTickets, `tickets_${selectedExportStore.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 19)}.csv`);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading && currentPage === 1 && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-sm font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grievance Management</h3>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Support Tickets</h1>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 shrink-0 uppercase tracking-wider text-xs"
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Ticket #, Mobile, Email, or Description..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={14} /> Filter
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleExportAll}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Export All
                </button>
                <button
                  onClick={handleExportStoreWise}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Export by Store
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200/50">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Store / Site</label>
                    <select
                      value={filters.store}
                      onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      {stores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ticket Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Created Date</label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr className="text-[10px] font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-5">Ticket ID</th>
                <th className="px-6 py-5">Customer Contact</th>
                <th className="px-6 py-5">Description / Type</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Created</th>
                <th className="px-6 py-5">Time Elapsed</th>
                <th className="px-6 py-5">Latest Comment</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-slate-50">
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 text-sm bg-slate-100">
                    {searchQuery.trim() ? 'No tickets match your search.' : 'No tickets found matching your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const commentDetails = getLatestCommentDetails(ticket);
                  return (
                    <tr
                      key={ticket._id}
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                      className="bg-slate-100 hover:bg-slate-200 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-900">{ticket.ticketNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-bold text-slate-800">{getCustomerDisplay(ticket)}</div>
                        <div className="text-[10px] text-slate-500">{ticket.site || 'No store'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-700 truncate max-w-[200px] group-hover:text-orange-600 transition-colors">
                          {ticket.type} / {ticket.category}
                        </div>
                        <div className="text-[9px] text-slate-500 font-medium">
                          {ticket.description.length > 60 ? ticket.description.substring(0, 60) + '...' : ticket.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">
                        {getTimeElapsed(ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {commentDetails ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-700 truncate max-w-[200px]">{commentDetails.text}</div>
                            <div className="text-[9px] text-slate-500">
                              {commentDetails.by} • {commentDetails.date}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 text-slate-400 hover:text-orange-500 transition-all shadow-sm">
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {searchQuery.trim() 
              ? `Showing ${filteredTickets.length} of ${tickets.length} tickets on page ${currentPage} of ${totalPages}`
              : `Showing ${filteredTickets.length} of ${totalRecords} records | Page ${currentPage} of ${totalPages}`
            }
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {showExportStoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Export Tickets by Store</h3>
              <button onClick={() => setShowExportStoreModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Select Store</label>
                <select
                  value={selectedExportStore}
                  onChange={(e) => setSelectedExportStore(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                >
                  {stores.filter(s => s !== 'All Stores').map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setShowExportStoreModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExportStore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};