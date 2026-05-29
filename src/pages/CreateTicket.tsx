import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Layers, Tag, Store, Package, Calendar,
  FileText, CheckCircle2, Loader2, User, Phone, Mail,
  UserCircle, MapPin, Building, IndianRupee, Box, Globe, AlertCircle, ChevronDown, X
} from 'lucide-react';
import { motion } from 'motion/react';

import { API_BASE_URL } from '../config/api';

// ----------------------------------------------------------------------
// TICKET CLASSIFICATION DATA (unchanged)
// ----------------------------------------------------------------------
const TICKET_CLASSIFICATION: Record<string, Record<string, string[]>> = {
  Complaint: {
    BILLING: ["Cash Back / Procession Fee / Finance", "Excess Charged / Price Issue", "Pending Refund"],
    "Damaged Material Delivered": ["Chip Off / Scratches", "Crack / Breakage /Bend", "Delivery Returned as damaged", "Dusty / Dirty Product", "Glass /Mirror Broken", "Marble Damage", "Tear / Open Stitches"],
    "Defective Material Delivered": ["chromium Plating / Lamination /Lazar issue", "Color variance in product", "Mechanism not working", "Other Manufacturing Defect", "Size mismatch / groove mismatch", "solid wood joint open / Crack"],
    "Delivery Pending": ["Delivery Stock YES", "Delivery Stock NO"],
    "Hardware parts missing": ["Hardware Missing"],
    "Installation / Fitment Date elapsed": ["48 hour elapsed"],
    "Service Request - After Warranty": ["Loose / Align / Laser / Polish", "Rusting", "Fabric - Sagging / Stitches coming out /Peel off", "Fungus / Termite", "Crack / Bend / Breakage / Peel Off", "Part Not Working"],
    "Service Request - Under Warranty": ["Loose / Align / Laser / Polish", "Rusting", "Fabric - Sagging / Stitches coming out /Peel off", "Fungus / Termite", "Crack / Bend / Breakage / Peel Off", "Part Not Working"]
  },
  Request: {
    BEHAVIOUR: ["Call Center Agent", "Delivery Person", "Fitter/Technician", "Store Staff", "Tips asked"],
    "Customer Request": ["24 Hours Cancellation", "Email Id / Number / Address Update", "GST Update", "Wants assembly/Dismantling", "Wants Duplicate Bill", "Wants to Reschedule Delivery", "Wants to Reschedule Fitment"]
  },
  Query: {
    "Complaint Closure Confirmation call": ["Answered - Call Back Later", "Case Closed - Customer Happy", "Case Re Open - Customer Not Happy"],
    "General Enquiry": ["Blank Call", "Blank Chat", "Duplicate Case"],
    Information: ["Information about product/promotion/serv", "Information about Storloc/Timings/ContNo"],
    Lead: ["Hot", "Warm"],
    "Order Related": ["Cancellation", "Confirm Date-Time of Delivery", "Confirm Date-Time of Installation/Fitment", "Refund"],
    "Outbound call": ["Abandon Call – Recalled", "Complaint Closure Confirmation Call", "CSAT Call", "Status Update call to Customer- Answered", "Status Update call to Customer- Call Back Later", "Status Update call to Customer- UnAnswered"],
    "Promotional Gift Voucher": ["Terms and Conditions (TnC)"]
  },
  CRF: {
    "Damage Material Delivered": ["Crack / Breakage /Bend", "Dusty / Dirty Product", "Glass /Mirror Broken", "Damage during fitment", "solid wood joint open / Crack", "chromium Plating / Lamination /Lazar issue", "Stitches/Peeling off", "Delivery Returned as damaged"],
    "Defective Material Delivered": ["Shade Variance", "Mechanism not working", "Rusting", "Size mismatch / groove mismatch", "Other Manufacturing Defect"],
    "Hardware Missing": ["Part Missing", "Full Hardware Missing"],
    "Service Request - After Warranty": ["Fungus / Termite", "Crack / Breakage /Bend/Scratches", "Fabric - Sagging / Stitches coming out /Peel off", "Mechanism not working", "Rusting"],
    "Service Request - Under Warranty": ["Fungus / Termite", "Crack / Breakage /Bend/Scratches", "Fabric - Sagging / Stitches coming out /Peel off", "Mechanism not working", "Rusting"],
    "CRF Fitment": ["CRF Part Fitment"]
  },
  Installation: {
    "Installation Delay": ["Customer Not Available", "Fitter Not Available", "Customer Asked to Reschedule", "Other"],
    "Installation Quality": ["Fitter Arrived Late", "Fitter Behavior Issue", "Installation Not Proper", "Damage During Installation", "Other"],
    "Installation Inquiry": ["Installation Process", "Installation Charges", "Reschedule Installation", "Other"]
  }
};

