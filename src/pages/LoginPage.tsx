import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { Navigate } from 'react-router-dom';
import { Home, ShieldCheck, Truck, Wrench, Package, Store, ChevronRight, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const roleOptions = [
    { label: 'Head Office (HO)', role: Role.ADMIN, email: 'kailash.vaishanv@praxisretail.in', description: 'National oversight, analytics, and admin', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Store CSD', role: Role.SERVICE_MANAGER, email: 'htcsd.siliguri@praxisretail.in', description: 'Store grievance handling & ticket creation', icon: Store, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Delivery Agent', role: Role.DELIVERY, email: 'munna.kumar@demo.com', description: 'On-ground dispatch & POD capture', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Fitter / Installation', role: Role.FITTER, email: 'mukesh.kumar@demo.com', description: 'Technical job completion & schedules', icon: Wrench, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Warehouse Ops', role: Role.WAREHOUSE, email: 'rana.ranjit@praxisretail.in', description: 'Inventory management & stock status', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },

  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoggingIn(true);
    setError(null);
    
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password');
      setIsLoggingIn(false);
    }
  };

  const fillCredentials = (opt: typeof roleOptions[0]) => {
    setEmail(opt.email);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200"
      >
        {/* Left Side - Brand & Quick Auth */}
        <div className="md:w-5/12 bg-[#0F172A] p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
               <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                 <Home className="w-6 h-6 text-white" />
               </div>
               <h1 className="text-2xl font-black tracking-tight">HomeTown</h1>
            </div>
            <h2 className="text-4xl font-extrabold mb-6 leading-tight tracking-tighter">
              Samadhan <span className="text-orange-500 italic font-medium text-3xl block mt-1 tracking-widest uppercase">Portal</span>
            </h2>
            
            <div className="space-y-4">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Quick Selection</p>
              <div className="grid gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => fillCredentials(opt)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 transition-all text-left group"
                  >
                    <opt.icon size={16} className={opt.color} />
                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative z-10 pt-10 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Node 8.4.1</span>
            </div>
          </div>

          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-7/12 p-12 bg-white flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Sign In</h3>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest italic">Identity Verification Module</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-bold"
                  >
                    <AlertCircle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. employee@hometown.in"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 group"
                >
                  {isLoggingIn ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>Enter Command Center</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100">
               <div className="flex flex-col items-center gap-4">
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                   Compliance Node Access
                 </p>
                 <div className="flex gap-6">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_Logos_NIKE.png" className="h-4 opacity-10 grayscale" alt="" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-4 opacity-20 grayscale" alt="" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

