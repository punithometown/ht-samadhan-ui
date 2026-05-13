import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Layers, Tag, Store, Package, Calendar, FileText, CheckCircle2, Loader2, User, Phone, Mail, UserCircle, MapPin, Building, IndianRupee, Box } from 'lucide-react';
import { motion } from 'motion/react';

// ----------------------------------------------------------------------
// TICKET CLASSIFICATION DATA (from your Excel)
// ----------------------------------------------------------------------
const TICKET_CLASSIFICATION: Record<string, Record<string, string[]>> = {
  Complaint: {
    BILLING: ["Cash Back / Procession Fee / Finance", "Excess Charged / Price Issue", "Pending Refund"],
    "Damaged Material Delivered": ["Chip Off / Scratches", "Crack / Breakage /Bend", "Delivery Returned as damaged", "Dusty / Dirty Product", "Glass /Mirror Broken", "Marble Damage", "Tear / Open Stitches"],
    "Defective Material Delivered": ["chromium Plating / Lamination /Lazar issue", "Color variance in product", "Mechanism not working", "Other Manufacturing Defect", "Size mismatch / groove mismatch", "solid wood joint open / Crack"],
    "Delivery Pending": ["Delivery Stock YES", "Delivery Stock NO"],
    "Hardware parts missing": ["Hardware Missing"],
    "Installation / Fitment Date elapsed": ["48 hour elapsed"],
    "Service Request - After Warranty": ["Loose / Align / Laser / Polish", "Rusting", "Fabric - Sagging / Stitches coming out /Peel off", "Fungus / Termite", "Crack / Bend / Breakage / Peel Off", "Part Not Working"]
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
  }
};

const TICKET_TYPES = ["Complaint", "Request", "Query", "CRF"];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Store list fetched from /api/users
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

  // Assignment to Store (using siteId as identifier)
  const [assignedSiteId, setAssignedSiteId] = useState("");
  const [assignedStoreName, setAssignedStoreName] = useState("");

  // Order Details (extended)
  const [orderId, setOrderId] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  // Service Address
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Hidden/backend defaults
  const [commentedById] = useState("67f8a2c3e4b0d5a1b2c3d4e5");
  const [commentedBy] = useState("Support Agent");

  const availableCategories = TICKET_CLASSIFICATION[selectedType] ? Object.keys(TICKET_CLASSIFICATION[selectedType]) : [];
  const availableSubcategories = selectedCategory ? TICKET_CLASSIFICATION[selectedType]?.[selectedCategory] || [] : [];

  // Fetch stores from /api/users
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/users');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setStores(data.data);
        } else {
          console.warn('Unexpected API response format, using fallback');
          setStores([]);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
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

    // Validation
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
    if (!customerName.trim()) {
      alert('Customer name is required');
      setSubmitting(false);
      return;
    }

    // Build payload matching backend schema
    const payload = {
      type: selectedType,
      category: selectedCategory,
      subCategory: selectedSubcategory,
      description,
      customer: "",
      source: "WEB_APP",
      site: assignedStoreName,
      siteCode: assignedSiteId,
      assignedStore: {
        id: assignedSiteId,
        name: assignedStoreName,
      },
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
    };

    try {
      const response = await fetch('http://localhost:5001/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText size={12} /> Description / Issue Details <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed explanation of the issue, request, or query..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 outline-none"
              />
            </div>
          </div>
        </motion.section>

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
                <input
                  type="tel"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20"
                  required
                />
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

        {/* SECTION 3: ORDER DETAILS (extended) */}
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
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <IndianRupee size={12} /> Order Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Box size={12} /> Item Description
                </label>
                <textarea
                  rows={2}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Product name, SKU, quantity, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-orange-500/20"
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
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} /> Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>
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

        {/* CREATE TICKET BUTTON AT BOTTOM */}
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