const TICKET_TYPES = ["Complaint", "Request", "Query", "CRF"];
const SOURCE_OPTIONS = ["WEB_APP", "MOBILE_APP", "EMAIL", "WHATSAPP", "CALL_CENTER", "STORE"];

// ----------------------------------------------------------------------
// Article type returned from API (array of these object)
// ----------------------------------------------------------------------
interface ArticleItem {
  article?: string;
  description?: string;
  billedQuantity?: number;
  mcName?: string;
  lob?: string;
  newLob?: string;
  salesDocument?: string;
  billingDocument?: string;
  productHierarchy?: string;
  grossSales?: number;
  soldToParty?: string;
  street2?: string;
  street3?: string;
  customerAddress?: string;
  city1?: string;
  postalCode?: string;
  billingDate?: string;
  [key: string]: unknown;
}

// Build a human-readable label for an article item
function articleLabel(item: ArticleItem): string {
  const parts: string[] = [];
  if (item.article) parts.push(item.article);
  if (item.description) parts.push(item.description);
  if (item.billedQuantity !== undefined) parts.push(`Qty: ${item.billedQuantity}`);
  return parts.join(' – ') || 'Unknown Article';
}

// Build full detail string for a selected article
function articleDetail(item: ArticleItem): string {
  const parts: string[] = [];
  if (item.article) parts.push(`Article: ${item.article}`);
  if (item.description) parts.push(`Description: ${item.description}`);
  if (item.billedQuantity !== undefined) parts.push(`Qty: ${item.billedQuantity}`);
  if (item.mcName) parts.push(`MC: ${item.mcName}`);
  if (item.lob) parts.push(`LOB: ${item.lob}${item.newLob ? ' / ' + item.newLob : ''}`);
  if (item.salesDocument) parts.push(`Order: ${item.salesDocument}`);
  if (item.billingDocument) parts.push(`Invoice: ${item.billingDocument}`);
  if (item.productHierarchy) parts.push(`Hierarchy: ${item.productHierarchy}`);
  if (item.billingDate) parts.push(`Billing Date: ${item.billingDate}`);

  return parts.join('\n');
}

// ----------------------------------------------------------------------
// ArticleMultiSelect – dropdown with checkboxes
// ----------------------------------------------------------------------
interface ArticleMultiSelectProps {
  articles: ArticleItem[];
  selectedIndices: number[];
  onChange: (indices: number[]) => void;
}

const ArticleMultiSelect: React.FC<ArticleMultiSelectProps> = ({ articles, selectedIndices, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      onChange(selectedIndices.filter(i => i !== idx));
    } else {
      onChange([...selectedIndices, idx]);
    }
  };

  const selectAll = () => onChange(articles.map((_, i) => i));
  const clearAll = () => onChange([]);

  const label =
    selectedIndices.length === 0
      ? 'Select articles...'
      : selectedIndices.length === articles.length
        ? `All ${articles.length} articles selected`
        : `${selectedIndices.length} of ${articles.length} selected`;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:ring-2 focus:ring-orange-500/20 hover:border-orange-300 transition-all"
      >
        <span className={selectedIndices.length === 0 ? 'text-slate-400' : 'text-slate-700 font-medium'}>
          {label}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Actions row */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{articles.length} articles found</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-orange-600 hover:text-orange-700 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Article list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">

            {articles.map((item, idx) => {
              const checked = selectedIndices.includes(idx);
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50/60 transition-colors ${checked ? 'bg-orange-50/40' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(idx)}
                    className="mt-0.5 accent-orange-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-1200 truncate">{articleLabel(item)}</p>
                    <div className="flex flex-wrap gap-x-3 mt-0.5">
                      {item.lob && (
                        <span className="text-[10px] text-slate-1200">LOB: {item.lob}</span>
                      )}
                      {item.billingDocument && (
                        <span className="text-[10px] text-slate-1200">Invoice: {item.billingDocument}</span>
                      )}
                      {/* {item.grossSales !== undefined && (
                        <span className="text-[10px] text-slate-1200">₹{item.grossSales}</span>
                      )} */}
                      {item.billingDate !== undefined && (
                        <span className="text-[10px] text-slate-4800">Billing Date: {item.billingDate}</span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected chips */}
      {selectedIndices.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedIndices.map(idx => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[11px] font-medium px-2.5 py-1 rounded-full"
            >
              {articles[idx]?.article || `Article ${idx + 1}`}
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="hover:text-orange-900 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  interface StoreUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    siteId: string;
    role: string;
    isActive: boolean;
  }
  const [stores, setStores] = useState<StoreUser[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);

  // Issue Classification
  const [selectedType, setSelectedType] = useState<string>("Complaint");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [description, setDescription] = useState("");

  // Ticket Source
  const [source, setSource] = useState<string>("WEB_APP");

  // Assignment to Store
  const [assignedSiteId, setAssignedSiteId] = useState("");
  const [assignedStoreName, setAssignedStoreName] = useState("");

  // Order Details
  const [orderId, setOrderId] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  // Articles fetched from API
  const [fetchedArticles, setFetchedArticles] = useState<ArticleItem[]>([]);
  const [selectedArticleIndices, setSelectedArticleIndices] = useState<number[]>([]);

  // Service Address
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Order fetching states
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [orderFound, setOrderFound] = useState<boolean | null>(null);
  const [orderSearched, setOrderSearched] = useState(false);

  const getUserFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem("hometown_user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  // Build itemDescription from selected articles
  useEffect(() => {
    if (fetchedArticles.length === 0) return;
    if (selectedArticleIndices.length === 0) {
      setItemDescription('');
      return;
    }
    const combined = selectedArticleIndices
      .map(idx => articleDetail(fetchedArticles[idx]))
      .join('\n\n---\n\n');
    setItemDescription(combined);
  }, [selectedArticleIndices, fetchedArticles]);

  // Fetch order details
  const fetchOrderDetails = async (mobile: string) => {
    setFetchingOrder(true);
    setOrderSearched(true);
    // Reset articles on new search
    setFetchedArticles([]);
    setSelectedArticleIndices([]);
    try {
      const response = await fetch(`${API_BASE_URL}/spare-part-requests/order-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mobile }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        // Support both array and single-object response
        const rawData: ArticleItem[] = Array.isArray(result.data) ? result.data : [result.data];

        setFetchedArticles(rawData);

        // Use first item for order-level fields
        const first = rawData[0];
        setOrderId(first.salesDocument || '');
        setOrderAmount(first.grossSales ? String(first.grossSales) : '');
        setInvoiceNumber(first.billingDocument || '');

        // Customer name
        if (!customerName.trim() && first.soldToParty) {
          setCustomerName(first.soldToParty);
        }

        // Service address from first item
        let addr = '';
        if (first.street2) addr += first.street2;
        if (first.street3) addr += (addr ? ', ' : '') + first.street3;
        if (!addr && first.customerAddress) addr = first.customerAddress;
        setAddressLine(addr);
        setCity(first.city1 || '');
        setPincode(first.postalCode || '');

        setOrderFound(true);
      } else {
        setOrderId('');
        setOrderAmount('');
        setItemDescription('');
        setInvoiceNumber('');
        setAddressLine('');
        setCity('');
        setPincode('');
        setOrderFound(false);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setOrderFound(false);
      setOrderId('');
      setOrderAmount('');
      setItemDescription('');
      setInvoiceNumber('');
      setAddressLine('');
      setCity('');
      setPincode('');
    } finally {
      setFetchingOrder(false);
    }
  };

  useEffect(() => {
    if (customerMobile.length === 10) {
      fetchOrderDetails(customerMobile);
    } else {
      setOrderFound(null);
      setOrderSearched(false);
      setFetchedArticles([]);
      setSelectedArticleIndices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerMobile]);

  const availableCategories = TICKET_CLASSIFICATION[selectedType]
    ? Object.keys(TICKET_CLASSIFICATION[selectedType])
    : [];
  const availableSubcategories = selectedCategory
    ? TICKET_CLASSIFICATION[selectedType]?.[selectedCategory] || []
    : [];

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setStores(data.data.filter((u: any) => u.role === "SERVICE_MANAGER"));
        } else {
          setStores([]);
        }
      } catch {
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleStoreChange = (siteId: string) => {
    const store = stores.find(s => s.siteId === siteId);
    setAssignedSiteId(siteId);
    setAssignedStoreName(store ? store.name : '');
  };

  const isClassificationComplete = selectedType && selectedCategory && selectedSubcategory;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!selectedType || !selectedCategory || !selectedSubcategory) {
      alert('Please complete Type, Category, and Sub-Category');
      setSubmitting(false);
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      setSubmitting(false);
      return;
    }
    if (!assignedSiteId) {
      alert('Please assign a store');
      setSubmitting(false);
      return;
    }
    if (!customerMobile.trim()) {
      alert('Customer mobile number is required');
      setSubmitting(false);
      return;
    }

    if (!customerMobile.trim()) {
      alert('Customer Email is required');
      setSubmitting(false);
      return;
    }

    if (!customerName.trim()) {
      alert('Customer name is required');
      setSubmitting(false);
      return;
    }

    const userData = getUserFromLocalStorage();
    const createdBy = userData?.name || "";
    const createdById = userData?.id || "";
    const createdBystore = userData?.location || userData?.storeName || "";

    const payload = {
      type: selectedType,
      category: selectedCategory,
      subCategory: selectedSubcategory,
      description,
      customer: "",
      source,
      site: assignedStoreName,
      siteCode: assignedSiteId,
      assignedStore: { id: assignedSiteId, name: assignedStoreName },
      customerMobile,
      customerEmail,
      customerName,
      productDetails: {
        orderId: orderId || undefined,
        amount: orderAmount ? parseFloat(orderAmount) : undefined,
        itemDescription: itemDescription || undefined,
        invoiceNumber: invoiceNumber || undefined,
        purchaseDate: purchaseDate || undefined,
      },
      serviceAddress: {
        line1: addressLine || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
      },
      createdBy,
      createdById,
      createdBystore,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        navigate('/tickets');
      } else {
        alert(`Error: ${result.message || 'Failed to create ticket'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Network error. Please check if the server is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 px-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 py-4 -mt-4 px-4 rounded-b-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600 transition-all shadow-sm group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">National Support Node</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Create New Ticket</h1>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* SECTION 1: ISSUE CLASSIFICATION */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-orange-500" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Issue Classification</h2>
              <span className="text-[10px] text-red-500">*Required</span>
            </div>
            {isClassificationComplete && (
              <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-medium bg-emerald-50 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} />
                <span>Complete</span>
              </div>
            )}
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} /> Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500/20"
                >
                  {TICKET_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={!selectedType}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50 disabled:bg-slate-100"
                >
                  <option value="">-- Select Category --</option>
                  {availableCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sub-Category</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50 disabled:bg-slate-100"
                >
                  <option value="">-- Select Sub-Category --</option>
                  {availableSubcategories.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Source Field */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Globe size={12} /> Source / Channel
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500/20"
                >
                  {SOURCE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div> */}
          </div>
        </motion.section>

        {/* SEARCH ORDER BY MOBILE */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
            <User size={16} className="text-orange-500" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Search Order By Mobile</h2>
            <span className="text-[10px] text-red-500">*Required</span>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Phone size={15} /> Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 transition-all pr-10 ${fetchingOrder
                    ? 'border-orange-400 ring-2 ring-orange-500/20'
                    : orderSearched && orderFound === false
                      ? 'border-red-400 ring-2 ring-red-500/20'
                      : 'border-slate-200 focus:ring-orange-500/20'
                    }`}
                  required
                />
                {fetchingOrder && (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" />
                )}
                {!fetchingOrder && orderSearched && orderFound === false && (
                  <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
                )}
              </div>

              {fetchingOrder && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full animate-progress-bar" />
                  </div>
                  <p className="text-[10px] text-orange-600 flex items-center gap-1 mt-1">
                    <Loader2 size={10} className="animate-spin" /> Searching order... (please wait up to 10 seconds)
                  </p>
                </div>
              )}
              {!fetchingOrder && orderSearched && orderFound === false && (
                <p className="text-[10px] text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> No order found – please enter details manually
                </p>
              )}
              {!fetchingOrder && orderSearched && orderFound === true && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 size={10} /> {fetchedArticles.length} article{fetchedArticles.length !== 1 ? 's' : ''} found – select below
                </p>
              )}
            </div>

            {/* Description */}
            {/* <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText size={12} /> Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed explanation of the issue, request, or query..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 outline-none"
              />
            </div> */}
          </div>
        </section>

        {/* SECTION 2: CUSTOMER DETAILS */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
            <User size={16} className="text-orange-500" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Customer Details</h2>
            <span className="text-[10px] text-red-500">*Required</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <UserCircle size={12} /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Rajesh Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Phone size={12} /> Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 transition-all pr-10 ${fetchingOrder
                      ? 'border-orange-400 ring-2 ring-orange-500/20'
                      : orderSearched && orderFound === false
                        ? 'border-red-400 ring-2 ring-red-500/20'
                        : 'border-slate-200 focus:ring-orange-500/20'
                      }`}
                    required
                  />
                  {fetchingOrder && (
                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 animate-spin" />
                  )}
                  {!fetchingOrder && orderSearched && orderFound === false && (
                    <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
                  )}
                </div>
                {fetchingOrder && (
                  <p className="text-[10px] text-orange-600 flex items-center gap-1 mt-1">
                    <Loader2 size={10} className="animate-spin" /> Searching order...
                  </p>
                )}
                {!fetchingOrder && orderSearched && orderFound === false && (
                  <p className="text-[10px] text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle size={10} /> No order found – please enter details manually
                  </p>
                )}
                {!fetchingOrder && orderSearched && orderFound === true && (
                  <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 size={10} /> Order details auto‑filled
                  </p>
                )}
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: ORDER DETAILS */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
            <Package size={16} className="text-orange-500" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Order Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="HT-XXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
             
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-XXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* ---- ARTICLE MULTI-SELECT (shown when articles are available) ---- */}
              {fetchedArticles.length > 0 && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Box size={12} /> Select Articles
                    <span className="ml-1 bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {fetchedArticles.length} found
                    </span>
                  </label>
                  <ArticleMultiSelect
                    articles={fetchedArticles}
                    selectedIndices={selectedArticleIndices}
                    onChange={setSelectedArticleIndices}
                  />
                </div>
              )}

              {/* ---- ITEM DESCRIPTION (auto-filled from selected articles, still editable) ---- */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Box size={12} /> Item Description
                  {selectedArticleIndices.length > 0 && (
                    <span className="text-[10px] text-emerald-600 font-normal ml-1 flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> Auto-filled from {selectedArticleIndices.length} article{selectedArticleIndices.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </label>
                <textarea
                  rows={fetchedArticles.length > 0 ? 8 : 5}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder={
                    fetchedArticles.length > 0
                      ? 'Select articles above to auto-fill, or type manually...'
                      : 'Product details will be auto‑filled after entering mobile number...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-orange-500/20 font-mono"
                />
              </div>

          
            </div>
          </div>

          <div className="space-y-5.5 md:col-span-2 my-4  rounded-2xl p-5 bg-white shadow-sm">           
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileText size={10} /> Description <span className="text-red-500">*</span>
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed explanation of the issue, request, or query..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300"
            />
          </div>

        </section>

        {/* SECTION 4: SERVICE ADDRESS */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
            <MapPin size={16} className="text-orange-500" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Service Address</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building size={12} /> Address Line
                </label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House No., Street, Area"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Mumbai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., Maharashtra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: ASSIGNMENT TO STORE */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
            <Store size={16} className="text-orange-500" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Assignment to Store</h2>
            <span className="text-[10px] text-red-500">*Required</span>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Store size={12} /> Assigned Store
              </label>
              {loadingStores ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
                  <Loader2 size={16} className="animate-spin" /> Loading stores...
                </div>
              ) : (
                <select
                  value={assignedSiteId}
                  onChange={(e) => handleStoreChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-orange-500/20"
                  required
                >
                  <option value="">-- Select Store --</option>
                  {stores.map(store => (
                    <option key={store._id} value={store.siteId}>
                      {store.name} (Site ID: {store.siteId})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </section>

        {/* Classification Preview */}
        {isClassificationComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500 border border-slate-200"
          >
            <span className="font-medium">Classification:</span> {selectedType} &gt; {selectedCategory} &gt; {selectedSubcategory}
          </motion.div>
        )}

        {/* CREATE TICKET BUTTON */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-bold uppercase shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
            {submitting ? 'Creating Ticket...' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </form>
  );
};